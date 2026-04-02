"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import type { SectionKey, SectionMeta } from "@/lib/career-data/types"
import { cn } from "@/lib/utils"

type JumpItem = {
  key: SectionKey
  label: string
  helper: string
  countLabel: string
  meta: SectionMeta
  isOpen: boolean
}

type QuickJumpCardProps = {
  items: JumpItem[]
  onJump: (section: SectionKey) => void
}

export function QuickJumpCard({ items, onJump }: QuickJumpCardProps) {
  return (
    <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Quick jump</h2>
        <p className="mt-1 text-sm font-medium text-on-surface-variant/70">
          Move between sections without leaving the page.
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onJump(item.key)}
            className={cn(
              "flex w-full items-center justify-between rounded-sm border px-4 py-3 text-left transition-colors",
              item.isOpen
                ? "border-primary/20 bg-primary-soft/70"
                : "border-outline-variant/50 bg-surface-subtle hover:border-primary/20 hover:bg-primary-soft/40"
            )}
          >
            <div>
              <p className="text-sm font-bold text-on-surface">{item.label}</p>
              <p className="mt-1 text-xs font-medium text-on-surface-variant/70">{item.helper}</p>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/60 uppercase">
                  {item.countLabel}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs font-medium",
                    item.meta.status === "error"
                      ? "text-destructive"
                      : item.meta.status === "saving"
                        ? "text-primary"
                        : "text-on-surface-variant/70"
                  )}
                >
                  {item.meta.status === "saving"
                    ? "Saving"
                    : item.meta.status === "error"
                      ? "Needs attention"
                      : item.meta.lastSavedAt
                        ? "Saved"
                        : "Autosave on"}
                </p>
              </div>

              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 text-on-surface-variant/70" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
