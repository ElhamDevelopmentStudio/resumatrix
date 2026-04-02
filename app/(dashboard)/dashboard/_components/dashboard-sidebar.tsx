"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Add01Icon,
  AiBrainIcon,
  BadgeCheck,
  Briefcase01Icon,
  DashboardSquare01Icon,
  Folder01Icon,
  GraduationCap,
  ProfileIcon,
  Settings01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@/components/ui/button"
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
    label: "Personal Info",
    href: "/personal",
    icon: ProfileIcon,
    activeHref: "/personal",
  },
  {
    label: "Experience",
    href: "/cvs",
    icon: Briefcase01Icon,
  },
  {
    label: "Projects",
    href: "/cvs",
    icon: Folder01Icon,
  },
  {
    label: "Education",
    href: "/cvs",
    icon: GraduationCap,
  },
  {
    label: "Skills",
    href: "/cvs",
    icon: AiBrainIcon,
  },
  {
    label: "Profiles",
    href: "/profiles",
    icon: BadgeCheck,
  },
  {
    label: "Settings",
    href: "/dashboard",
    icon: Settings01Icon,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-outline-variant/60 bg-surface-muted px-6 py-6 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
      <div className="mb-8 flex flex-col gap-1 lg:mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <HugeiconsIcon icon={TerminalIcon} strokeWidth={2} className="size-[18px]" />
          </div>
          <span className="font-headline text-xl font-bold text-primary">Resumatrix</span>
        </Link>
        <p className="px-1 text-xs font-medium text-on-surface-variant/60">Technical Curator</p>
      </div>

      <nav className="flex flex-col gap-1 lg:flex-1" aria-label="Primary">
        {navigationItems.map((item) => {
          const isActive = item.activeHref ? pathname === item.activeHref : false
          const isPlaceholder = !item.activeHref

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              prefetch={isPlaceholder ? false : undefined}
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

      <div className="mt-6 border-t border-outline-variant/60 pt-6">
        <Link
          href="/cvs"
          prefetch={false}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-auto w-full gap-2 px-4 py-4 text-sm font-bold shadow-lg shadow-primary/15"
          )}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-5" />
          <span>New CV</span>
        </Link>
      </div>
    </aside>
  )
}
