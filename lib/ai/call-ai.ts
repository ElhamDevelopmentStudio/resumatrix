import { callMinimaxProvider } from "./minimax"
import { callOpenAiCompatibleProvider } from "./openai-compatible-provider"
import type { StructuredOutputSchema } from "./output-schemas"
import { getActiveProviderConfig } from "./provider-config"
import { createAiFailure } from "./response-utils"
import type { AIResponse } from "./types"

type CallAiParams<T> = {
  systemPrompt: string
  userPrompt: string
  outputSchema: StructuredOutputSchema<T>
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function callAi<T>(params: CallAiParams<T>): Promise<AIResponse<T>> {
  const configResult = getActiveProviderConfig()

  if (!configResult.ok) {
    const providerValue = process.env.AI_PROVIDER?.trim().toLowerCase()
    const providerLabel =
      providerValue === "groq"
        ? "Groq"
        : providerValue === "nvidia"
          ? "NVIDIA"
          : "MiniMax"
    const model =
      providerValue === "groq"
        ? process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b"
        : providerValue === "nvidia"
          ? process.env.NVIDIA_MODEL?.trim() || "meta/llama-3.1-8b-instruct"
          : process.env.MINIMAX_MODEL?.trim() || "MiniMax-M2.7"
    const baseUrl =
      providerValue === "groq"
        ? process.env.GROQ_BASE_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
        : providerValue === "nvidia"
          ? process.env.NVIDIA_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1/chat/completions"
          : process.env.MINIMAX_BASE_URL?.trim() || "https://api.minimax.io/v1/text/chatcompletion_v2"

    return createAiFailure({
      provider:
        providerValue === "groq" || providerValue === "nvidia" || providerValue === "minimax"
          ? providerValue
          : "minimax",
      providerLabel,
      model,
      baseUrl,
      message: configResult.error,
    })
  }

  if (configResult.config.kind === "minimax") {
    return callMinimaxProvider({
      config: configResult.config,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      outputSchema: params.outputSchema,
      model: params.model,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    })
  }

  return callOpenAiCompatibleProvider({
    config: configResult.config,
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
    outputSchema: params.outputSchema,
    model: params.model,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
  })
}
