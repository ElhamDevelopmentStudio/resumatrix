"use server"
import { action } from "../_generated/server"
import { v } from "convex/values"
import { buildRewriteFieldSystemPrompt, buildRewriteFieldUserPrompt } from "../../lib/ai/prompts/rewrite-field"
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
import type { RewriteSuggestion } from "../../lib/ai/types"

export const rewrite_field = action({
  args: {
    fieldType: v.union(
      v.literal("bullet"),
      v.literal("summary"),
      v.literal("description"),
      v.literal("role"),
      v.literal("details")
    ),
    originalValue: v.string(),
    careerDataSerialized: v.string(),
    regionId: v.optional(v.string()),
    entryContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = AI_RATE_LIMIT_USER_ID

    const canProceed = await checkRateLimit(ctx, userId, "rewrite_field")
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

    const systemPrompt = buildRewriteFieldSystemPrompt(region)
    const userPrompt = buildRewriteFieldUserPrompt({
      fieldType: args.fieldType,
      originalValue: args.originalValue,
      careerData,
      region,
      entryContext: args.entryContext,
    })

    const result = await callMinimax<RewriteSuggestion>({
      systemPrompt,
      userPrompt,
      outputSchema: { original: "", suggested: "", reasoning: "" },
    })

    await ensureRateLimitEntry(ctx, userId, "rewrite_field")
    await incrementRateLimitCount(ctx, userId, "rewrite_field")
    await logAiCall(ctx, {
      userId,
      functionName: "rewrite_field",
      region: region.id,
      success: result.ok,
      errorMessage: result.ok ? undefined : result.error,
    })

    return result
  },
})
