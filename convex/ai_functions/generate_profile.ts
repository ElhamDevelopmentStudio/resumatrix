"use server"
import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { buildGenerateProfileSystemPrompt, buildGenerateProfileUserPrompt } from "../../lib/ai/prompts/generate-profile"
import { getRegionStandard } from "../../lib/region-instructions"
import { callMinimax } from "../../lib/ai/minimax"
import { checkRateLimit, ensureRateLimitEntry, incrementRateLimitCount, logAiCall } from "./minimax_helpers"
import type { ProfileSuggestion } from "../../lib/ai/types"

export const generate_profile = mutation({
  args: {
    userPrompt: v.string(),
    careerDataSerialized: v.string(),
    regionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.tokenIdentifier
    if (!userId) {
      return { ok: false, error: "Not authenticated" }
    }

    const canProceed = await checkRateLimit(ctx, userId, "generate_profile")
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

    const systemPrompt = buildGenerateProfileSystemPrompt(region)
    const userPrompt = buildGenerateProfileUserPrompt({
      userPrompt: args.userPrompt,
      careerData,
      region,
    })

    const result = await callMinimax<ProfileSuggestion>({
      systemPrompt,
      userPrompt,
      outputSchema: {
        name: "",
        include_tags: [],
        exclude_tags: [],
        ordering: { experiences: "recent", projects: "manual", education: "recent" },
        limits: { experiences: null, projects: null },
      },
    })

    // Ensure rate limit entry exists and increment
    await ensureRateLimitEntry(ctx, userId, "generate_profile")
    await incrementRateLimitCount(ctx, userId, "generate_profile")
    await logAiCall(ctx, {
      userId,
      functionName: "generate_profile",
      region: region.id,
      success: result.ok,
      errorMessage: result.ok ? undefined : result.error,
    })

    return result
  },
})