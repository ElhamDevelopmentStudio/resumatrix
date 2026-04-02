"use client"

import { useCallback, useEffect, useMemo } from "react"
import { AlertCircleIcon, CheckmarkBadge01Icon, Layers01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import type { SectionKey } from "@/lib/career-data/types"
import { isBlankContact, isBlankEducation, isBlankExperience, isBlankProject, isBlankSkill } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { ContactsSection } from "./contacts-section"
import { EducationSection } from "./education-section"
import { ExperienceSection } from "./experience-section"
import { PersonalSection } from "./personal-section"
import { ProjectsSection } from "./projects-section"
import { QuickJumpCard } from "./quick-jump-card"
import { SkillsSection } from "./skills-section"
import { useCareerDataAutosave } from "./use-career-data-autosave"

const sectionLabels: Record<SectionKey, string> = {
  personal: "Personal info",
  contacts: "Contacts",
  experiences: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
}

const sectionIds: Record<SectionKey, string> = {
  personal: "career-section-personal",
  contacts: "career-section-contacts",
  experiences: "career-section-experience",
  projects: "career-section-projects",
  education: "career-section-education",
  skills: "career-section-skills",
}

export function CareerDataWorkspace() {
  const hydrate = useCareerDataStore((state) => state.hydrate)
  const saveAllSections = useCareerDataStore((state) => state.saveAllSections)
  const savePersonal = useCareerDataStore((state) => state.savePersonal)
  const saveContacts = useCareerDataStore((state) => state.saveContacts)
  const saveExperiences = useCareerDataStore((state) => state.saveExperiences)
  const saveProjects = useCareerDataStore((state) => state.saveProjects)
  const saveEducation = useCareerDataStore((state) => state.saveEducation)
  const saveSkills = useCareerDataStore((state) => state.saveSkills)
  const expandAllSections = useCareerDataStore((state) => state.expandAllSections)
  const collapseAllSections = useCareerDataStore((state) => state.collapseAllSections)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isLoading = useCareerDataStore((state) => state.isLoading)
  const loadError = useCareerDataStore((state) => state.loadError)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta)

  const personal = useCareerDataStore((state) => state.personal)
  const contacts = useCareerDataStore((state) => state.contacts)
  const experiences = useCareerDataStore((state) => state.experiences)
  const projects = useCareerDataStore((state) => state.projects)
  const education = useCareerDataStore((state) => state.education)
  const skills = useCareerDataStore((state) => state.skills)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useCareerDataAutosave({ enabled: !isLoading, value: personal, save: savePersonal })
  useCareerDataAutosave({ enabled: !isLoading, value: contacts, save: saveContacts })
  useCareerDataAutosave({ enabled: !isLoading, value: experiences, save: saveExperiences })
  useCareerDataAutosave({ enabled: !isLoading, value: projects, save: saveProjects })
  useCareerDataAutosave({ enabled: !isLoading, value: education, save: saveEducation })
  useCareerDataAutosave({ enabled: !isLoading, value: skills, save: saveSkills })

  const sectionCounts = useMemo(
    () => ({
      personal: personal.full_name || personal.title || personal.summary ? 1 : 0,
      contacts: contacts.filter((contact) => !isBlankContact(contact)).length,
      experiences: experiences.filter((entry) => !isBlankExperience(entry)).length,
      projects: projects.filter((entry) => !isBlankProject(entry)).length,
      education: education.filter((entry) => !isBlankEducation(entry)).length,
      skills: skills.filter((entry) => !isBlankSkill(entry)).length,
    }),
    [contacts, education, experiences, personal, projects, skills]
  )

  const completedSections = Object.values(sectionCounts).filter((count) => count > 0).length
  const savedSections = Object.values(sectionMeta).filter((meta) => Boolean(meta.lastSavedAt)).length
  const hasActiveSave = Object.values(sectionMeta).some((meta) => meta.status === "saving")

  const jumpItems = useMemo(
    () => [
      {
        key: "personal" as const,
        label: sectionLabels.personal,
        helper: "Your name, title, and summary.",
        countLabel: sectionCounts.personal ? "Ready" : "Start here",
        meta: sectionMeta.personal,
        isOpen: expandedSections.includes("personal"),
      },
      {
        key: "contacts" as const,
        label: sectionLabels.contacts,
        helper: "Email, portfolio, and profile links.",
        countLabel: `${sectionCounts.contacts} item${sectionCounts.contacts === 1 ? "" : "s"}`,
        meta: sectionMeta.contacts,
        isOpen: expandedSections.includes("contacts"),
      },
      {
        key: "experiences" as const,
        label: sectionLabels.experiences,
        helper: "Roles, dates, achievements, and tags.",
        countLabel: `${sectionCounts.experiences} item${sectionCounts.experiences === 1 ? "" : "s"}`,
        meta: sectionMeta.experiences,
        isOpen: expandedSections.includes("experiences"),
      },
      {
        key: "projects" as const,
        label: sectionLabels.projects,
        helper: "Projects, stack, and highlights.",
        countLabel: `${sectionCounts.projects} item${sectionCounts.projects === 1 ? "" : "s"}`,
        meta: sectionMeta.projects,
        isOpen: expandedSections.includes("projects"),
      },
      {
        key: "education" as const,
        label: sectionLabels.education,
        helper: "Degrees, certifications, and details.",
        countLabel: `${sectionCounts.education} item${sectionCounts.education === 1 ? "" : "s"}`,
        meta: sectionMeta.education,
        isOpen: expandedSections.includes("education"),
      },
      {
        key: "skills" as const,
        label: sectionLabels.skills,
        helper: "Skills, categories, and levels.",
        countLabel: `${sectionCounts.skills} item${sectionCounts.skills === 1 ? "" : "s"}`,
        meta: sectionMeta.skills,
        isOpen: expandedSections.includes("skills"),
      },
    ],
    [expandedSections, sectionCounts, sectionMeta]
  )

  const handleJump = useCallback(
    (section: SectionKey) => {
      if (!expandedSections.includes(section)) {
        toggleSection(section)
      }

      window.setTimeout(() => {
        document.getElementById(sectionIds[section])?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 80)
    },
    [expandedSections, toggleSection]
  )

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl items-center justify-center px-6 py-12 md:px-8 xl:px-12">
        <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
          <Spinner className="size-5" />
          <span>Loading your career data…</span>
        </div>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12 md:px-8">
        <Alert variant="destructive" className="rounded-sm border-outline-variant/60 px-4 py-3">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
          <AlertTitle>We couldn’t load your career data.</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>

        <div>
          <Button type="button" onClick={() => void hydrate()}>
            Try again
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 xl:px-12">
      <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex rounded-sm bg-primary-soft px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
            Unified workspace
          </span>
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">
              Career Data
            </h1>
            <p className="mt-2 text-base font-medium text-on-surface-variant/75">
              Add your personal info, experience, projects, education, and skills in one place. Everything here saves automatically and becomes the reusable base for future resume variants.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={expandAllSections}>
            Expand all
          </Button>
          <Button type="button" variant="outline" onClick={collapseAllSections}>
            Collapse all
          </Button>
          <Button type="button" onClick={() => void saveAllSections()}>
            Save all now
          </Button>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/60 uppercase">
                Coverage
              </p>
              <h2 className="mt-2 font-headline text-3xl font-bold text-on-surface">
                {completedSections}/6
              </h2>
              <p className="mt-2 text-sm font-medium text-on-surface-variant/70">
                Sections with meaningful content.
              </p>
            </div>
            <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="size-8 text-primary" />
          </div>
        </Card>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/60 uppercase">
                Saved sections
              </p>
              <h2 className="mt-2 font-headline text-3xl font-bold text-on-surface">
                {savedSections}
              </h2>
              <p className="mt-2 text-sm font-medium text-on-surface-variant/70">
                Sections with at least one successful save.
              </p>
            </div>
            <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className="size-8 text-success" />
          </div>
        </Card>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/60 uppercase">
                Autosave
              </p>
              <h2 className="mt-2 font-headline text-3xl font-bold text-on-surface">
                {hasActiveSave ? "On" : "Ready"}
              </h2>
              <p className="mt-2 text-sm font-medium text-on-surface-variant/70">
                {hasActiveSave
                  ? "Changes are being saved right now."
                  : "Updates save automatically after you pause typing."}
              </p>
            </div>
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-8 text-tertiary" />
          </div>
        </Card>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <PersonalSection />
          <ContactsSection />
          <ExperienceSection />
          <ProjectsSection />
          <EducationSection />
          <SkillsSection />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <QuickJumpCard items={jumpItems} onJump={handleJump} />
        </aside>
      </div>
    </main>
  )
}
