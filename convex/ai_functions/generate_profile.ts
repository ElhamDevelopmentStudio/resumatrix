"use server"
import { action } from "../_generated/server"
import { v } from "convex/values"
import { buildGenerateProfileSystemPrompt, buildGenerateProfileUserPrompt } from "../../lib/ai/prompts/generate-profile"
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
