import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type FormSectionProps = {
  title: string
  step: string
  children: ReactNode
  className?: string
  contentClassName?: string
  description?: string
  action?: ReactNode
}

export function FormSection({
  title,
  step,
  children,
  className,
  contentClassName,
  description,
  action,
}: FormSectionProps) {
  return (
    <section className={className}>
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            {title}
          </h2>
          {description ? (
            <p className="text-sm font-medium text-on-surface-variant/70">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {action}
          <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
            {step}
          </span>
        </div>
      </div>

      <Card className={cn("rounded-sm border border-outline-variant/50 bg-card p-8 shadow-sm", contentClassName)}>
        {children}
      </Card>
    </section>
  )
}
