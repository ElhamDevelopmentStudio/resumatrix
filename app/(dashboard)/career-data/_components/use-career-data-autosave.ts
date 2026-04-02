"use client"

import { useEffect } from "react"

const AUTOSAVE_DELAY_MS = 700

type UseCareerDataAutosaveProps = {
  enabled: boolean
  value: unknown
  save: () => Promise<void>
}

export function useCareerDataAutosave({ enabled, value, save }: UseCareerDataAutosaveProps) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const timer = window.setTimeout(() => {
      void save()
    }, AUTOSAVE_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [enabled, save, value])
}
