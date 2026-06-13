import type { StructuredOutputSchema } from "./output-schemas"
import type { ActiveProviderConfig } from "./provider-config"
import type { AIResponse } from "./types"
import { createAiFailure, createAiSuccess } from "./response-utils"

type ParseStructuredOutputParams<T> = {
  config: Pick<ActiveProviderConfig, "provider" | "providerLabel" | "baseUrl">
  model: string
  schema: StructuredOutputSchema<T>
  rawContent: string
  tokensUsed?: number
}

export function parseStructuredOutput<T>(params: ParseStructuredOutputParams<T>): AIResponse<T> {
  const normalizedContent = stripMarkdownCodeFence(params.rawContent)
  const parsedJson = parseJsonObject(normalizedContent)

  if (!parsedJson.ok) {
    return createAiFailure({
      provider: params.config.provider,
      providerLabel: params.config.providerLabel,
      baseUrl: params.config.baseUrl,
      model: params.model,
      message: `${parsedJson.error} The model must return a single JSON object.`,
      tokensUsed: params.tokensUsed,
    })
  }

  const validationResult = params.schema.validate(parsedJson.value)
  if (!validationResult.valid) {
    return createAiFailure({
      provider: params.config.provider,
      providerLabel: params.config.providerLabel,
      baseUrl: params.config.baseUrl,
      model: params.model,
      message: `The response did not match the expected format. ${validationResult.issues.join(" ")}`,
      tokensUsed: params.tokensUsed,
    })
  }

  return createAiSuccess(validationResult.value as T, {
    provider: params.config.provider,
    providerLabel: params.config.providerLabel,
    baseUrl: params.config.baseUrl,
    model: params.model,
    tokensUsed: params.tokensUsed,
  })
}

function stripMarkdownCodeFence(value: string) {
  const trimmedValue = value.trim()
  const codeBlockMatch = trimmedValue.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i)

  return codeBlockMatch ? codeBlockMatch[1].trim() : trimmedValue
}

function parseJsonObject(value: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const directAttempt = safeJsonParse(value)
  if (directAttempt.ok) {
    return directAttempt
  }

  const objectStart = value.indexOf("{")
  const objectEnd = value.lastIndexOf("}")

  if (objectStart >= 0 && objectEnd > objectStart) {
    const extractedObject = value.slice(objectStart, objectEnd + 1)
    const extractedAttempt = safeJsonParse(extractedObject)
    if (extractedAttempt.ok) {
      return extractedAttempt
    }
  }

  return {
    ok: false,
    error: directAttempt.error,
  }
}

function safeJsonParse(value: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return {
      ok: true,
      value: JSON.parse(value),
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The response was not valid JSON.",
    }
  }
}
