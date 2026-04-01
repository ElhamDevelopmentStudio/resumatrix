import { CheckmarkCircle02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { formatDistanceToNow } from "date-fns"

import { Spinner } from "@/components/ui/spinner"

type SaveIndicatorProps = {
  status: "idle" | "saving" | "saved" | "error"
  lastSavedAt: number | null
  errorMessage?: string | null
}

export function SaveIndicator({ status, lastSavedAt, errorMessage }: SaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
        <Spinner className="size-4" />
        <span>Saving…</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
        <span>{errorMessage ?? "Couldn’t save your changes."}</span>
      </div>
    )
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-success" />
        <span>Saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}</span>
      </div>
    )
  }

  return (
    <div className="text-sm font-medium text-on-surface-variant">
      Changes will save automatically.
    </div>
  )
}
