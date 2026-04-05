import "server-only"

import { setDefaultResultOrder } from "node:dns"

import { ConvexHttpClient } from "convex/browser"

// Some local networks expose IPv6 DNS answers without a working IPv6 route.
// In Node 20, that can make fetch to Convex time out before IPv4 succeeds.
// Prefer IPv4 first for server-side Convex calls so App Router pages can load.
setDefaultResultOrder("ipv4first")

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Set it before starting the app.")
  }

  return url
}

export function createConvexClient() {
  return new ConvexHttpClient(getConvexUrl(), { logger: false })
}
