"use client"

import { useEffect, useEffectEvent, useRef } from "react"

const AUTOSAVE_DELAY_MS = 700

type UseCareerDataAutosaveProps = {
  enabled: boolean
  value: unknown
  save: () => Promise<void>
}

function serializeValue(value: unknown) {
  try {
    return JSON.stringify(value) ?? ""
  } catch {
    return ""
  }
}

export function useCareerDataAutosave({ enabled, value, save }: UseCareerDataAutosaveProps) {
  const snapshot = serializeValue(value)
  const timerRef = useRef<number | null>(null)
  const isSavingRef = useRef(false)
  const hasPendingChangesRef = useRef(false)
  const flushAfterSaveRef = useRef(false)
  const observedSnapshotRef = useRef<string | null>(null)
  const latestSnapshotRef = useRef(snapshot)
  const latestEnabledRef = useRef(enabled)
  const retryPendingSaveRef = useRef<() => void>(() => {})

  useEffect(() => {
    latestSnapshotRef.current = snapshot
  }, [snapshot])

  useEffect(() => {
    latestEnabledRef.current = enabled
  }, [enabled])

  const clearPendingTimer = useEffectEvent(() => {
    if (timerRef.current === null) {
      return
    }

    window.clearTimeout(timerRef.current)
    timerRef.current = null
  })

  const flushPendingSave = useEffectEvent(() => {
    if (!enabled || !hasPendingChangesRef.current) {
      return
    }

    clearPendingTimer()

    if (isSavingRef.current) {
      flushAfterSaveRef.current = true
      return
    }

    isSavingRef.current = true
    flushAfterSaveRef.current = false
    const snapshotAtSaveStart = latestSnapshotRef.current

    void save().finally(() => {
      isSavingRef.current = false

      if (latestSnapshotRef.current === snapshotAtSaveStart) {
        hasPendingChangesRef.current = false
      }

      if (!latestEnabledRef.current || !flushAfterSaveRef.current) {
        return
      }

      flushAfterSaveRef.current = false
      retryPendingSaveRef.current()
    })
  })

  useEffect(() => {
    retryPendingSaveRef.current = flushPendingSave
  }, [])

  useEffect(() => {
    if (!enabled) {
      clearPendingTimer()
      return
    }

    if (observedSnapshotRef.current === null) {
      observedSnapshotRef.current = snapshot
      return
    }

    if (snapshot === observedSnapshotRef.current) {
      return
    }

    observedSnapshotRef.current = snapshot
    hasPendingChangesRef.current = true
    clearPendingTimer()
    timerRef.current = window.setTimeout(() => {
      flushPendingSave()
    }, AUTOSAVE_DELAY_MS)

    return clearPendingTimer
  }, [enabled, snapshot])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSave()
      }
    }

    const handlePageHide = () => {
      flushPendingSave()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [enabled])

  useEffect(() => {
    return () => {
      retryPendingSaveRef.current()
      clearPendingTimer()
    }
  }, [])
}
