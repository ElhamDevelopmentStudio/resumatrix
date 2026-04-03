import type { ComponentProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  Add01Icon,
  ArrowRight01Icon,
  CodeIcon,
  File01Icon,
  TerminalIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { formatCvUpdatedAt } from "@/lib/cvs/presentation"
import { listCvsData } from "@/lib/cvs/store"
import { buildProfileRuleSummary, getProfileScopeLabel } from "@/lib/profiles/presentation"
import { listProfilesData } from "@/lib/profiles/store"
import { getCvTemplate } from "@/lib/templates/registry"

import { DashboardSection } from "./_components/dashboard-section"
import { OptimizerCard } from "./_components/optimizer-card"
import { ProfileCard } from "./_components/profile-card"
import { ResumeCard } from "./_components/resume-card"
import { StatCard } from "./_components/stat-card"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of CVs, profiles, and workspace activity.",
}

export default async function DashboardPage() {
  const [careerData, cvs, profiles] = await Promise.all([
    getCareerWorkspaceData(),
    listCvsData(),
    listProfilesData(),
  ])

  const stats: Array<ComponentProps<typeof StatCard>> = [
    {
      icon: File01Icon,
      label: "Storage",
      value: String(cvs.length),
      sublabel: cvs.length === 1 ? "Total CV Created" : "Total CVs Created",
      accentClassName: "bg-primary-soft text-primary",
    },
    {
      icon: UserAccountIcon,
      label: "Identity",
      value: String(profiles.length),
      sublabel: profiles.length === 1 ? "Active Profile" : "Active Profiles",
      accentClassName: "bg-tertiary-soft text-tertiary",
    },
  ]

  const resumeCards: Array<ComponentProps<typeof ResumeCard>> = cvs.slice(0, 2).map((cv) => ({
    title: cv.name,
    profile: profiles.find((profile) => profile.id === cv.profile_id)?.name ?? "Missing profile",
    time: formatCvUpdatedAt(cv.updated_at),
    type: getCvTemplate(cv.template_id)?.name ?? "Missing template",
    href: `/cvs/${cv.id}`,
    downloadHref: `/api/cvs/${cv.id}/export?format=pdf`,
    active: true,
  }))

  const profileCards: Array<ComponentProps<typeof ProfileCard>> = profiles.slice(0, 2).map((profile, index) => ({
    icon: index === 0 ? CodeIcon : TerminalIcon,
    title: profile.name,
    category: getProfileScopeLabel(profile),
    description:
      buildProfileRuleSummary(profile).join(" • ") ||
      "Uses your full saved career dataset with no extra filtering rules.",
    editHref: `/profiles/${profile.id}`,
    primary: index === 0,
  }))

  const hasCareerData =
    Boolean(careerData.personal.full_name || careerData.personal.title || careerData.personal.summary) ||
    careerData.contacts.length +
      careerData.experiences.length +
      careerData.projects.length +
      careerData.education.length +
      careerData.skills.length >
      0

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
          description="Create, edit, and export the tailored CVs you generate from your profiles."
          action={
            <Link
              href="/cvs"
              className="group flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
            >
              <span>Open CV library</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-[18px] transition-transform group-hover:translate-x-1"
              />
            </Link>
          }
          className="flex-grow"
        >
          {resumeCards.length ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {resumeCards.map((resume) => (
                <ResumeCard key={resume.title} {...resume} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-sm border-2 border-dashed border-outline-variant/60 bg-card p-8">
              <p className="text-sm text-on-surface-variant/75">
                You haven’t generated a CV yet. Create one from a profile and choose a template to get started.
              </p>
              <Link
                href={profiles.length ? "/cvs/new" : hasCareerData ? "/profiles/new" : "/career-data"}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                <span>
                  {profiles.length
                    ? "Create first CV"
                    : hasCareerData
                      ? "Create a profile first"
                      : "Add career data first"}
                </span>
              </Link>
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          as="aside"
          title="Profiles"
          description="Focused resume variants built from your saved data."
          action={
            <Link
              href="/profiles"
              className="group flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"
            >
              <span>Manage Profiles</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-[18px] transition-transform group-hover:translate-x-1"
              />
            </Link>
          }
          className="w-full shrink-0 lg:w-80"
        >
          <div className="space-y-6">
            {profileCards.length ? (
              profileCards.map((profile) => <ProfileCard key={profile.title} {...profile} />)
            ) : (
              <div className="rounded-sm border-2 border-dashed border-outline-variant/60 bg-card p-6 text-sm text-on-surface-variant/75">
                Build at least one profile to start generating CVs from your saved career data.
              </div>
            )}
            <Link
              href="/profiles/new"
              className="flex h-auto w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-outline-variant/60 px-4 py-5 text-sm font-bold text-on-surface-variant/40 transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-5" />
              <span>Create New Profile</span>
            </Link>
          </div>
        </DashboardSection>
      </div>
    </main>
  )
}
