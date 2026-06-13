import type { StructuredOutputSchema } from "./output-schemas"
import type { ActiveProviderConfig } from "./provider-config"
import type { AIResponse } from "./types"
import { parseStructuredOutput } from "./response-parser"
import { createAiFailure } from "./response-utils"
import { buildJsonOnlySystemPrompt } from "./structured-output-prompt"

type CallMinimaxProviderParams<T> = {
  config: ActiveProviderConfig
  systemPrompt: string
  userPrompt: string
  outputSchema: StructuredOutputSchema<T>
  model?: string
  temperature?: number
  maxTokens?: number
}

type MinimaxResponse = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string; code?: string }
  usage?: { total_tokens?: number }
  base_resp?: {
    status_code?: number
    status_msg?: string
  }
}

export async function callMinimaxProvider<T>(
  params: CallMinimaxProviderParams<T>
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
        code: responseJson.data?.error?.code,
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
        message: "MiniMax returned an invalid JSON response.",
      })
    }

    const providerError = responseJson.data.error?.message?.trim()
    if (providerError) {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        code: responseJson.data.error?.code,
        message: providerError,
        tokensUsed: responseJson.data.usage?.total_tokens,
      })
    }

    const providerStatusCode = responseJson.data.base_resp?.status_code
    const providerStatusMessage = responseJson.data.base_resp?.status_msg?.trim()
    if (providerStatusCode && providerStatusCode !== 0) {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        code: String(providerStatusCode),
        message:
          providerStatusMessage || `MiniMax reported status code ${providerStatusCode}.`,
        tokensUsed: responseJson.data.usage?.total_tokens,
      })
    }

    const content = responseJson.data.choices?.[0]?.message?.content
    if (!content) {
      return createAiFailure({
        provider: params.config.provider,
        providerLabel: params.config.providerLabel,
        baseUrl: params.config.baseUrl,
        model,
        message: "MiniMax did not return any message content.",
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

function buildRequestBody<T>(params: CallMinimaxProviderParams<T>, model: string) {
  return {
    model,
    messages: [
      {
        role: "system",
        name: "MiniMax AI",
        content: buildJsonOnlySystemPrompt(params.systemPrompt, params.outputSchema.schema),
      },
      {
        role: "user",
        name: "user",
        content: params.userPrompt,
      },
    ],
    temperature: params.temperature ?? 0.7,
    max_completion_tokens: params.maxTokens ?? 1024,
  }
}

function tryParseResponseJson(responseText: string):
  | { ok: true; data: MinimaxResponse }
  | { ok: false; data: null } {
  try {
    return {
      ok: true,
      data: JSON.parse(responseText) as MinimaxResponse,
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

  return "We couldn’t reach MiniMax. Check your network and provider settings, then try again."
}
