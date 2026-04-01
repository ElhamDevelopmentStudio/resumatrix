import type { ComponentProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  Add01Icon,
  ArrowRight01Icon,
  Briefcase01Icon,
  Clock01Icon,
  CloudDownloadIcon,
  CodeIcon,
  File01Icon,
  MoreHorizontalIcon,
  SparklesIcon,
  TerminalIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of CVs, profiles, and workspace activity.",
}

type IconDefinition = ComponentProps<typeof HugeiconsIcon>["icon"]

type StatItem = {
  icon: IconDefinition
  label: string
  value: string
  sublabel: string
  accentClassName: string
}

type CvItem = {
  title: string
  profile: string
  time: string
  type: string
  active?: boolean
}

type ProfileItem = {
  icon: IconDefinition
  title: string
  category: string
  description: string
  primary?: boolean
}

const stats: StatItem[] = [
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

const cvs: CvItem[] = [
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

const profiles: ProfileItem[] = [
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

function StatCard({ icon, label, value, sublabel, accentClassName }: StatItem) {
  return (
    <Card className="gap-0 rounded-[1.5rem] bg-white p-6 text-[#191c1d] shadow-sm ring-[#c5c5d4]/40 transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5", accentClassName)}>
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#454652]/60 uppercase">
          {label}
        </span>
      </div>
      <h3 className="font-headline text-3xl font-bold text-[#191c1d]">{value}</h3>
      <p className="mt-1 text-sm font-medium text-[#454652]">{sublabel}</p>
    </Card>
  )
}

function ResumeCard({ title, profile, time, type, active = false }: CvItem) {
  const isModernClean = type === "Modern Clean"

  return (
    <Card className="flex h-full gap-0 rounded-[1.75rem] bg-white p-7 text-[#191c1d] shadow-sm ring-[#c5c5d4]/40 transition-all duration-200 hover:-translate-y-1 hover:ring-[#002fbb]/30">
      <div className="mb-8 flex items-start justify-between">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-[#c5c5d4]/20 bg-[#f8f9fa] text-[#454652] transition-colors group-hover/card:text-[#002fbb]">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-8" />
          </div>
          {active ? (
            <div className="absolute -top-1 -right-1 size-4 rounded-full border-2 border-white bg-[#002fbb]" />
          ) : null}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase",
            isModernClean
              ? "border-indigo-100 bg-indigo-50 text-indigo-700"
              : "border-purple-100 bg-purple-50 text-purple-700"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isModernClean ? "bg-indigo-500" : "bg-purple-500"
            )}
          />
          {type}
        </span>
      </div>

      <div className="mb-8">
        <h3 className="mb-2 font-headline text-xl font-bold leading-tight text-[#191c1d]">
          {title}
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#454652]/60">
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-3.5" />
            <span>{profile}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#454652]/60">
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3.5" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3">
        <button
          type="button"
          className="flex-1 rounded-xl border border-[#c5c5d4]/20 bg-[#f8f9fa] px-4 py-3 font-bold text-[#454652] transition-colors hover:bg-[#c5c5d4]/20"
        >
          Edit Document
        </button>
        <button
          type="button"
          aria-label={`Download ${title}`}
          className="flex w-12 items-center justify-center rounded-xl bg-[#002fbb] py-3 text-white shadow-[0_12px_24px_rgba(0,47,187,0.2)] transition-all active:translate-y-px"
        >
          <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={2} className="size-5" />
        </button>
      </div>
    </Card>
  )
}

function ProfileCard({ icon, title, category, description, primary = false }: ProfileItem) {
  return (
    <Card className="gap-0 rounded-[1.5rem] bg-white p-6 text-[#191c1d] shadow-sm ring-[#c5c5d4]/40 transition-all duration-200 hover:-translate-y-1 hover:ring-[#002fbb]/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl ring-4",
              primary
                ? "bg-indigo-50 text-[#002fbb] ring-indigo-50/50"
                : "bg-[#f8f9fa] text-[#454652] ring-[#f8f9fa]/50"
            )}
          >
            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-[#191c1d]">{title}</h3>
            <p
              className={cn(
                "text-[10px] font-bold tracking-[0.2em] uppercase",
                primary ? "text-[#002fbb]" : "text-[#454652]/50"
              )}
            >
              {category}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`More actions for ${title}`}
          className="text-[#454652]/30 transition-colors hover:text-[#454652]"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-[18px]" />
        </button>
      </div>

      <p className="mb-6 text-sm leading-relaxed font-medium text-[#454652]">{description}</p>

      <button
        type="button"
        className="w-full rounded-xl border border-[#c5c5d4]/20 bg-[#f8f9fa] px-4 py-2.5 text-[11px] font-bold tracking-[0.2em] text-[#454652] uppercase transition-all hover:bg-indigo-50 hover:text-[#002fbb]"
      >
        Edit Profile
      </button>
    </Card>
  )
}

function OptimizerCard() {
  return (
    <Card className="relative col-span-1 gap-0 overflow-hidden rounded-[1.5rem] border-0 bg-gradient-to-br from-[#284ad8] to-[#00218a] p-6 text-white shadow-lg lg:col-span-2">
      <div className="relative z-10 max-w-[280px]">
        <div className="mb-2 flex items-center gap-2">
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-5" />
          <h3 className="font-headline text-xl font-bold">Resume Optimizer</h3>
        </div>
        <p className="text-sm leading-relaxed opacity-90">
          Improve your hiring success rate by 45% with our AI-powered professional technical curator.
        </p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#002fbb] shadow-md transition-all active:translate-y-px"
        >
          Run Performance Audit
        </button>
      </div>

      <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-10 motion-safe:animate-pulse">
        <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={1.5} className="size-40" />
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-6 pt-10 pb-24 md:px-8 xl:px-12">
        <section className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
          <OptimizerCard />
        </section>

        <div className="flex flex-col gap-16 lg:flex-row">
          <Section
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
              {cvs.map((resume) => (
                <ResumeCard key={resume.title} {...resume} />
              ))}
            </div>
          </Section>

          <Section
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
          </Section>
        </div>
      </main>

      <footer className="mt-auto flex flex-col items-center justify-between gap-6 border-t border-[#c5c5d4]/20 bg-[#f1f3f5] px-6 py-12 md:flex-row md:px-8 xl:px-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-headline text-lg font-bold text-[#191c1d]">Resumatrix</h2>
          <p className="text-xs font-medium text-[#454652]/60">
            © {currentYear} Resumatrix. Precision Engineering for Professionals.
          </p>
        </div>
        <div className="flex gap-8">
          {[
            "Privacy Policy",
            "Terms",
            "Security",
          ].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[11px] font-bold tracking-[0.2em] text-[#454652]/50 uppercase transition-colors hover:text-[#002fbb]"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </>
  )
}
