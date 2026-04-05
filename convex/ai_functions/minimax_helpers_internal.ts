"use server"
import { internalQuery, internalMutation } from "../_generated/server"
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
      .withIndex("by_user_function", (q) =>
        q.eq("user_id", args.userId).eq("function_name", args.functionName)
      )
      .filter((q) => q.gte(q.field("window_start"), args.windowStart))
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