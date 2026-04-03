import "server-only"

import { ConvexHttpClient } from "convex/browser"

function getConvexUrl() {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL

  if (!url) {
    throw new Error(
      "Missing Convex URL. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL before starting the app."
    )
  }

  return url
}

export function createConvexClient() {
  return new ConvexHttpClient(getConvexUrl(), { logger: false })
}
