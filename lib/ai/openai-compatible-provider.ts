import type { StructuredOutputSchema } from "./output-schemas"
import type { ActiveProviderConfig } from "./provider-config"
import type { AIResponse } from "./types"
import { parseStructuredOutput } from "./response-parser"
import { createAiFailure } from "./response-utils"
import { buildJsonOnlySystemPrompt } from "./structured-output-prompt"

type CallOpenAiCompatibleProviderParams<T> = {
  config: ActiveProviderConfig
  systemPrompt: string
  userPrompt: string
  outputSchema: StructuredOutputSchema<T>
  model?: string
  temperature?: number
  maxTokens?: number
}

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
  error?: {
    message?: string
    code?: string
    type?: string
  }
  usage?: {
    total_tokens?: number
  }
}

export async function callOpenAiCompatibleProvider<T>(
  params: CallOpenAiCompatibleProviderParams<T>
): Promise<AIResponse<T>> {
  const model = params.model ?? params.config.model
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), params.config.timeoutMs)

  try {
    const response = await fetch(params.config.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.config.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(params, model)),
      signal: controller.signal,
    })

    const responseText = await response.text()
    const responseJson = tryParseResponseJson(responseText)

    if (!response.ok) {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        statusCode: response.status,
        code: responseJson.data?.error?.code ?? responseJson.data?.error?.type,
        retryable: response.status >= 500,
        message:
          responseJson.data?.error?.message?.trim() ||
          response.statusText ||
          "The request failed before the model returned a result.",
      })
    }

    if (!responseJson.ok || !responseJson.data) {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        message: "The provider returned an invalid JSON response.",
      })
    }

    const providerError = responseJson.data.error?.message?.trim()
    if (providerError) {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        code: responseJson.data.error?.code ?? responseJson.data.error?.type,
        message: providerError,
        tokensUsed: responseJson.data.usage?.total_tokens,
      })
    }

    const content = responseJson.data.choices?.[0]?.message?.content
    if (!content || typeof content !== "string") {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        message: "The provider did not return any message content.",
        tokensUsed: responseJson.data.usage?.total_tokens,
      })
    }

    return parseStructuredOutput({
      config: params.config,
      model,
      schema: params.outputSchema,
      rawContent: content,
      tokensUsed: responseJson.data.usage?.total_tokens,
    })
  } catch (error) {
    return createAiFailure({
      provider: params.config.provider,
      providerLabel: params.config.providerLabel,
      baseUrl: params.config.baseUrl,
      model,
      retryable: true,
      message: getFetchErrorMessage(error, params.config.timeoutMs),
    })
  } finally {
    clearTimeout(timeout)
  }
}

function buildRequestBody<T>(
  params: CallOpenAiCompatibleProviderParams<T>,
  model: string
) {
  const maxTokens = params.maxTokens ?? 1024
  const requestBody: Record<string, unknown> = {
    model,
    messages: buildMessages(params),
    temperature: params.temperature ?? 0.7,
    response_format: buildResponseFormat(params),
  }

  requestBody[params.config.maxTokensField] = maxTokens

  return requestBody
}

function buildMessages<T>(params: CallOpenAiCompatibleProviderParams<T>) {
  const systemContent =
    params.config.responseFormatMode === "json_object"
      ? buildJsonOnlySystemPrompt(params.systemPrompt, params.outputSchema.schema)
      : params.systemPrompt

  return [
    { role: "system", content: systemContent },
    { role: "user", content: params.userPrompt },
  ]
}

function buildResponseFormat<T>(params: CallOpenAiCompatibleProviderParams<T>) {
  if (params.config.responseFormatMode === "json_object") {
    return { type: "json_object" }
  }

  return {
    type: "json_schema",
    json_schema: {
      name: params.outputSchema.name,
      strict: params.config.jsonSchemaStrict,
      schema: params.outputSchema.schema,
    },
  }
}

function tryParseResponseJson(responseText: string):
  | { ok: true; data: OpenAiCompatibleResponse }
  | { ok: false; data: null } {
  try {
    return {
      ok: true,
      data: JSON.parse(responseText) as OpenAiCompatibleResponse,
    }
  } catch {
    return {
      ok: false,
      data: null,
    }
  }
}

function getFetchErrorMessage(error: unknown, timeoutMs: number) {
  if (error instanceof Error && error.name === "AbortError") {
    return `The request timed out after ${Math.round(timeoutMs / 1000)} seconds.`
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return "We couldn’t reach the AI provider. Check your network and provider settings, then try again."
}
