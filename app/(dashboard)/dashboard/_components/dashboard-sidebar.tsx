"use client"

import {
  Briefcase01Icon,
  DashboardSquare01Icon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"

import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

type IconDefinition = ComponentProps<typeof HugeiconsIcon>["icon"]

type NavigationItem = {
  label: string
  href: string
  icon: IconDefinition
  activeHref?: string
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardSquare01Icon,
    activeHref: "/dashboard",
  },
  {
    label: "Career Data",
    href: "/career-data",
    icon: Briefcase01Icon,
    activeHref: "/career-data",
  },
  {
    label: "Profiles",
    href: "/profiles",
    icon: UserAccountIcon,
    activeHref: "/profiles",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-outline-variant/60 bg-surface-muted px-6 py-6 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
      <div className="mb-8 flex flex-col gap-1 lg:mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-col gap-1 lg:flex-1" aria-label="Primary">
        {navigationItems.map((item) => {
          const isActive = item.activeHref ? pathname === item.activeHref : false

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border border-outline-variant bg-card font-bold text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-card/80 hover:text-primary"
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
