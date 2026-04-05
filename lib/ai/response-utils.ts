import type { AIErrorDetails, AIProvider, AIResponse, AIResponseMeta } from "./types"

type CreateAiFailureParams = {
  provider: AIProvider
  providerLabel: string
  model: string
  baseUrl: string
  message: string
  statusCode?: number
  code?: string
  retryable?: boolean
  tokensUsed?: number
}

export function createAiSuccess<T>(data: T, meta: AIResponseMeta): AIResponse<T> {
  return {
    ok: true,
    data,
    meta,
  }
}

export function createAiFailure<T>(params: CreateAiFailureParams): AIResponse<T> {
  const details: AIErrorDetails = {
    provider: params.provider,
    providerLabel: params.providerLabel,
    model: params.model,
    baseUrl: params.baseUrl,
    statusCode: params.statusCode,
    code: params.code,
    retryable: params.retryable,
    tokensUsed: params.tokensUsed,
  }

  return {
    ok: false,
    error: buildAiErrorMessage(details, params.message),
    details,
  }
}

function buildAiErrorMessage(details: AIErrorDetails, message: string) {
  const trimmedMessage = message.trim()
  const location = `${details.providerLabel} (${details.model})`

  if (details.statusCode) {
    return `${location} returned ${details.statusCode}. ${trimmedMessage}`
  }

  return `${location}: ${trimmedMessage}`
}
