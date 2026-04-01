import { Briefcase01Icon, SparklesIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"

export function OptimizerCard() {
  return (
    <Card className="relative col-span-1 gap-0 overflow-hidden rounded-none border-0 bg-gradient-to-br from-primary to-tertiary p-6 text-primary-foreground shadow-lg lg:col-span-2">
      <div className="relative z-10 max-w-[280px]">
        <div className="mb-2 flex items-center gap-2">
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-5" />
          <h3 className="font-headline text-xl font-bold">Resume Optimizer</h3>
        </div>
        <p className="text-sm leading-relaxed opacity-90">
          Improve your hiring success rate by 45% with our AI-powered professional technical curator.
        </p>
        <button
          type="button"
          className="mt-6 rounded-none bg-card px-6 py-2.5 text-sm font-bold text-primary shadow-md transition-all active:translate-y-px"
        >
          Run Performance Audit
        </button>
      </div>

      <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-10 motion-safe:animate-pulse">
        <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={1.5} className="size-40" />
      </div>
    </Card>
  )
}
