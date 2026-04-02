import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

type SectionAddButtonProps = {
  label: string
  onClick: () => void
}

export function SectionAddButton({ label, onClick }: SectionAddButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="mt-2 h-auto rounded-sm px-0 py-0 text-sm font-bold text-primary hover:bg-transparent hover:text-primary/80"
    >
      <span className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center bg-primary-soft text-primary">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
        </span>
        <span>{label}</span>
      </span>
    </Button>
  )
}
