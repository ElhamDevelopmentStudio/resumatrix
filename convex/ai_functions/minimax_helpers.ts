"use server"
import { internal } from "../_generated/api"
import type { MutationCtx } from "../_generated/server"

const RATE_LIMIT_CALLS = 10
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute

export async function checkRateLimit(
  ctx: MutationCtx,
  userId: string,
  functionName: string
): Promise<boolean> {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  const existing = await ctx.runQuery(
    internal.ai_functions.minimax_helpers_internal.getRateLimitEntry,
    { userId, functionName, windowStart }
  )

  return !existing || existing.call_count < RATE_LIMIT_CALLS
}

export async function ensureRateLimitEntry(
  ctx: MutationCtx,
  userId: string,
  functionName: string
): Promise<void> {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  const existing = await ctx.runQuery(
    internal.ai_functions.minimax_helpers_internal.getRateLimitEntry,
    { userId, functionName, windowStart }
  )

  if (!existing) {
    await ctx.runMutation(
      internal.ai_functions.minimax_helpers_internal.createRateLimitEntry,
      {
        userId,
        functionName,
        callCount: 1,
        windowStart,
      }
    )
  }
}

export async function incrementRateLimitCount(
  ctx: MutationCtx,
  userId: string,
  functionName: string
): Promise<void> {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  const existing = await ctx.runQuery(
    internal.ai_functions.minimax_helpers_internal.getRateLimitEntry,
    { userId, functionName, windowStart }
  )

  if (existing) {
    await ctx.runMutation(
      internal.ai_functions.minimax_helpers_internal.incrementRateLimit,
      {
        id: existing._id,
        callCount: existing.call_count + 1,
      }
    )
  }
}

export async function logAiCall(
  ctx: MutationCtx,
  params: {
    userId: string
    functionName: string
    region?: string
    tokensUsed?: number
    success: boolean
    errorMessage?: string
  }
): Promise<void> {
  await ctx.db.insert("ai_call_logs", {
    user_id: params.userId,
    function_name: params.functionName,
    region: params.region,
    tokens_used: params.tokensUsed,
    success: params.success,
    error_message: params.errorMessage,
    created_at: new Date().toISOString(),
  })
}