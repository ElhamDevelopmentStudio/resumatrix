"use client"

import type { ReactNode } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Set it before starting the app.")
  }

  return url
}

const convex = new ConvexReactClient(getConvexUrl(), { logger: false })

type AppConvexProviderProps = {
  children: ReactNode
}

export function AppConvexProvider({ children }: AppConvexProviderProps) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
