"use client"

import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  const pathname = usePathname()
  const isCareerDataPage = pathname === "/career-data"

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/60 bg-background/90 px-6 py-6 backdrop-blur-md md:px-8 xl:px-12">
      <div>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
          {isCareerDataPage ? "Career Data" : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm font-medium text-on-surface-variant/70">
          {isCareerDataPage
            ? "One workspace for your personal info, experience, projects, education, and skills."
            : "Overview of your resume workspace."}
        </p>
      </div>

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
              className="size-10 rounded-sm object-cover ring-2 ring-card shadow-sm"
              referrerPolicy="no-referrer"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            />
            <span className="absolute right-0 bottom-0 size-3 rounded-sm border-2 border-card bg-success" />
          </div>
        </div>

        <Button
          type="button"
          aria-label="Sign out"
          variant="ghost"
          size="icon-lg"
          className="text-on-surface-variant/40 hover:bg-transparent hover:text-destructive"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-5" />
        </Button>
      </div>
    </header>
  )
}
