import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/60 bg-background/90 px-6 py-6 backdrop-blur-md md:px-8 xl:px-12">
      <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
        Dashboard
      </h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">Alex Mercer</p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/50 uppercase">
              Premium Member
            </p>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Alex Mercer avatar"
              className="size-10 rounded-none object-cover ring-2 ring-card shadow-sm"
              referrerPolicy="no-referrer"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            />
            <span className="absolute right-0 bottom-0 size-3 rounded-none border-2 border-card bg-success" />
          </div>
        </div>

        <button
          type="button"
          aria-label="Sign out"
          className="flex items-center justify-center p-2 text-on-surface-variant/40 transition-colors hover:text-destructive"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-5" />
        </button>
      </div>
    </header>
  )
}
