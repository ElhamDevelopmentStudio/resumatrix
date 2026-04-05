import type { AIProvider } from "./types"

export type StructuredOutputMode = "json_schema" | "json_object"

type ProviderKind = "minimax" | "openai-compatible"

type ProviderDefaults = {
  provider: AIProvider
  providerLabel: string
  apiKeyEnvName: string
  baseUrlEnvName: string
  modelEnvName: string
  responseFormatEnvName?: string
  jsonSchemaStrictEnvName?: string
  kind: ProviderKind
  baseUrl: string
  model: string
  responseFormatMode: StructuredOutputMode
  jsonSchemaStrict: boolean
  maxTokensField: "max_tokens" | "max_completion_tokens"
}

export type ActiveProviderConfig = {
  provider: AIProvider
  providerLabel: string
  apiKey: string
  apiKeyEnvName: string
  baseUrl: string
  model: string
  kind: ProviderKind
  responseFormatMode: StructuredOutputMode
  jsonSchemaStrict: boolean
  maxTokensField: "max_tokens" | "max_completion_tokens"
  timeoutMs: number
}

const DEFAULT_TIMEOUT_MS = 45_000

const providerDefaults: Record<AIProvider, ProviderDefaults> = {
  minimax: {
    provider: "minimax",
    providerLabel: "MiniMax",
    apiKeyEnvName: "MINIMAX_API_KEY",
    baseUrlEnvName: "MINIMAX_BASE_URL",
    modelEnvName: "MINIMAX_MODEL",
    kind: "minimax",
    baseUrl: "https://api.minimax.io/v1/text/chatcompletion_v2",
    model: "MiniMax-M2.7",
    responseFormatMode: "json_schema",
    jsonSchemaStrict: false,
    maxTokensField: "max_completion_tokens",
  },
  groq: {
    provider: "groq",
    providerLabel: "Groq",
    apiKeyEnvName: "GROQ_API_KEY",
    baseUrlEnvName: "GROQ_BASE_URL",
    modelEnvName: "GROQ_MODEL",
    responseFormatEnvName: "GROQ_RESPONSE_FORMAT",
    jsonSchemaStrictEnvName: "GROQ_JSON_SCHEMA_STRICT",
    kind: "openai-compatible",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "openai/gpt-oss-20b",
    responseFormatMode: "json_schema",
    jsonSchemaStrict: true,
    maxTokensField: "max_completion_tokens",
  },
  nvidia: {
    provider: "nvidia",
    providerLabel: "NVIDIA",
    apiKeyEnvName: "NVIDIA_API_KEY",
    baseUrlEnvName: "NVIDIA_BASE_URL",
    modelEnvName: "NVIDIA_MODEL",
    responseFormatEnvName: "NVIDIA_RESPONSE_FORMAT",
    jsonSchemaStrictEnvName: "NVIDIA_JSON_SCHEMA_STRICT",
    kind: "openai-compatible",
    baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: "meta/llama-3.1-8b-instruct",
    responseFormatMode: "json_object",
    jsonSchemaStrict: false,
    maxTokensField: "max_tokens",
  },
}

export function getActiveProviderConfig():
  | { ok: true; config: ActiveProviderConfig }
  | { ok: false; error: string } {
  const providerValue = process.env.AI_PROVIDER?.trim().toLowerCase()
  const provider: AIProvider =
    providerValue === "groq" || providerValue === "nvidia" || providerValue === "minimax"
      ? providerValue
      : "minimax"

  if (providerValue && !(providerValue in providerDefaults)) {
    return {
      ok: false,
      error: 'Unsupported AI_PROVIDER value. Use "minimax", "groq", or "nvidia".',
    }
  }

  const defaults = providerDefaults[provider]
  const apiKey = process.env[defaults.apiKeyEnvName]?.trim()

  if (!apiKey) {
    return {
      ok: false,
      error: `${defaults.apiKeyEnvName} is not set. Add it to .env or .env.local before using ${defaults.providerLabel}.`,
    }
  }

  const baseUrl = readStringEnv(defaults.baseUrlEnvName, defaults.baseUrl)
  const model = readStringEnv(defaults.modelEnvName, defaults.model)

  return {
    ok: true,
    config: {
      provider,
      providerLabel: defaults.providerLabel,
      apiKey,
      apiKeyEnvName: defaults.apiKeyEnvName,
      baseUrl: provider === "minimax" ? normalizeMinimaxBaseUrl(baseUrl) : baseUrl,
      model: provider === "minimax" ? normalizeMinimaxModel(model) : model,
      kind: defaults.kind,
      responseFormatMode: readStructuredOutputMode(
        defaults.responseFormatEnvName,
        defaults.responseFormatMode
      ),
      jsonSchemaStrict: readBooleanEnv(
        defaults.jsonSchemaStrictEnvName,
        defaults.jsonSchemaStrict
      ),
      maxTokensField: defaults.maxTokensField,
      timeoutMs: readNumberEnv("AI_REQUEST_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
    },
  }
}

function readStringEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback
}

function readNumberEnv(name: string, fallback: number) {
  const rawValue = process.env[name]?.trim()
  if (!rawValue) {
    return fallback
  }

  const parsedValue = Number(rawValue)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

function readBooleanEnv(name: string | undefined, fallback: boolean) {
  if (!name) {
    return fallback
  }

  const rawValue = process.env[name]?.trim().toLowerCase()
  if (!rawValue) {
    return fallback
  }

  if (["1", "true", "yes", "on"].includes(rawValue)) {
    return true
  }

  if (["0", "false", "no", "off"].includes(rawValue)) {
    return false
  }

  return fallback
}

function readStructuredOutputMode(
  name: string | undefined,
  fallback: StructuredOutputMode
): StructuredOutputMode {
  if (!name) {
    return fallback
  }

  const rawValue = process.env[name]?.trim().toLowerCase()
  if (rawValue === "json_object" || rawValue === "json_schema") {
    return rawValue
  }

  return fallback
}

function normalizeMinimaxBaseUrl(baseUrl: string) {
  return baseUrl.replace(
    "https://api.minimax.chat/v1/text/chatcompletion_v2",
    "https://api.minimax.io/v1/text/chatcompletion_v2"
  )
}

function normalizeMinimaxModel(model: string) {
  const normalizedModel = model.trim().toLowerCase()

  if (normalizedModel === "minimax-2.7-flash" || normalizedModel === "minimax-2.7") {
    return "MiniMax-M2.7"
  }

  if (normalizedModel === "minimax-2.7-highspeed") {
    return "MiniMax-M2.7-highspeed"
  }

  return model
}
