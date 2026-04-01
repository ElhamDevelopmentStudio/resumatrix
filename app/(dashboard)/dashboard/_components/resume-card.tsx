import { Clock01Icon, CloudDownloadIcon, File01Icon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ResumeCardProps = {
  title: string
  profile: string
  time: string
  type: string
  active?: boolean
}

export function ResumeCard({ title, profile, time, type, active = false }: ResumeCardProps) {
  const isModernClean = type === "Modern Clean"

  return (
    <Card className="flex h-full gap-0 rounded-[1.75rem] bg-white p-7 text-[#191c1d] shadow-sm ring-[#c5c5d4]/40 transition-all duration-200 hover:-translate-y-1 hover:ring-[#002fbb]/30">
      <div className="mb-8 flex items-start justify-between">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-[#c5c5d4]/20 bg-[#f8f9fa] text-[#454652] transition-colors group-hover/card:text-[#002fbb]">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-8" />
          </div>
          {active ? (
            <div className="absolute -top-1 -right-1 size-4 rounded-full border-2 border-white bg-[#002fbb]" />
          ) : null}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase",
            isModernClean
              ? "border-indigo-100 bg-indigo-50 text-indigo-700"
              : "border-purple-100 bg-purple-50 text-purple-700"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isModernClean ? "bg-indigo-500" : "bg-purple-500"
            )}
          />
          {type}
        </span>
      </div>

      <div className="mb-8">
        <h3 className="mb-2 font-headline text-xl font-bold leading-tight text-[#191c1d]">
          {title}
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#454652]/60">
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-3.5" />
            <span>{profile}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#454652]/60">
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3.5" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3">
        <button
          type="button"
          className="flex-1 rounded-xl border border-[#c5c5d4]/20 bg-[#f8f9fa] px-4 py-3 font-bold text-[#454652] transition-colors hover:bg-[#c5c5d4]/20"
        >
          Edit Document
        </button>
        <button
          type="button"
          aria-label={`Download ${title}`}
          className="flex w-12 items-center justify-center rounded-xl bg-[#002fbb] py-3 text-white shadow-[0_12px_24px_rgba(0,47,187,0.2)] transition-all active:translate-y-px"
        >
          <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={2} className="size-5" />
        </button>
      </div>
    </Card>
  )
}
