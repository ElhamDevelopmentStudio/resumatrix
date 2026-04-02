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
    <Card className="gap-4 rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-headline text-base font-semibold text-on-surface md:text-lg">{title}</h3>
          {subtitle ? <p className="text-sm text-on-surface-variant/70">{subtitle}</p> : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={removeLabel}
          className="h-auto shrink-0 px-0 py-0 text-on-surface-variant hover:bg-transparent hover:text-destructive"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
          Remove
        </Button>
      </div>

      <div className="space-y-4">{children}</div>
    </Card>
  )
}
