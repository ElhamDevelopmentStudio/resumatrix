"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CareerWorkspaceData, PersonalData } from "@/lib/career-data/types"
import { deleteCv, updateCv } from "@/lib/cvs/api"
import { applyCvContentOverrides, buildCvRenderModel } from "@/lib/cvs/engine"
import { getCvSectionLabel } from "@/lib/cvs/presentation"
import {
  type CvContactContentOverride,
  type CvData,
  type CvEducationContentOverride,
  type CvExperienceContentOverride,
  type CvOverrideSection,
  type CvPayload,
  type CvProjectContentOverride,
  type CvSkillContentOverride,
  type CvTemplateMetadata,
} from "@/lib/cvs/types"
import {
  getFirstCvValidationMessage,
  hasCvValidationErrors,
  validateCvPayload,
} from "@/lib/cvs/validation"
import { buildProfileDataset } from "@/lib/profiles/engine"
import type { ProfileData } from "@/lib/profiles/types"

import { CvContentEditor } from "./cv-content-editor"
import { CvExportLinks } from "./cv-export-links"
import { CvPreviewPanel } from "./cv-preview-panel"
import {
  CvSectionSelectorDialog,
  type CvSectionSelectorItem,
} from "./cv-section-selector-dialog"

const inputClassName =
  "h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"

const selectClassName =
  "w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:rounded-sm [&_[data-slot=native-select]]:border-outline-variant/70 [&_[data-slot=native-select]]:bg-background [&_[data-slot=native-select]]:px-3 [&_[data-slot=native-select]]:pr-8 [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:text-on-surface [&_[data-slot=native-select]]:focus-visible:border-primary [&_[data-slot=native-select]]:focus-visible:ring-primary/20 [&_[data-slot=native-select-icon]]:right-3 [&_[data-slot=native-select-icon]]:size-4 [&_[data-slot=native-select-icon]]:text-on-surface-variant/60"

type TemplateOption = CvTemplateMetadata & {
  preview_blurb: string
}

type CvEditorProps = {
  cv: CvData
  profiles: ProfileData[]
  careerData: CareerWorkspaceData
  templates: TemplateOption[]
}

type SelectionSection = {
  key: CvOverrideSection
  label: string
  itemLabel: string
  description: string
  helper: string
  currentCount: number
  automaticCount: number
  selection: string[] | null
  items: CvSectionSelectorItem[]
}

type CvContentSectionKey = Exclude<keyof CvPayload["overrides"]["content"], "personal">

function buildPayload(cv: CvData): CvPayload {
  return {
    name: cv.name,
    profile_id: cv.profile_id,
    template_id: cv.template_id,
    overrides: cv.overrides,
  }
}

function buildSnapshot(payload: CvPayload) {
  return JSON.stringify(payload)
}

function buildSelectionSections(
  allItemsDataset: CareerWorkspaceData,
  automaticDataset: CareerWorkspaceData,
  payload: CvPayload,
  counts: Record<CvOverrideSection, number>
): SelectionSection[] {
  const formatItemLabel = (singularLabel: string, pluralLabel: string, count: number) =>
    count === 1 ? singularLabel : pluralLabel

  const buildAutomaticHelper = (
    singularLabel: string,
    pluralLabel: string,
    automaticCount: number,
    totalCount: number
  ) => {
    if (!totalCount) {
      return `No saved ${formatItemLabel(singularLabel, pluralLabel, totalCount)} yet.`
    }

    if (!automaticCount) {
      return `The linked profile currently filters out every saved ${singularLabel}. Choose by hand if you want to add one here.`
    }

    if (automaticCount === totalCount) {
      return `All ${totalCount} ${formatItemLabel(singularLabel, pluralLabel, totalCount)} stay on by default.`
    }

    return `${automaticCount} of ${totalCount} ${formatItemLabel(singularLabel, pluralLabel, totalCount)} stay on by default. The rest are currently filtered out by the profile.`
  }

  const buildCustomHelper = (
    pluralLabel: string,
    selectedCount: number,
    totalCount: number
  ) =>
    `${selectedCount} of ${totalCount} ${pluralLabel} selected for this CV.`

  const automaticContactIds = new Set(automaticDataset.contacts.map((contact) => contact.id))
  const automaticExperienceIds = new Set(automaticDataset.experiences.map((entry) => entry.id))
  const automaticProjectIds = new Set(automaticDataset.projects.map((project) => project.id))
  const automaticEducationIds = new Set(automaticDataset.education.map((entry) => entry.id))
  const automaticSkillIds = new Set(automaticDataset.skills.map((skill) => skill.id))

  return [
    {
      key: "contacts",
      label: "Contacts",
      itemLabel: "contact method",
      description:
        "Profile matches stay on by default. Switch to choosing by hand if you want to add or remove specific contact lines for this CV.",
      helper:
        payload.overrides.selections.contacts === null
          ? buildAutomaticHelper(
              "contact method",
              "contact methods",
              automaticDataset.contacts.length,
              allItemsDataset.contacts.length
            )
          : buildCustomHelper(
              "contact methods",
              payload.overrides.selections.contacts.length,
              allItemsDataset.contacts.length
            ),
      currentCount: counts.contacts,
      automaticCount: automaticDataset.contacts.length,
      selection: payload.overrides.selections.contacts,
      items: allItemsDataset.contacts.map((contact) => ({
        id: contact.id,
        title: contact.type || "Contact",
        description: contact.value,
        meta: [contact.type || "Contact"],
        available: automaticContactIds.has(contact.id),
      })),
    },
    {
      key: "experiences",
      label: "Experience",
      itemLabel: "experience",
      description:
        "Profile matches stay on by default. Switch to choosing by hand if you want to add or remove specific experience entries for this CV.",
      helper:
        payload.overrides.selections.experiences === null
          ? buildAutomaticHelper(
              "experience entry",
              "experience entries",
              automaticDataset.experiences.length,
              allItemsDataset.experiences.length
            )
          : buildCustomHelper(
              "experience entries",
              payload.overrides.selections.experiences.length,
              allItemsDataset.experiences.length
            ),
      currentCount: counts.experiences,
      automaticCount: automaticDataset.experiences.length,
      selection: payload.overrides.selections.experiences,
      items: allItemsDataset.experiences.map((entry) => ({
        id: entry.id,
        title: `${entry.role || "Role"} · ${entry.company || "Company"}`,
        description: entry.location || "No location added",
        meta: [`${entry.start_date} → ${entry.end_date || "Present"}`],
        available: automaticExperienceIds.has(entry.id),
      })),
    },
    {
      key: "projects",
      label: "Projects",
      itemLabel: "project",
      description:
        "Profile matches stay on by default. Switch to choosing by hand if you want to add a project the profile filtered out, or remove one that is already showing.",
      helper:
        payload.overrides.selections.projects === null
          ? buildAutomaticHelper(
              "project",
              "projects",
              automaticDataset.projects.length,
              allItemsDataset.projects.length
            )
          : buildCustomHelper(
              "projects",
              payload.overrides.selections.projects.length,
              allItemsDataset.projects.length
            ),
      currentCount: counts.projects,
      automaticCount: automaticDataset.projects.length,
      selection: payload.overrides.selections.projects,
      items: allItemsDataset.projects.map((project) => ({
        id: project.id,
        title: project.name || "Project",
        description: project.description || "No description added",
        meta: project.tech_stack,
        available: automaticProjectIds.has(project.id),
      })),
    },
    {
      key: "education",
      label: "Education",
      itemLabel: "education item",
      description:
        "Profile matches stay on by default. Switch to choosing by hand if you want to add or remove specific education entries for this CV.",
      helper:
        payload.overrides.selections.education === null
          ? buildAutomaticHelper(
              "education entry",
              "education entries",
              automaticDataset.education.length,
              allItemsDataset.education.length
            )
          : buildCustomHelper(
              "education entries",
              payload.overrides.selections.education.length,
              allItemsDataset.education.length
            ),
      currentCount: counts.education,
      automaticCount: automaticDataset.education.length,
      selection: payload.overrides.selections.education,
      items: allItemsDataset.education.map((entry) => ({
        id: entry.id,
        title: `${entry.degree || "Degree"} · ${entry.institution || "Institution"}`,
        description: entry.details || "No extra details added",
        meta: [`${entry.start_date} → ${entry.end_date || "Present"}`],
        available: automaticEducationIds.has(entry.id),
      })),
    },
    {
      key: "skills",
      label: "Skills",
      itemLabel: "skill",
      description:
        "Profile matches stay on by default. Switch to choosing by hand if you want to add or remove specific skills for this CV.",
      helper:
        payload.overrides.selections.skills === null
          ? buildAutomaticHelper(
              "skill",
              "skills",
              automaticDataset.skills.length,
              allItemsDataset.skills.length
            )
          : buildCustomHelper(
              "skills",
              payload.overrides.selections.skills.length,
              allItemsDataset.skills.length
            ),
      currentCount: counts.skills,
      automaticCount: automaticDataset.skills.length,
      selection: payload.overrides.selections.skills,
      items: allItemsDataset.skills.map((skill) => ({
        id: skill.id,
        title: skill.name || "Skill",
        description:
          [skill.category, skill.level].filter(Boolean).join(" · ") ||
          "No category or level added",
        meta: [skill.category, skill.level].filter(Boolean),
        available: automaticSkillIds.has(skill.id),
      })),
    },
  ]
}

export function CvEditor({ cv, profiles, careerData, templates }: CvEditorProps) {
  const router = useRouter()
  const [state, setState] = useState<CvPayload>(() => buildPayload(cv))
  const [savedSnapshot, setSavedSnapshot] = useState(() => buildSnapshot(buildPayload(cv)))
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeSelectionSection, setActiveSelectionSection] = useState<CvOverrideSection | null>(null)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    "content" | "layout" | "items" | "document"
  >("content")

  const selectedProfile = profiles.find((profile) => profile.id === state.profile_id)
  const selectedTemplate = templates.find((template) => template.id === state.template_id)
  const validationErrors = useMemo(() => validateCvPayload(state), [state])
  const payloadSnapshot = useMemo(() => buildSnapshot(state), [state])
  const isDirty = payloadSnapshot !== savedSnapshot
  const canSave = Boolean(selectedProfile && selectedTemplate) && !hasCvValidationErrors(validationErrors)

  const automaticSelectionDataset = useMemo(() => {
    if (!selectedProfile) {
      return null
    }

    return applyCvContentOverrides(
      buildProfileDataset(selectedProfile, careerData),
      state.overrides.content
    )
  }, [careerData, selectedProfile, state.overrides.content])

  const allItemsDataset = useMemo(
    () => applyCvContentOverrides(careerData, state.overrides.content),
    [careerData, state.overrides.content]
  )

  const renderModel = useMemo(() => {
    if (!selectedProfile || !selectedTemplate) {
      return null
    }

    return buildCvRenderModel(state, selectedProfile, careerData, selectedTemplate)
  }, [careerData, selectedProfile, selectedTemplate, state])

  const selectionSections = useMemo(() => {
    if (!automaticSelectionDataset || !renderModel) {
      return []
    }

    return buildSelectionSections(allItemsDataset, automaticSelectionDataset, state, {
      contacts: renderModel.contacts.length,
      experiences: renderModel.experiences.length,
      projects: renderModel.projects.length,
      education: renderModel.education.length,
      skills: renderModel.skills.length,
    })
  }, [allItemsDataset, automaticSelectionDataset, renderModel, state])

  const activeSelectionDefinition = activeSelectionSection
    ? selectionSections.find((section) => section.key === activeSelectionSection) ?? null
    : null

  const updateState = (updater: (currentState: CvPayload) => CvPayload) => {
    setState((currentState) => updater(currentState))
    setSaveError(null)
  }

  const persistChanges = useCallback(
    async (nextPayload: CvPayload) => {
      setSaveState("saving")
      setSaveError(null)

      try {
        const updatedCv = await updateCv(cv.id, nextPayload)
        setSavedSnapshot(buildSnapshot(buildPayload(updatedCv)))
        setSaveState("saved")
      } catch (error) {
        setSaveState("error")
        setSaveError(error instanceof Error ? error.message : "We couldn’t save this CV right now.")
        throw error
      }
    },
    [cv.id]
  )

  useEffect(() => {
    if (!isDirty || !canSave) {
      return
    }

    const timeout = window.setTimeout(() => {
      void persistChanges(state)
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [canSave, isDirty, persistChanges, state])

  const flushSave = useCallback(async () => {
    if (!isDirty) {
      return
    }

    if (!canSave) {
      throw new Error(getFirstCvValidationMessage(validationErrors))
    }

    await persistChanges(state)
  }, [canSave, isDirty, persistChanges, state, validationErrors])

  const handleDelete = async () => {
    setIsDeleting(true)
    setSaveError(null)

    try {
      await deleteCv(cv.id)
      router.push("/cvs")
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "We couldn’t delete this CV right now.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const saveStatusLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Save failed"
        : isDirty
          ? "Unsaved changes"
          : "Saved"

  const moveSection = (section: CvOverrideSection, direction: -1 | 1) => {
    updateState((currentState) => {
      const sectionOrder = [...currentState.overrides.section_order]
      const currentIndex = sectionOrder.indexOf(section)
      const nextIndex = currentIndex + direction

      if (currentIndex === -1 || nextIndex < 0 || nextIndex >= sectionOrder.length) {
        return currentState
      }

      const nextOrder = [...sectionOrder]
      ;[nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]]

      return {
        ...currentState,
        overrides: {
          ...currentState.overrides,
          section_order: nextOrder,
        },
      }
    })
  }

  const toggleSectionVisibility = (section: CvOverrideSection) => {
    updateState((currentState) => {
      const isHidden = currentState.overrides.hidden_sections.includes(section)

      return {
        ...currentState,
        overrides: {
          ...currentState.overrides,
          hidden_sections: isHidden
            ? currentState.overrides.hidden_sections.filter((item) => item !== section)
            : [...currentState.overrides.hidden_sections, section],
        },
      }
    })
  }

  const handleSelectionSave = (section: CvOverrideSection, nextSelection: string[] | null) => {
    updateState((currentState) => ({
      ...currentState,
      overrides: {
        ...currentState.overrides,
        selections: {
          ...currentState.overrides.selections,
          [section]: nextSelection,
        },
      },
    }))
    setActiveSelectionSection(null)
  }

  const updatePersonalContent = (field: keyof PersonalData, value: string) => {
    updateState((currentState) => ({
      ...currentState,
      overrides: {
        ...currentState.overrides,
        content: {
          ...currentState.overrides.content,
          personal: {
            ...currentState.overrides.content.personal,
            [field]: value,
          },
        },
      },
    }))
  }

  const updateContentItem = <K extends CvContentSectionKey>(
    section: K,
    id: string,
    patch: CvPayload["overrides"]["content"][K][string]
  ) => {
    updateState((currentState) => ({
      ...currentState,
      overrides: {
        ...currentState.overrides,
        content: {
          ...currentState.overrides.content,
          [section]: {
            ...currentState.overrides.content[section],
            [id]: {
              ...(currentState.overrides.content[section][id] ?? {}),
              ...patch,
            },
          },
        },
      },
    }))
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 xl:px-12">
      <div className="space-y-3">
        <Link href="/cvs" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Back to CVs
        </Link>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
                {state.name || "Untitled CV"}
              </h1>
              <Badge variant="outline" className="border-outline-variant/70 bg-card text-on-surface-variant/80">
                {saveStatusLabel}
              </Badge>
            </div>
            <p className="text-sm text-on-surface-variant/75 md:text-base">
              {selectedProfile?.name || "No profile selected"} · {selectedTemplate?.name || "No template selected"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <CvExportLinks cvId={cv.id} disabled={!canSave} onBeforeExport={flushSave} buttonSize="sm" />
          </div>
        </div>
      </div>

      {saveError ? (
        <Alert variant="destructive" className="mt-4 border-destructive/20 bg-destructive/5">
          <AlertTitle>We couldn’t save this CV.</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      ) : null}

      {!selectedProfile || !selectedTemplate ? (
        <Alert variant="destructive" className="mt-4 border-destructive/20 bg-destructive/5">
          <AlertTitle>This CV needs attention</AlertTitle>
          <AlertDescription>{getFirstCvValidationMessage(validationErrors)}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-sm border border-outline-variant/60 bg-card shadow-sm">
        <ResizablePanelGroup orientation="horizontal" className="min-h-[76vh]">
          <ResizablePanel defaultSize={38} minSize={30}>
            <div className="h-full overflow-auto bg-card p-4 md:p-5">
              <Tabs
                value={activeWorkspaceTab}
                onValueChange={(value) =>
                  setActiveWorkspaceTab(
                    value as "content" | "layout" | "items" | "document"
                  )
                }
                className="gap-4"
              >
                <div className="rounded-sm border border-outline-variant/60 bg-card px-4 py-3">
                  <p className="text-sm font-medium text-on-surface">Choose one area to work on</p>
                  <p className="mt-1 text-sm text-on-surface-variant/75">
                    This keeps the editor focused so you only see the controls you need right now.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <TabsList
                    variant="line"
                    className="w-full min-w-max justify-start gap-1 rounded-none border-b border-outline-variant/60 bg-transparent p-0"
                  >
                    <TabsTrigger value="content" className="rounded-none px-3 py-2 text-sm">
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="layout" className="rounded-none px-3 py-2 text-sm">
                      Layout
                    </TabsTrigger>
                    <TabsTrigger value="items" className="rounded-none px-3 py-2 text-sm">
                      Choose items
                    </TabsTrigger>
                    <TabsTrigger value="document" className="rounded-none px-3 py-2 text-sm">
                      Document
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="content" className="mt-0 outline-none">
                  <CvContentEditor
                    model={renderModel}
                    onPersonalChange={updatePersonalContent}
                    onContactChange={(id, patch: CvContactContentOverride) =>
                      updateContentItem("contacts", id, patch)
                    }
                    onExperienceChange={(id, patch: CvExperienceContentOverride) =>
                      updateContentItem("experiences", id, patch)
                    }
                    onProjectChange={(id, patch: CvProjectContentOverride) =>
                      updateContentItem("projects", id, patch)
                    }
                    onEducationChange={(id, patch: CvEducationContentOverride) =>
                      updateContentItem("education", id, patch)
                    }
                    onSkillChange={(id, patch: CvSkillContentOverride) =>
                      updateContentItem("skills", id, patch)
                    }
                    onOpenLayout={() => setActiveWorkspaceTab("layout")}
                    onOpenItems={() => setActiveWorkspaceTab("items")}
                  />
                </TabsContent>

                <TabsContent value="layout" className="mt-0 outline-none">
                  <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-none">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-semibold text-on-surface">Layout</h2>
                        <p className="mt-1 text-sm text-on-surface-variant/75">
                          Move sections up or down, or hide a section when you do not want it in this version.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {state.overrides.section_order.map((section, index) => {
                          const isHidden = state.overrides.hidden_sections.includes(section)
                          const count = selectionSections.find((item) => item.key === section)?.currentCount ?? 0

                          return (
                            <div
                              key={section}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-outline-variant/60 bg-surface-subtle/40 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-on-surface">
                                  {getCvSectionLabel(section)}
                                </p>
                                <p className="text-sm text-on-surface-variant/75">
                                  {isHidden
                                    ? "Hidden in this CV"
                                    : `${count} item${count === 1 ? "" : "s"} currently visible`}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveSection(section, -1)}
                                  disabled={index === 0}
                                >
                                  Move up
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveSection(section, 1)}
                                  disabled={index === state.overrides.section_order.length - 1}
                                >
                                  Move down
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isHidden ? "outline" : "default"}
                                  onClick={() => toggleSectionVisibility(section)}
                                >
                                  {isHidden ? "Show" : "Hide"}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="items" className="mt-0 outline-none">
                  <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-none">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-semibold text-on-surface">Choose items</h2>
                        <p className="mt-1 text-sm text-on-surface-variant/75">
                          Everything that matches the linked profile starts on. Switch a section to choosing by hand when you want to add a saved item back in, or trim something out for this CV.
                        </p>
                      </div>

                      {selectionSections.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {selectionSections.map((section) => {
                            const isCustom = section.selection !== null
                            const enabledCount = section.selection?.length ?? section.automaticCount

                            return (
                              <Card
                                key={section.key}
                                className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none"
                              >
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-medium text-on-surface">{section.label}</h3>
                                    <Badge variant={isCustom ? "default" : "outline"}>
                                      {isCustom ? "Choosing by hand" : "Profile default"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-on-surface-variant/75">{section.helper}</p>
                                  <p className="text-xs text-on-surface-variant/70">
                                    {enabledCount} of {section.items.length} turned on • {section.currentCount} currently visible
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setActiveSelectionSection(section.key)}
                                      disabled={!section.items.length}
                                    >
                                      Choose {section.label.toLowerCase()}
                                    </Button>
                                    {isCustom ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSelectionSave(section.key, null)}
                                      >
                                        Use profile default again
                                      </Button>
                                    ) : null}
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      ) : (
                        <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
                          <EmptyHeader>
                            <EmptyTitle>Choose a profile first</EmptyTitle>
                            <EmptyDescription>
                              The item controls will appear here as soon as this CV is linked to a valid profile.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="document" className="mt-0 outline-none">
                  <div className="space-y-4">
                    <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-none">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold text-on-surface">Document</h2>
                          <p className="mt-1 text-sm text-on-surface-variant/75">
                            Change the name, profile, or template for this CV.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <FieldLabel className="text-sm font-medium text-on-surface">CV name</FieldLabel>
                          <Input
                            value={state.name}
                            onChange={(event) =>
                              updateState((currentState) => ({
                                ...currentState,
                                name: event.target.value,
                              }))
                            }
                            placeholder="Frontend Engineer CV"
                            className={inputClassName}
                          />
                          <FieldError>{validationErrors.name}</FieldError>
                        </div>

                        <div className="space-y-2">
                          <FieldLabel className="text-sm font-medium text-on-surface">Profile</FieldLabel>
                          <FieldDescription>
                            Pick the profile that supplies the base content for this CV.
                          </FieldDescription>
                          <NativeSelect
                            value={state.profile_id}
                            onChange={(event) =>
                              updateState((currentState) => ({
                                ...currentState,
                                profile_id: event.target.value,
                              }))
                            }
                            className={selectClassName}
                          >
                            {profiles.map((profile) => (
                              <NativeSelectOption key={profile.id} value={profile.id}>
                                {profile.name}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                          <FieldError>{validationErrors.profile_id}</FieldError>
                        </div>

                        <div className="space-y-2">
                          <FieldLabel className="text-sm font-medium text-on-surface">Template</FieldLabel>
                          <FieldDescription>
                            Templates stay separate from your data, so you can switch layouts any time.
                          </FieldDescription>
                          <NativeSelect
                            value={state.template_id}
                            onChange={(event) =>
                              updateState((currentState) => ({
                                ...currentState,
                                template_id: event.target.value,
                              }))
                            }
                            className={selectClassName}
                          >
                            {templates.map((template) => (
                              <NativeSelectOption key={template.id} value={template.id}>
                                {template.name}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                          <FieldError>{validationErrors.template_id}</FieldError>
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-none">
                      <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-on-surface">Source data</h2>
                        <p className="text-sm text-on-surface-variant/75">
                          Need to change the master data or profile rules? Open them here, then come back to this editor.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href="/career-data"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open career data
                          </Link>
                          <Link
                            href="/profiles"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open profiles
                          </Link>
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-sm border border-destructive/20 bg-card p-5 shadow-none">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-on-surface">Delete this CV</h2>
                          <p className="text-sm text-on-surface-variant/75">
                            Delete this document only if you are sure you no longer need it. Your career data and profiles will stay untouched.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                          disabled={isDeleting}
                        >
                          Delete CV
                        </Button>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={62} minSize={36}>
            <div className="h-full overflow-auto bg-surface-subtle/30 p-4 md:p-5">
              {renderModel ? (
                <CvPreviewPanel templateId={selectedTemplate?.id ?? ""} model={renderModel} />
              ) : (
                <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-16">
                  <EmptyHeader>
                    <EmptyTitle>Preview unavailable</EmptyTitle>
                    <EmptyDescription>
                      Link this CV to a valid profile and template to see the preview again.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {activeSelectionDefinition ? (
        <CvSectionSelectorDialog
          key={`${activeSelectionDefinition.key}-${activeSelectionDefinition.selection === null ? "automatic" : activeSelectionDefinition.selection.join(",")}`}
          open
          onOpenChange={(open) => {
            if (!open) {
              setActiveSelectionSection(null)
            }
          }}
          sectionLabel={activeSelectionDefinition.label}
          itemLabel={activeSelectionDefinition.itemLabel}
          description={activeSelectionDefinition.description}
          items={activeSelectionDefinition.items}
          value={activeSelectionDefinition.selection}
          onSave={(nextSelection) => handleSelectionSave(activeSelectionDefinition.key, nextSelection)}
        />
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CV?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete ${state.name || "this CV"}. Your career data and profiles will not be deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={isDeleting} className="gap-2">
              {isDeleting ? <Spinner className="size-4" /> : null}
              Delete CV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
