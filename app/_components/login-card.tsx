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
    <Card className="glass-card gap-0 rounded-xl border border-white/40 p-10 text-on-surface shadow-[0_20px_40px_rgba(25,28,29,0.06)] ring-0 md:p-14">
      <div className="mb-10 text-left">
        <h1 className="mb-4 text-4xl font-headline font-bold tracking-tight text-on-surface md:text-5xl">
          Welcome back
        </h1>
        <p className="max-w-xs text-lg leading-relaxed font-body text-on-surface-variant">
          Sign in to access your Resumatrix workspace.
        </p>
      </div>

      {isAuthenticated ? (
        <div className="animate-in rounded-xl border border-primary/10 bg-primary/5 p-5 text-left fade-in-0 duration-300">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
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

      <div className="mt-12 flex items-center gap-6 opacity-30 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
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
