import Link from "next/link"
import { Clock01Icon, CloudDownloadIcon, File01Icon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ResumeCardProps = {
  title: string
  profile: string
  time: string
  type: string
  href: string
  downloadHref?: string
  active?: boolean
}

export function ResumeCard({ title, profile, time, type, href, downloadHref, active = false }: ResumeCardProps) {
  const isModernClean = type === "ATS Standard" || type === "Modern Clean"

  return (
    <Card className="flex h-full gap-0 bg-card p-7 text-on-surface shadow-sm ring-outline-variant/60 transition-all duration-200 hover:-translate-y-1 hover:ring-primary/30">
      <div className="mb-8 flex items-start justify-between">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-sm border border-outline-variant/40 bg-surface-subtle text-on-surface-variant transition-colors group-hover/card:text-primary">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-8" />
          </div>
          {active ? (
            <div className="absolute -top-1 -right-1 size-4 rounded-sm border-2 border-card bg-primary" />
          ) : null}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase",
            isModernClean
              ? "border-primary/10 bg-primary-soft text-primary"
              : "border-tertiary/10 bg-tertiary-soft text-tertiary"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-sm",
              isModernClean ? "bg-primary" : "bg-tertiary"
            )}
          />
          {type}
        </span>
      </div>

      <div className="mb-8">
        <h3 className="mb-2 font-headline text-xl font-bold leading-tight text-on-surface">
          {title}
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/60">
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-3.5" />
            <span>{profile}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/60">
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3.5" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3">
        <Link
          href={href}
          className="flex-1 rounded-sm border border-outline-variant/60 bg-surface-subtle px-4 py-3 text-center text-sm font-bold text-on-surface-variant transition-colors hover:bg-muted hover:text-on-surface-variant"
        >
          Edit Document
        </Link>
        {downloadHref ? (
          <a
            href={downloadHref}
            aria-label={`Download ${title} as a PDF`}
            className="inline-flex size-12 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-lg shadow-primary/15 transition-colors hover:bg-primary/90"
          >
            <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={2} className="size-5" />
          </a>
        ) : null}
      </div>
    </Card>
  )
}
