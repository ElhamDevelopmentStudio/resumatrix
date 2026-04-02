import type { ReactNode } from "react"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import type { SectionMeta } from "@/lib/career-data/types"
import { cn } from "@/lib/utils"

import { SaveIndicator } from "./save-indicator"

type CareerSectionCardProps = {
  id: string
  step: string
  title: string
  description: string
  summary: string
  meta: SectionMeta
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

export function CareerSectionCard({
  id,
  step,
  title,
  description,
  summary,
  meta,
  isOpen,
  onToggle,
  children,
}: CareerSectionCardProps) {
  const panelId = `${id}-panel`

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-32 rounded-sm border bg-card shadow-sm transition-colors",
        isOpen ? "border-outline-variant/70" : "border-outline-variant/60"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "flex w-full flex-col gap-4 p-5 text-left transition-colors md:p-6",
          isOpen ? "bg-surface-subtle/35" : "hover:bg-surface-subtle/50"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={isOpen ? "default" : "outline"}>{step}</Badge>
              <h2 className="font-headline text-xl font-semibold text-on-surface md:text-2xl">
                {title}
              </h2>
              <span className="rounded-sm bg-surface-subtle px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                {summary}
              </span>
            </div>
            <p className="max-w-2xl text-sm text-on-surface-variant/75">{description}</p>
          </div>

          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-outline-variant/60 bg-background text-on-surface-variant transition-colors",
              isOpen ? "border-primary/20 bg-primary-soft text-primary" : undefined
            )}
          >
            <HugeiconsIcon
              icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </span>
        </div>

        <SaveIndicator meta={meta} />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid overflow-hidden border-t border-outline-variant/40 transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-6 p-5 md:p-6">{children}</div>
        </div>
      </div>
    </section>
  )
}
