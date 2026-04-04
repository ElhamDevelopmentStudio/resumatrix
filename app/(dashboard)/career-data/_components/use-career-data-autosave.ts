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
  const previousSnapshotRef = useRef<string | null>(null)
  const flushPendingSaveRef = useRef<() => void>(() => {})

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
    const snapshotAtSaveStart = snapshot

    void save().finally(() => {
      isSavingRef.current = false

      if (previousSnapshotRef.current === snapshotAtSaveStart) {
        hasPendingChangesRef.current = false
      }

      if (!enabled || !flushAfterSaveRef.current) {
        return
      }

      flushAfterSaveRef.current = false
      flushPendingSaveRef.current()
    })
  })

  useEffect(() => {
    flushPendingSaveRef.current = flushPendingSave
  }, [])

  useEffect(() => {
    if (!enabled) {
      clearPendingTimer()
      return
    }

    if (previousSnapshotRef.current === null) {
      previousSnapshotRef.current = snapshot
      return
    }

    if (snapshot === previousSnapshotRef.current) {
      return
    }

    previousSnapshotRef.current = snapshot
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
      flushPendingSaveRef.current()
      clearPendingTimer()
    }
  }, [])
}
