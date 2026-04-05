"use server"
import { action } from "../_generated/server"
import { v } from "convex/values"
import { buildSuggestLayoutSystemPrompt, buildSuggestLayoutUserPrompt } from "../../lib/ai/prompts/suggest-layout"
import { getRegionStandard } from "../../lib/region-instructions"
import { callAi } from "../../lib/ai/call-ai"
import { layoutSuggestionSchema } from "../../lib/ai/output-schemas"
import {
  AI_RATE_LIMIT_USER_ID,
  checkRateLimit,
  logAiCall,
  recordRateLimitUsage,
} from "./minimax_helpers"
import { serializeStoreToWorkspaceData } from "../../lib/ai/serialize-store"
import type { LayoutSuggestion } from "../../lib/ai/types"

export const suggest_layout = action({
  args: {
    careerDataSerialized: v.string(),
    currentSectionOrder: v.array(v.string()),
    regionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = AI_RATE_LIMIT_USER_ID

    const canProceed = await checkRateLimit(ctx, userId, "suggest_layout")
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

    const systemPrompt = buildSuggestLayoutSystemPrompt(region)
    const userPrompt = buildSuggestLayoutUserPrompt({
      careerData,
      region,
      currentSectionOrder: args.currentSectionOrder,
    })

    const result = await callAi<LayoutSuggestion>({
      systemPrompt,
      userPrompt,
      outputSchema: layoutSuggestionSchema,
    })

    await recordRateLimitUsage(ctx, userId, "suggest_layout")
    await logAiCall(ctx, {
      userId,
      functionName: "suggest_layout",
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
