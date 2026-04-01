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
    <Card className="gap-0 rounded-none bg-card p-6 text-on-surface shadow-sm ring-outline-variant/60 transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("rounded-none p-2.5", accentClassName)}>
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/60 uppercase">
          {label}
        </span>
      </div>
      <h3 className="font-headline text-3xl font-bold text-on-surface">{value}</h3>
      <p className="mt-1 text-sm font-medium text-on-surface-variant">{sublabel}</p>
    </Card>
  )
}
