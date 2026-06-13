"use server"
import { internalMutation, internalQuery } from "../_generated/server"
import { v } from "convex/values"

export const getRateLimitEntry = internalQuery({
  args: {
    userId: v.string(),
    functionName: v.string(),
    windowStart: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rate_limits")
      .withIndex("by_user_function_window", (query) =>
        query
          .eq("user_id", args.userId)
          .eq("function_name", args.functionName)
          .gte("window_start", args.windowStart)
      )
      .order("desc")
      .first()
  },
})

export const createRateLimitEntry = internalMutation({
  args: {
    userId: v.string(),
    functionName: v.string(),
    callCount: v.number(),
    windowStart: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("rate_limits", {
      user_id: args.userId,
      function_name: args.functionName,
      call_count: args.callCount,
      window_start: args.windowStart,
    })
  },
})

export const incrementRateLimit = internalMutation({
  args: {
    id: v.id("rate_limits"),
    callCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { call_count: args.callCount })
  },
})

export const insertAiCallLog = internalMutation({
  args: {
    userId: v.string(),
    functionName: v.string(),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    region: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_call_logs", {
      user_id: args.userId,
      function_name: args.functionName,
      provider: args.provider,
      model: args.model,
      region: args.region,
      tokens_used: args.tokensUsed,
      success: args.success,
      error_message: args.errorMessage,
      created_at: new Date().toISOString(),
    })
  },
})
