"use server"
import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { buildSuggestLayoutSystemPrompt, buildSuggestLayoutUserPrompt } from "../../lib/ai/prompts/suggest-layout"
import { getRegionStandard } from "../../lib/region-instructions"
import { callMinimax } from "../../lib/ai/minimax"
import { checkRateLimit, ensureRateLimitEntry, incrementRateLimitCount, logAiCall } from "./minimax_helpers"
import type { LayoutSuggestion } from "../../lib/ai/types"

export const suggest_layout = mutation({
  args: {
    careerDataSerialized: v.string(),
    currentSectionOrder: v.array(v.string()),
    regionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.tokenIdentifier
    if (!userId) {
      return { ok: false, error: "Not authenticated" }
    }

    const canProceed = await checkRateLimit(ctx, userId, "suggest_layout")
    if (!canProceed) {
      return { ok: false, error: "Rate limit exceeded. Please wait a moment before trying again." }
    }

    const region = getRegionStandard(args.regionId ?? "international")
    let careerData
    try {
      careerData = JSON.parse(args.careerDataSerialized)
    } catch {
      return { ok: false, error: "Invalid career data" }
    }

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