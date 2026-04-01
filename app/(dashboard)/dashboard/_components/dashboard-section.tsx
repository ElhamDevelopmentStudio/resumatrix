import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DashboardSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  as?: "section" | "aside" | "div"
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  as: Component = "section",
}: DashboardSectionProps) {
  return (
    <Component className={className}>
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm font-medium text-on-surface-variant/60">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(contentClassName)}>{children}</div>
    </Component>
  )
}
