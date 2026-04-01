import type { ComponentProps } from "react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type IconDefinition = ComponentProps<typeof HugeiconsIcon>["icon"]

type ProfileCardProps = {
  icon: IconDefinition
  title: string
  category: string
  description: string
  primary?: boolean
}

export function ProfileCard({ icon, title, category, description, primary = false }: ProfileCardProps) {
  return (
    <Card className="gap-0 rounded-[1.5rem] bg-white p-6 text-[#191c1d] shadow-sm ring-[#c5c5d4]/40 transition-all duration-200 hover:-translate-y-1 hover:ring-[#002fbb]/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl ring-4",
              primary
                ? "bg-indigo-50 text-[#002fbb] ring-indigo-50/50"
                : "bg-[#f8f9fa] text-[#454652] ring-[#f8f9fa]/50"
            )}
          >
            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-[#191c1d]">{title}</h3>
            <p
              className={cn(
                "text-[10px] font-bold tracking-[0.2em] uppercase",
                primary ? "text-[#002fbb]" : "text-[#454652]/50"
              )}
            >
              {category}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`More actions for ${title}`}
          className="text-[#454652]/30 transition-colors hover:text-[#454652]"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-[18px]" />
        </button>
      </div>

      <p className="mb-6 text-sm leading-relaxed font-medium text-[#454652]">{description}</p>

      <button
        type="button"
        className="w-full rounded-xl border border-[#c5c5d4]/20 bg-[#f8f9fa] px-4 py-2.5 text-[11px] font-bold tracking-[0.2em] text-[#454652] uppercase transition-all hover:bg-indigo-50 hover:text-[#002fbb]"
      >
        Edit Profile
      </button>
    </Card>
  )
}
