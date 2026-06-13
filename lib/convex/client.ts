import "server-only"

import { setDefaultResultOrder } from "node:dns"

import { ConvexHttpClient } from "convex/browser"

// Some local networks expose IPv6 DNS answers without a working IPv6 route.
// In Node 20, that can make fetch to Convex time out before IPv4 succeeds.
// Prefer IPv4 first for server-side Convex calls so App Router pages can load.
setDefaultResultOrder("ipv4first")

const CONVEX_FETCH_RETRY_DELAYS_MS = [0, 250, 750] as const
const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  "ECONNRESET",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
])

function readErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return null
  }

  const code = (error as { code?: unknown }).code
  return typeof code === "string" ? code : null
}

function collectErrorCodes(error: unknown): string[] {
  if (!error || typeof error !== "object") {
    return []
  }

  const directCode = readErrorCode(error)
  const nestedCodes = "cause" in error ? collectErrorCodes((error as { cause?: unknown }).cause) : []
  const aggregateCodes =
    "errors" in error && Array.isArray((error as { errors?: unknown[] }).errors)
      ? (error as { errors: unknown[] }).errors.flatMap((entry) => collectErrorCodes(entry))
      : []

  return [directCode, ...nestedCodes, ...aggregateCodes].filter(
    (code): code is string => Boolean(code)
  )
}

function isRetryableConvexFetchError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  if (error.name === "AbortError") {
    return false
  }

  if (error.message !== "fetch failed") {
    return false
  }

  return collectErrorCodes(error).some((code) => RETRYABLE_NETWORK_ERROR_CODES.has(code))
}

async function fetchConvexWithRetry(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
) {
  let lastError: unknown

  for (const [attemptIndex, delayMs] of CONVEX_FETCH_RETRY_DELAYS_MS.entries()) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    try {
      return await fetch(input, init)
    } catch (error) {
      lastError = error

      if (
        attemptIndex === CONVEX_FETCH_RETRY_DELAYS_MS.length - 1 ||
        !isRetryableConvexFetchError(error)
      ) {
        throw error
      }
    }
  }

  throw lastError ?? new Error("Convex request failed")
}

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL. Set it before starting the app.")
  }

  return url
}

export function createConvexClient() {
  return new ConvexHttpClient(getConvexUrl(), {
    logger: false,
    fetch: fetchConvexWithRetry,
  })
}
