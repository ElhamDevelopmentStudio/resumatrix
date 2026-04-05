"use server"
import { action } from "../_generated/server"
import { v } from "convex/values"
import { buildGenerateProfileSystemPrompt, buildGenerateProfileUserPrompt } from "../../lib/ai/prompts/generate-profile"
import { getRegionStandard } from "../../lib/region-instructions"
import { callAi } from "../../lib/ai/call-ai"
import { profileSuggestionSchema } from "../../lib/ai/output-schemas"
import {
  AI_RATE_LIMIT_USER_ID,
  checkRateLimit,
  logAiCall,
  recordRateLimitUsage,
} from "./minimax_helpers"
import { serializeStoreToWorkspaceData } from "../../lib/ai/serialize-store"
import type { ProfileSuggestion } from "../../lib/ai/types"

export const generate_profile = action({
  args: {
    userPrompt: v.string(),
    careerDataSerialized: v.string(),
    regionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = AI_RATE_LIMIT_USER_ID

    const canProceed = await checkRateLimit(ctx, userId, "generate_profile")
    if (!canProceed) {
      return {
        ok: false as const,
        error: "You’ve hit the AI rate limit for now. Please wait a minute and try again.",
        details: {
          provider: "minimax" as const,
          providerLabel: "AI",
          model: "rate-limit",
          baseUrl: "local",
          retryable: true,
        },
      }
    }

    const region = getRegionStandard(args.regionId ?? "international")
    let parsedStore: Record<string, unknown>
    try {
      parsedStore = JSON.parse(args.careerDataSerialized)
    } catch {
      return {
        ok: false as const,
        error: "Career data is invalid. Refresh the page and try again.",
        details: {
          provider: "minimax" as const,
          providerLabel: "AI",
          model: "invalid-input",
          baseUrl: "local",
          retryable: false,
        },
      }
    }

    const careerData = serializeStoreToWorkspaceData(parsedStore)

    const systemPrompt = buildGenerateProfileSystemPrompt(region)
    const userPrompt = buildGenerateProfileUserPrompt({
      userPrompt: args.userPrompt,
      careerData,
      region,
    })

    const result = await callAi<ProfileSuggestion>({
      systemPrompt,
      userPrompt,
      outputSchema: profileSuggestionSchema,
    })

    await recordRateLimitUsage(ctx, userId, "generate_profile")
    await logAiCall(ctx, {
      userId,
      functionName: "generate_profile",
      provider: result.ok ? result.meta.provider : result.details.provider,
      model: result.ok ? result.meta.model : result.details.model,
      region: region.id,
      tokensUsed: result.ok ? result.meta.tokensUsed : result.details.tokensUsed,
      success: result.ok,
      errorMessage: result.ok ? undefined : result.error,
    })

    return result
  },
})
