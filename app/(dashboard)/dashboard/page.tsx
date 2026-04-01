import type { ComponentProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Add01Icon, ArrowRight01Icon, CodeIcon, File01Icon, TerminalIcon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DashboardSection } from "./_components/dashboard-section"
import { OptimizerCard } from "./_components/optimizer-card"
import { ProfileCard } from "./_components/profile-card"
import { ResumeCard } from "./_components/resume-card"
import { StatCard } from "./_components/stat-card"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of CVs, profiles, and workspace activity.",
}

const stats: Array<ComponentProps<typeof StatCard>> = [
  {
    icon: File01Icon,
    label: "Storage",
    value: "2",
    sublabel: "Total CVs Created",
    accentClassName: "bg-indigo-50 text-[#002fbb]",
  },
  {
    icon: UserAccountIcon,
    label: "Identity",
    value: "3",
    sublabel: "Active Profiles",
    accentClassName: "bg-purple-50 text-[#4623af]",
  },
]

const resumes: Array<ComponentProps<typeof ResumeCard>> = [
  {
    title: "Senior Frontend Developer",
    profile: "Professional Profile",
    time: "2 days ago",
    type: "Modern Clean",
    active: true,
  },
  {
    title: "UI/UX Specialist",
    profile: "Creative Profile",
    time: "5 days ago",
    type: "Academic",
    active: true,
  },
]

const profiles: Array<ComponentProps<typeof ProfileCard>> = [
  {
    icon: CodeIcon,
    title: "Frontend Dev",
    category: "Primary",
    description:
      "Expert in React ecosystem and UI/UX design with strong performance metrics.",
    primary: true,
  },
  {
    icon: TerminalIcon,
    title: "Technical Lead",
    category: "Management",
    description:
      "Architecture lead and team management across distributed engineering units.",
  },
]

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 pt-10 pb-24 md:px-8 xl:px-12">
      <section className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
        <OptimizerCard />
      </section>

      <div className="flex flex-col gap-16 lg:flex-row">
        <DashboardSection
          title="Your CVs"
          description="Manage and curate your professional career documents."
          action={
            <Link
              href="/cvs"
              prefetch={false}
              className="group flex items-center gap-2 text-sm font-bold text-[#002fbb] hover:underline underline-offset-4"
            >
              <span>View Library</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-[18px] transition-transform group-hover:translate-x-1"
              />
            </Link>
          }
          className="flex-grow"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {resumes.map((resume) => (
              <ResumeCard key={resume.title} {...resume} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          as="aside"
          title="Profiles"
          description="Specialized identities."
          className="w-full shrink-0 lg:w-80"
        >
          <div className="space-y-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.title} {...profile} />
            ))}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-[#c5c5d4]/40 px-4 py-5 text-sm font-bold text-[#454652]/40 transition-all hover:border-[#002fbb] hover:bg-indigo-50/30 hover:text-[#002fbb]"
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-5" />
              <span>Create New Profile</span>
            </button>
          </div>
        </DashboardSection>
      </div>
    </main>
  )
}
