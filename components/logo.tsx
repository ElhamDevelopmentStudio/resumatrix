import Link from "next/link"
import { CubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <div className="flex size-8 items-center justify-center rounded-none bg-primary">
        <HugeiconsIcon icon={CubeIcon} strokeWidth={2} className="size-5 text-primary-foreground" />
      </div>
      <span className="text-2xl font-headline font-bold tracking-tight text-primary">
        Resumatrix
      </span>
    </Link>
  )
}
