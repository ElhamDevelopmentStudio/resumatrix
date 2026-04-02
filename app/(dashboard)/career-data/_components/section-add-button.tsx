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
      variant="outline"
      size="lg"
      onClick={onClick}
      className="h-10 self-start border-dashed border-outline-variant/70 bg-transparent px-3 text-on-surface-variant hover:border-primary/30 hover:bg-primary-soft/40 hover:text-on-surface"
    >
      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
      {label}
    </Button>
  )
}
