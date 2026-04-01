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

import { cn } from "@/lib/utils"

type IconDefinition = ComponentProps<typeof HugeiconsIcon>["icon"]

type NavItem = {
  label: string
  href: string
  icon: IconDefinition
  active?: boolean
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardSquare01Icon,
    active: true,
  },
  {
    label: "Personal Info",
    href: "/cvs",
    icon: ProfileIcon,
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b border-[#c5c5d4]/30 bg-[#f1f3f5] px-6 py-6 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
      <div className="mb-8 flex flex-col gap-1 lg:mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#002fbb] text-white">
            <HugeiconsIcon icon={TerminalIcon} strokeWidth={2} className="size-[18px]" />
          </div>
          <span className="font-headline text-xl font-bold text-[#002fbb]">Resumatrix</span>
        </Link>
        <p className="px-1 text-xs font-medium text-[#454652]/60">Technical Curator</p>
      </div>

      <nav className="flex flex-col gap-1 lg:flex-1" aria-label="Primary">
        {navigationItems.map((item) => {
          const isActive = item.active && pathname === item.href
          const isPlaceholder = item.href !== "/dashboard"

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              prefetch={isPlaceholder ? false : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border border-[#c5c5d4]/50 bg-white font-bold text-[#002fbb] shadow-sm"
                  : "text-[#454652] hover:bg-white/50 hover:text-[#002fbb]"
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 border-t border-[#c5c5d4]/30 pt-6">
        <Link
          href="/cvs"
          prefetch={false}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002fbb] px-4 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,47,187,0.2)] transition-all hover:bg-[#284ad8] active:translate-y-px"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-5" />
          <span>New CV</span>
        </Link>
      </div>
    </aside>
  )
}
