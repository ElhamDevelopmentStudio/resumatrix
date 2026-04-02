import type { ReactNode } from "react"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
    <section id={id} className="scroll-mt-28 rounded-sm border border-outline-variant/60 bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full flex-col gap-5 p-6 text-left transition-colors hover:bg-surface-subtle/60"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-sm bg-primary-soft px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              {step}
            </span>
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">{title}</h2>
              <p className="mt-1 text-sm font-medium text-on-surface-variant/75">{description}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 lg:justify-end">
            <div className="min-w-0 space-y-2 text-right">
              <p className="text-xs font-bold tracking-[0.18em] text-on-surface-variant/60 uppercase">
                {summary}
              </p>
              <SaveIndicator meta={meta} />
            </div>

            <span
              className={cn(
                "mt-1 inline-flex size-10 items-center justify-center rounded-sm border border-outline-variant/60 bg-surface-subtle text-on-surface-variant transition-transform duration-200",
                isOpen ? "bg-primary-soft text-primary" : undefined
              )}
            >
              <HugeiconsIcon
                icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                strokeWidth={2}
                className="size-5"
              />
            </span>
          </div>
        </div>
      </button>

      <div
        id={panelId}
        className={cn(
          "grid overflow-hidden border-t border-outline-variant/40 transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-6 p-6">{children}</div>
        </div>
      </div>
    </section>
  )
}
