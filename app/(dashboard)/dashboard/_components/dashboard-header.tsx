import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#c5c5d4]/20 bg-[#f8f9fa]/80 px-6 py-6 backdrop-blur-md md:px-8 xl:px-12">
      <h1 className="font-headline text-2xl font-bold tracking-tight text-[#191c1d]">
        Dashboard
      </h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-[#191c1d]">Alex Mercer</p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#454652]/50 uppercase">
              Premium Member
            </p>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Alex Mercer avatar"
              className="size-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              referrerPolicy="no-referrer"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            />
            <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-green-500" />
          </div>
        </div>

        <button
          type="button"
          aria-label="Sign out"
          className="flex items-center justify-center p-2 text-[#454652]/40 transition-colors hover:text-red-500"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-5" />
        </button>
      </div>
    </header>
  )
}
