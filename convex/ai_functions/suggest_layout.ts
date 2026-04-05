"use server"
import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { buildSuggestLayoutSystemPrompt, buildSuggestLayoutUserPrompt } from "../../lib/ai/prompts/suggest-layout"
import { getRegionStandard } from "../../lib/region-instructions"
import { callMinimax } from "../../lib/ai/minimax"
import {
  AI_RATE_LIMIT_USER_ID,
  checkRateLimit,
  ensureRateLimitEntry,
  incrementRateLimitCount,
  logAiCall,
} from "./minimax_helpers"
import { serializeStoreToWorkspaceData } from "../../lib/ai/serialize-store"
import type { LayoutSuggestion } from "../../lib/ai/types"

export const suggest_layout = mutation({
  args: {
    careerDataSerialized: v.string(),
    currentSectionOrder: v.array(v.string()),
    regionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = AI_RATE_LIMIT_USER_ID

    const canProceed = await checkRateLimit(ctx, userId, "suggest_layout")
    if (!canProceed) {
      return { ok: false as const, error: "Rate limit exceeded. Please wait a moment before trying again." }
    }

    const region = getRegionStandard(args.regionId ?? "international")
    let parsedStore: Record<string, unknown>
    try {
      parsedStore = JSON.parse(args.careerDataSerialized)
    } catch {
      return { ok: false as const, error: "Invalid career data" }
    }

    const careerData = serializeStoreToWorkspaceData(parsedStore)

    const systemPrompt = buildSuggestLayoutSystemPrompt(region)
    const userPrompt = buildSuggestLayoutUserPrompt({
      careerData,
      region,
      currentSectionOrder: args.currentSectionOrder,
    })

    const result = await callMinimax<LayoutSuggestion>({
      systemPrompt,
      userPrompt,
      outputSchema: { section_order: [], reasoning_per_section: {} },
    })

    // Ensure rate limit entry exists and increment
    await ensureRateLimitEntry(ctx, userId, "suggest_layout")
    await incrementRateLimitCount(ctx, userId, "suggest_layout")
    await logAiCall(ctx, {
      userId,
      functionName: "suggest_layout",
      region: region.id,
      success: result.ok,
      errorMessage: result.ok ? undefined : result.error,
    })

    return result
  },
})
