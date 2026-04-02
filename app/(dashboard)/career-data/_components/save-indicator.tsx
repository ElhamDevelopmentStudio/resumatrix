import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { formatDistanceToNow } from "date-fns"

import { Spinner } from "@/components/ui/spinner"
import type { SectionMeta } from "@/lib/career-data/types"

type SaveIndicatorProps = {
  meta: SectionMeta
}

export function SaveIndicator({ meta }: SaveIndicatorProps) {
  if (meta.status === "saving") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-primary">
        <Spinner className="size-3.5" />
        <span>Saving…</span>
      </div>
    )
  }

  if (meta.status === "error") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-destructive">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-3.5" />
        <span>{meta.errorMessage ?? "Couldn’t save changes."}</span>
      </div>
    )
  }

  if (meta.lastSavedAt) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant/75">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5 text-success" />
        <span>Saved {formatDistanceToNow(meta.lastSavedAt, { addSuffix: true })}</span>
      </div>
    )
  }

  return <div className="text-xs font-medium text-on-surface-variant/70">Autosave on</div>
}
