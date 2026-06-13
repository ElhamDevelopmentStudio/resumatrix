import "server-only"

import { ConvexHttpClient } from "convex/browser"

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL. Set it before starting the app.")
  }

  return url
}

export function createConvexClient() {
  return new ConvexHttpClient(getConvexUrl(), { logger: false })
}
