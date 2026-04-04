"use client"

import { useCallback, useEffect, useMemo } from "react"
import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import type { CareerWorkspaceData, SectionKey } from "@/lib/career-data/types"
import {
  isBlankContact,
  isBlankEducation,
  isBlankExperience,
  isBlankProject,
  isBlankSkill,
} from "@/lib/career-data/validation"
import {
  CareerDataStoreProvider,
  useCareerDataStore,
} from "@/lib/career-data/workspace-store"

import { CareerDataSectionNav } from "./career-data-section-nav"
import { ContactsSection } from "./contacts-section"
import { EducationSection } from "./education-section"
import { ExperienceSection } from "./experience-section"
import { PersonalSection } from "./personal-section"
import { ProjectsSection } from "./projects-section"
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

const sectionSteps: Record<SectionKey, string> = {
  personal: "01",
  contacts: "02",
  experiences: "03",
  projects: "04",
  education: "05",
  skills: "06",
}

const sectionIds: Record<SectionKey, string> = {
  personal: "career-section-personal",
  contacts: "career-section-contacts",
  experiences: "career-section-experience",
  projects: "career-section-projects",
  education: "career-section-education",
  skills: "career-section-skills",
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

type CareerDataWorkspaceProps = {
  initialWorkspace?: CareerWorkspaceData
}

type CareerDataWorkspaceContentProps = {
  hasInitialWorkspace: boolean
}

function CareerDataWorkspaceContent({
  hasInitialWorkspace,
}: CareerDataWorkspaceContentProps) {
  const hydrate = useCareerDataStore((state) => state.hydrate)
  const openSection = useCareerDataStore((state) => state.openSection)
  const saveAllSections = useCareerDataStore((state) => state.saveAllSections)
  const savePersonal = useCareerDataStore((state) => state.savePersonal)
  const saveContacts = useCareerDataStore((state) => state.saveContacts)
  const saveExperiences = useCareerDataStore((state) => state.saveExperiences)
  const saveProjects = useCareerDataStore((state) => state.saveProjects)
  const saveEducation = useCareerDataStore((state) => state.saveEducation)
  const saveSkills = useCareerDataStore((state) => state.saveSkills)

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
    if (hasInitialWorkspace) {
      return
    }

    void hydrate()
  }, [hasInitialWorkspace, hydrate])

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
  const progressValue = Math.round((completedSections / 6) * 100)
  const activeSection = expandedSections[0] ?? null
  const hasActiveSave = Object.values(sectionMeta).some((meta) => meta.status === "saving")
  const hasSaveError = Object.values(sectionMeta).some((meta) => meta.status === "error")

  const navItems = useMemo(
    () => [
      {
        key: "personal" as const,
        step: sectionSteps.personal,
        label: sectionLabels.personal,
        helper: "Name, headline, and summary.",
        countLabel: sectionCounts.personal ? "Ready" : "Start here",
        meta: sectionMeta.personal,
        isActive: activeSection === "personal",
      },
      {
        key: "contacts" as const,
        step: sectionSteps.contacts,
        label: sectionLabels.contacts,
        helper: "Email, links, and contact details.",
        countLabel: pluralize(sectionCounts.contacts, "entry"),
        meta: sectionMeta.contacts,
        isActive: activeSection === "contacts",
      },
      {
        key: "experiences" as const,
        step: sectionSteps.experiences,
        label: sectionLabels.experiences,
        helper: "Roles, impact, and dates.",
        countLabel: pluralize(sectionCounts.experiences, "entry"),
        meta: sectionMeta.experiences,
        isActive: activeSection === "experiences",
      },
      {
        key: "projects" as const,
        step: sectionSteps.projects,
        label: sectionLabels.projects,
        helper: "Projects worth reusing later.",
        countLabel: pluralize(sectionCounts.projects, "entry"),
        meta: sectionMeta.projects,
        isActive: activeSection === "projects",
      },
      {
        key: "education" as const,
        step: sectionSteps.education,
        label: sectionLabels.education,
        helper: "Degrees, programs, and certifications.",
        countLabel: pluralize(sectionCounts.education, "entry"),
        meta: sectionMeta.education,
        isActive: activeSection === "education",
      },
      {
        key: "skills" as const,
        step: sectionSteps.skills,
        label: sectionLabels.skills,
        helper: "Skills you may want to feature.",
        countLabel: pluralize(sectionCounts.skills, "entry"),
        meta: sectionMeta.skills,
        isActive: activeSection === "skills",
      },
    ],
    [activeSection, sectionCounts, sectionMeta]
  )

  const handleJump = useCallback(
    (section: SectionKey) => {
      openSection(section)

      window.setTimeout(() => {
        document.getElementById(sectionIds[section])?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 80)
    },
    [openSection]
  )

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-5xl items-center justify-center px-6 py-12 md:px-8 xl:px-12">
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
    <main className="mx-auto w-full max-w-5xl px-6 py-8 md:px-8 xl:px-12">
      <Card className="mb-8 rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
              Career Data
            </Badge>
            <div className="space-y-2">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                A calmer workspace for your resume details
              </h1>
              <p className="text-sm text-on-surface-variant/75 md:text-base">
                Fill out one section at a time, jump around when you need to, and let autosave handle the rest.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="inline-flex items-center gap-2 rounded-sm border border-outline-variant/60 bg-surface-subtle px-3 py-2 text-sm font-medium text-on-surface-variant">
              {hasActiveSave ? (
                <>
                  <Spinner className="size-4" />
                  <span>Saving changes</span>
                </>
              ) : hasSaveError ? (
                <>
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 text-destructive" />
                  <span>Some sections need attention</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-success" />
                  <span>Autosave is on</span>
                </>
              )}
            </div>

            <Button type="button" variant="outline" onClick={() => void saveAllSections()}>
              Save now
            </Button>
          </div>
        </div>

        <Progress value={progressValue} className="mt-6">
          <div className="flex w-full items-center justify-between gap-3">
            <ProgressLabel className="text-sm font-medium text-on-surface">Progress</ProgressLabel>
            <span className="text-sm text-on-surface-variant/75">
              {completedSections} of 6 sections started
            </span>
          </div>
        </Progress>

        <p className="mt-3 text-sm text-on-surface-variant/70">
          Start at the top or jump to any section below. Only one section stays open at a time to keep things manageable.
        </p>
      </Card>

      <section className="mb-8 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Sections</h2>
          <p className="mt-1 text-sm text-on-surface-variant/70">
            Pick a section to focus on, then move on when you are ready.
          </p>
        </div>
        <CareerDataSectionNav items={navItems} onSelect={handleJump} />
      </section>

      <div className="space-y-4">
        <PersonalSection />
        <ContactsSection />
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <SkillsSection />
      </div>
    </main>
  )
}

export function CareerDataWorkspace({
  initialWorkspace,
}: CareerDataWorkspaceProps) {
  return (
    <CareerDataStoreProvider initialWorkspace={initialWorkspace}>
      <CareerDataWorkspaceContent hasInitialWorkspace={Boolean(initialWorkspace)} />
    </CareerDataStoreProvider>
  )
}
