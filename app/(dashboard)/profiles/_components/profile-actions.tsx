"use client"

import Link from "next/link"
import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ProfileActionsProps = {
  editHref: string
  editLabel?: string
  isBusy?: boolean
  onDuplicate: () => void
  onDelete: () => void
}

export function ProfileActions({
  editHref,
  editLabel = "Edit profile",
  isBusy = false,
  onDuplicate,
  onDelete,
}: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={editHref}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3")}
      >
        {editLabel}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open profile actions"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "border border-outline-variant/60 text-on-surface-variant hover:border-outline-variant hover:bg-surface-subtle hover:text-on-surface"
          )}
        >
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={onDuplicate} disabled={isBusy}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} disabled={isBusy} variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
