import { Fragment } from "react"
import {
  AiNetworkIcon,
  AiSecurity01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { LoginForm } from "@/app/_components/login-form"
import { Card } from "@/components/ui/card"

const statusItems = [
  {
    icon: AiSecurity01Icon,
    label: "Secure connection",
  },
  {
    icon: AiNetworkIcon,
    label: "System status: Ready",
  },
]

export function LoginCard({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  return (
    <Card className="glass-card gap-0 rounded-none border border-card/40 p-8 text-on-surface shadow-lg ring-0 md:p-10 xl:p-14">
      <div className="mb-8 text-left md:mb-9 xl:mb-10">
        <h1 className="mb-3 text-4xl font-headline font-bold tracking-tight text-on-surface lg:text-[2.75rem] xl:mb-4 xl:text-5xl">
          Welcome back
        </h1>
        <p className="max-w-xs text-lg leading-relaxed font-body text-on-surface-variant">
          Sign in to access your Resumatrix workspace.
        </p>
      </div>

      {isAuthenticated ? (
        <div className="animate-in rounded-none border border-primary/10 bg-primary/5 p-5 text-left fade-in-0 duration-300">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-none bg-primary/10 text-primary">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-on-surface">You&apos;re signed in.</p>
              <p className="text-sm leading-6 text-on-surface-variant">
                This browser already has an active Resumatrix session.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <LoginForm />
      )}

      <div className="mt-8 flex items-center gap-4 opacity-30 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 md:mt-10 md:gap-6 xl:mt-12">
        {statusItems.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 ? <div className="h-px flex-1 bg-outline-variant/30" /> : null}
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
              <span className="text-[10px] font-body font-bold tracking-tight uppercase">
                {item.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </Card>
  )
}
