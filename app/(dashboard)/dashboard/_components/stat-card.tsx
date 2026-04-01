import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type IconDefinition = ComponentProps<typeof HugeiconsIcon>["icon"]

type StatCardProps = {
  icon: IconDefinition
  label: string
  value: string
  sublabel: string
  accentClassName: string
}

export function StatCard({ icon, label, value, sublabel, accentClassName }: StatCardProps) {
  return (
    <Card className="gap-0 rounded-[1.5rem] bg-white p-6 text-[#191c1d] shadow-sm ring-[#c5c5d4]/40 transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5", accentClassName)}>
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#454652]/60 uppercase">
          {label}
        </span>
      </div>
      <h3 className="font-headline text-3xl font-bold text-[#191c1d]">{value}</h3>
      <p className="mt-1 text-sm font-medium text-[#454652]">{sublabel}</p>
    </Card>
  )
}
