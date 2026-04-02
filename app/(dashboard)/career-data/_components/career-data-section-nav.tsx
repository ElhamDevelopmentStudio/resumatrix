import { Badge } from "@/components/ui/badge"
import type { SectionKey, SectionMeta } from "@/lib/career-data/types"
import { cn } from "@/lib/utils"

type CareerDataSectionNavItem = {
  key: SectionKey
  label: string
  helper: string
  countLabel: string
  step: string
  meta: SectionMeta
  isActive: boolean
}

type CareerDataSectionNavProps = {
  items: CareerDataSectionNavItem[]
  onSelect: (section: SectionKey) => void
}

function getStatusLabel(meta: SectionMeta) {
  if (meta.status === "saving") {
    return "Saving"
  }

  if (meta.status === "error") {
    return "Needs attention"
  }

  if (meta.lastSavedAt) {
    return "Saved"
  }

  return "Not started"
}

function getStatusTone(meta: SectionMeta) {
  if (meta.status === "saving") {
    return "bg-primary"
  }

  if (meta.status === "error") {
    return "bg-destructive"
  }

  if (meta.lastSavedAt) {
    return "bg-success"
  }

  return "bg-outline-variant"
}

export function CareerDataSectionNav({ items, onSelect }: CareerDataSectionNavProps) {
  return (
    <nav aria-label="Career data sections" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-current={item.isActive ? "step" : undefined}
          onClick={() => onSelect(item.key)}
          className={cn(
            "rounded-sm border bg-card p-4 text-left shadow-sm transition-colors",
            item.isActive
              ? "border-primary/30 bg-primary-soft/50"
              : "border-outline-variant/60 hover:border-primary/25 hover:bg-surface-subtle"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant={item.isActive ? "default" : "outline"}
              className={cn(item.isActive ? "bg-primary text-primary-foreground" : undefined)}
            >
              {item.step}
            </Badge>
            <span className={cn("size-2 rounded-full", getStatusTone(item.meta))} />
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-on-surface">{item.label}</p>
            <p className="text-sm text-on-surface-variant/75">{item.helper}</p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-on-surface-variant/70">{item.countLabel}</span>
            <span
              className={cn(
                "font-medium",
                item.meta.status === "error"
                  ? "text-destructive"
                  : item.meta.status === "saving"
                    ? "text-primary"
                    : "text-on-surface-variant/70"
              )}
            >
              {getStatusLabel(item.meta)}
            </span>
          </div>
        </button>
      ))}
    </nav>
  )
}
