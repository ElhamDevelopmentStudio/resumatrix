import type { ReactNode } from "react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type ItemCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  onRemove: () => void
  removeLabel: string
}

export function ItemCard({ title, subtitle, children, onRemove, removeLabel }: ItemCardProps) {
  return (
    <Card className="gap-0 rounded-sm border border-outline-variant/50 bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium text-on-surface-variant/70">{subtitle}</p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          aria-label={removeLabel}
          className="size-10 rounded-sm border-outline-variant/60 text-on-surface-variant hover:border-destructive hover:text-destructive"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
        </Button>
      </div>

      <div className="space-y-5">{children}</div>
    </Card>
  )
}
