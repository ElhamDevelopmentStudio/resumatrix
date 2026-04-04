"use client"

import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type DashboardHeaderProps = {
  username: string
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const isCareerDataPage = pathname === "/career-data"
  const isProfilesPage = pathname.startsWith("/profiles")
  const isCvsPage = pathname.startsWith("/cvs")

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      })

      if (!response.ok) {
        return
      }

      router.push("/")
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/60 bg-background/90 px-6 py-6 backdrop-blur-md md:px-8 xl:px-12">
      <div>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
          {isCareerDataPage ? "Career Data" : isProfilesPage ? "Profiles" : isCvsPage ? "CVs" : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm font-medium text-on-surface-variant/70">
          {isCareerDataPage
            ? "Work through one section at a time. Everything saves automatically."
            : isProfilesPage
              ? "Create and manage focused resume profiles without losing track of your data."
              : isCvsPage
                ? "Create, preview, and export tailored CVs from your saved profiles."
                : "Overview of your resume workspace."}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">{username}</p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/50 uppercase">
              Premium Member
            </p>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${username} avatar`}
              className="size-10 rounded-sm object-cover ring-2 ring-card shadow-sm"
              referrerPolicy="no-referrer"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`}
            />
            <span className="absolute right-0 bottom-0 size-3 rounded-sm border-2 border-card bg-success" />
          </div>
        </div>

        <Button
          type="button"
          aria-label={isSigningOut ? "Signing out" : "Sign out"}
          variant="ghost"
          size="icon-lg"
          disabled={isSigningOut}
          className="text-on-surface-variant/40 hover:bg-transparent hover:text-destructive"
          onClick={() => void handleSignOut()}
        >
          {isSigningOut ? (
            <Spinner className="size-5" />
          ) : (
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-5" />
          )}
        </Button>
      </div>
    </header>
  )
}
