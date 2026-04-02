import type { ComponentProps } from "react"
import Link from "next/link"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type IconDefinition = ComponentProps<typeof HugeiconsIcon>["icon"]

type ProfileCardProps = {
  icon: IconDefinition
  title: string
  category: string
  description: string
  editHref: string
  primary?: boolean
}

export function ProfileCard({ icon, title, category, description, editHref, primary = false }: ProfileCardProps) {
  return (
    <Card className="gap-0 bg-card p-6 text-on-surface shadow-sm ring-outline-variant/60 transition-all duration-200 hover:-translate-y-1 hover:ring-primary/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-sm ring-4",
              primary
                ? "bg-primary-soft text-primary ring-primary/10"
                : "bg-surface-subtle text-on-surface-variant ring-surface-subtle/60"
            )}
          >
            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface">{title}</h3>
            <p
              className={cn(
                "text-[10px] font-bold tracking-[0.2em] uppercase",
                primary ? "text-primary" : "text-on-surface-variant/50"
              )}
            >
              {category}
            </p>
          </div>
        </div>

        <Button
          type="button"
          aria-label={`More actions for ${title}`}
          variant="ghost"
          size="icon-sm"
          className="text-on-surface-variant/30 hover:bg-transparent hover:text-on-surface-variant"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-[18px]" />
        </Button>
      </div>

      <p className="mb-6 text-sm leading-relaxed font-medium text-on-surface-variant">{description}</p>

      <Link
        href={editHref}
        className="inline-flex h-auto w-full items-center justify-center rounded-sm border border-outline-variant/60 bg-surface-subtle px-4 py-2.5 text-[11px] font-bold tracking-[0.2em] text-on-surface-variant uppercase transition-colors hover:bg-primary-soft hover:text-primary"
      >
        Edit Profile
      </Link>
    </Card>
  )
}
