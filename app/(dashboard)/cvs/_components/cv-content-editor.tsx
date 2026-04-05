"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { FunctionReference } from "convex/server"
import { useEffect, useState } from "react"

import { AiDiffOverlay } from "@/components/ai-diff-overlay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { CareerWorkspaceData, PersonalData } from "@/lib/career-data/types"
import type { RewriteSuggestion } from "@/lib/ai/types"
import type {
  CvContactContentOverride,
  CvEducationContentOverride,
  CvExperienceContentOverride,
  CvProjectContentOverride,
  CvRenderModel,
  CvSkillContentOverride,
} from "@/lib/cvs/types"

type ContentSectionKey =
  | "header"
  | "contacts"
  | "experiences"
  | "projects"
  | "education"
  | "skills"

type SelectableSectionKey = Exclude<ContentSectionKey, "header">

type CvContentEditorProps = {
  model: CvRenderModel | null
  careerData: CareerWorkspaceData
  regionId?: string
  onPersonalChange: (field: keyof PersonalData, value: string) => void
  onContactChange: (id: string, patch: CvContactContentOverride) => void
  onExperienceChange: (id: string, patch: CvExperienceContentOverride) => void
  onProjectChange: (id: string, patch: CvProjectContentOverride) => void
  onEducationChange: (id: string, patch: CvEducationContentOverride) => void
  onSkillChange: (id: string, patch: CvSkillContentOverride) => void
  onOpenLayout: () => void
  onOpenItems: () => void
}

const inputClassName =
  "h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"

const selectClassName =
  "w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:rounded-sm [&_[data-slot=native-select]]:border-outline-variant/70 [&_[data-slot=native-select]]:bg-background [&_[data-slot=native-select]]:px-3 [&_[data-slot=native-select]]:pr-8 [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:text-on-surface [&_[data-slot=native-select]]:focus-visible:border-primary [&_[data-slot=native-select]]:focus-visible:ring-primary/20 [&_[data-slot=native-select-icon]]:right-3 [&_[data-slot=native-select-icon]]:size-4 [&_[data-slot=native-select-icon]]:text-on-surface-variant/60"

const textareaClassName =
  "min-h-24 rounded-sm border-outline-variant/70 bg-background px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"

const panelClassName =
  "rounded-sm border border-outline-variant/60 bg-card p-4 shadow-none"

function listToEditorValue(value: string[]) {
  return value.join("\n")
}

function editorValueToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function getCurrentItem<T extends { id: string }>(items: T[], selectedId?: string | null) {
  if (!items.length) {
    return null
  }

  return items.find((item) => item.id === selectedId) ?? items[0]
}

function SectionIntro({
  title,
  description,
  count,
  hidden,
}: {
  title: string
  description: string
  count: number
  hidden?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        <Badge variant="outline" className="border-outline-variant/70 bg-card text-on-surface-variant/80">
          {count} item{count === 1 ? "" : "s"}
        </Badge>
        {hidden ? (
          <Badge variant="outline" className="border-outline-variant/70 bg-card text-on-surface-variant/80">
            Hidden in preview
          </Badge>
        ) : null}
      </div>
      <p className="text-sm text-on-surface-variant/75">{description}</p>
    </div>
  )
}

function HiddenNotice({ onOpenLayout }: { onOpenLayout: () => void }) {
  return (
    <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 px-4 py-3">
      <p className="text-sm text-on-surface-variant/80">
        This section is hidden in the preview right now. You can still edit it here.
      </p>
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onOpenLayout}>
        Open layout
      </Button>
    </div>
  )
}

function EmptySectionNotice({
  message,
  onOpenItems,
}: {
  message: string
  onOpenItems: () => void
}) {
  return (
    <Card className={panelClassName}>
      <p className="text-sm text-on-surface-variant/80">{message}</p>
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onOpenItems}>
        Choose items
      </Button>
    </Card>
  )
}

export function CvContentEditor({
  model,
  careerData,
  regionId = "international",
  onPersonalChange,
  onContactChange,
  onExperienceChange,
  onProjectChange,
  onEducationChange,
  onSkillChange,
  onOpenLayout,
  onOpenItems,
}: CvContentEditorProps) {
  const [activeSection, setActiveSection] = useState<ContentSectionKey>("header")
  const [selectedItemIds, setSelectedItemIds] = useState<Partial<Record<SelectableSectionKey, string>>>({})

  const rewriteField = useMutation(api.ai_functions.rewrite_field as unknown as FunctionReference<"mutation">)

  // AI state for summary field
  const [summaryAiState, setSummaryAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [summarySuggestion, setSummarySuggestion] = useState<RewriteSuggestion | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // AI state for experience role field
  const [experienceRoleAiState, setExperienceRoleAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [experienceRoleSuggestion, setExperienceRoleSuggestion] = useState<RewriteSuggestion | null>(null)
  const [experienceRoleError, setExperienceRoleError] = useState<string | null>(null)

  // AI state for experience bullets field
  const [experienceBulletsAiState, setExperienceBulletsAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [experienceBulletsSuggestion, setExperienceBulletsSuggestion] = useState<RewriteSuggestion | null>(null)
  const [experienceBulletsError, setExperienceBulletsError] = useState<string | null>(null)

  // AI state for project description field
  const [projectDescriptionAiState, setProjectDescriptionAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [projectDescriptionSuggestion, setProjectDescriptionSuggestion] = useState<RewriteSuggestion | null>(null)
  const [projectDescriptionError, setProjectDescriptionError] = useState<string | null>(null)

  // AI state for project bullets field
  const [projectBulletsAiState, setProjectBulletsAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [projectBulletsSuggestion, setProjectBulletsSuggestion] = useState<RewriteSuggestion | null>(null)
  const [projectBulletsError, setProjectBulletsError] = useState<string | null>(null)

  // AI state for education details field
  const [educationDetailsAiState, setEducationDetailsAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [educationDetailsSuggestion, setEducationDetailsSuggestion] = useState<RewriteSuggestion | null>(null)
  const [educationDetailsError, setEducationDetailsError] = useState<string | null>(null)

  // Reset AI state when selected experience changes
  const selectedExperienceId = selectedItemIds.experiences
  const selectedProjectId = selectedItemIds.projects
  const selectedEducationId = selectedItemIds.education

  // Summary AI handlers
  async function handleSummaryRewrite() {
    setSummaryAiState("loading")
    setSummaryError(null)
    const result = await rewriteField({
      fieldType: "summary",
      originalValue: model?.personal.summary ?? "",
      careerDataSerialized: JSON.stringify(careerData),
      regionId,
    })
    if (result.ok) {
      setSummarySuggestion(result.data)
      setSummaryAiState("suggestion")
    } else {
      setSummaryError(result.error)
      setSummaryAiState("error")
    }
  }

  function handleSummaryApply(newValue: string) {
    onPersonalChange("summary", newValue)
    setSummaryAiState("idle")
    setSummarySuggestion(null)
  }

  // Experience role AI handlers
  async function handleExperienceRoleRewrite() {
    if (!selectedExperience) return
    setExperienceRoleAiState("loading")
    setExperienceRoleError(null)
    const result = await rewriteField({
      fieldType: "role",
      originalValue: selectedExperience.role,
      careerDataSerialized: JSON.stringify(careerData),
      regionId,
    })
    if (result.ok) {
      setExperienceRoleSuggestion(result.data)
      setExperienceRoleAiState("suggestion")
    } else {
      setExperienceRoleError(result.error)
      setExperienceRoleAiState("error")
    }
  }

  function handleExperienceRoleApply(newValue: string) {
    if (!selectedExperience) return
    onExperienceChange(selectedExperience.id, { role: newValue })
    setExperienceRoleAiState("idle")
    setExperienceRoleSuggestion(null)
  }

  // Experience bullets AI handlers
  async function handleExperienceBulletsRewrite() {
    if (!selectedExperience) return
    setExperienceBulletsAiState("loading")
    setExperienceBulletsError(null)
    const result = await rewriteField({
      fieldType: "bullet",
      originalValue: listToEditorValue(selectedExperience.bullets),
      careerDataSerialized: JSON.stringify(careerData),
      regionId,
    })
    if (result.ok) {
      setExperienceBulletsSuggestion(result.data)
      setExperienceBulletsAiState("suggestion")
    } else {
      setExperienceBulletsError(result.error)
      setExperienceBulletsAiState("error")
    }
  }

  function handleExperienceBulletsApply(newValue: string) {
    if (!selectedExperience) return
    onExperienceChange(selectedExperience.id, { bullets: editorValueToList(newValue) })
    setExperienceBulletsAiState("idle")
    setExperienceBulletsSuggestion(null)
  }

  // Project description AI handlers
  async function handleProjectDescriptionRewrite() {
    if (!selectedProject) return
    setProjectDescriptionAiState("loading")
    setProjectDescriptionError(null)
    const result = await rewriteField({
      fieldType: "description",
      originalValue: selectedProject.description,
      careerDataSerialized: JSON.stringify(careerData),
      regionId,
    })
    if (result.ok) {
      setProjectDescriptionSuggestion(result.data)
      setProjectDescriptionAiState("suggestion")
    } else {
      setProjectDescriptionError(result.error)
      setProjectDescriptionAiState("error")
    }
  }

  function handleProjectDescriptionApply(newValue: string) {
    if (!selectedProject) return
    onProjectChange(selectedProject.id, { description: newValue })
    setProjectDescriptionAiState("idle")
    setProjectDescriptionSuggestion(null)
  }

  // Project bullets AI handlers
  async function handleProjectBulletsRewrite() {
    if (!selectedProject) return
    setProjectBulletsAiState("loading")
    setProjectBulletsError(null)
    const result = await rewriteField({
      fieldType: "bullet",
      originalValue: listToEditorValue(selectedProject.bullets),
      careerDataSerialized: JSON.stringify(careerData),
      regionId,
    })
    if (result.ok) {
      setProjectBulletsSuggestion(result.data)
      setProjectBulletsAiState("suggestion")
    } else {
      setProjectBulletsError(result.error)
      setProjectBulletsAiState("error")
    }
  }

  function handleProjectBulletsApply(newValue: string) {
    if (!selectedProject) return
    onProjectChange(selectedProject.id, { bullets: editorValueToList(newValue) })
    setProjectBulletsAiState("idle")
    setProjectBulletsSuggestion(null)
  }

  // Education details AI handlers
  async function handleEducationDetailsRewrite() {
    if (!selectedEducation) return
    setEducationDetailsAiState("loading")
    setEducationDetailsError(null)
    const result = await rewriteField({
      fieldType: "details",
      originalValue: selectedEducation.details,
      careerDataSerialized: JSON.stringify(careerData),
      regionId,
    })
    if (result.ok) {
      setEducationDetailsSuggestion(result.data)
      setEducationDetailsAiState("suggestion")
    } else {
      setEducationDetailsError(result.error)
      setEducationDetailsAiState("error")
    }
  }

  function handleEducationDetailsApply(newValue: string) {
    if (!selectedEducation) return
    onEducationChange(selectedEducation.id, { details: newValue })
    setEducationDetailsAiState("idle")
    setEducationDetailsSuggestion(null)
  }

  // Reset experience AI state when selected experience changes
  useEffect(() => {
    setExperienceRoleAiState("idle")
    setExperienceRoleSuggestion(null)
    setExperienceRoleError(null)
    setExperienceBulletsAiState("idle")
    setExperienceBulletsSuggestion(null)
    setExperienceBulletsError(null)
  }, [selectedExperienceId])

  // Reset project AI state when selected project changes
  useEffect(() => {
    setProjectDescriptionAiState("idle")
    setProjectDescriptionSuggestion(null)
    setProjectDescriptionError(null)
    setProjectBulletsAiState("idle")
    setProjectBulletsSuggestion(null)
    setProjectBulletsError(null)
  }, [selectedProjectId])

  // Reset education AI state when selected education changes
  useEffect(() => {
    setEducationDetailsAiState("idle")
    setEducationDetailsSuggestion(null)
    setEducationDetailsError(null)
  }, [selectedEducationId])

  if (!model) {
    return (
      <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
        <EmptyHeader>
          <EmptyTitle>Content editor unavailable</EmptyTitle>
          <EmptyDescription>
            Choose a valid profile and template to start editing this CV.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const hiddenSectionSet = new Set(model.hidden_sections)
  const selectedContact = getCurrentItem(model.contacts, selectedItemIds.contacts)
  const selectedExperience = getCurrentItem(model.experiences, selectedItemIds.experiences)
  const selectedProject = getCurrentItem(model.projects, selectedItemIds.projects)
  const selectedEducation = getCurrentItem(model.education, selectedItemIds.education)
  const selectedSkill = getCurrentItem(model.skills, selectedItemIds.skills)

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-outline-variant/60 bg-primary-soft/35 px-4 py-3">
        <p className="text-sm font-medium text-on-surface">Edit one area at a time</p>
        <p className="mt-1 text-sm text-on-surface-variant/80">
          Changes here only affect this CV. Pick a section below, then edit the item you want.
        </p>
      </div>

      <Tabs
        value={activeSection}
        onValueChange={(value) => setActiveSection(value as ContentSectionKey)}
        className="gap-4"
      >
        <div className="overflow-x-auto">
          <TabsList
            variant="line"
            className="w-full min-w-max justify-start gap-1 rounded-none border-b border-outline-variant/60 bg-transparent p-0"
          >
            <TabsTrigger value="header" className="rounded-none px-3 py-2 text-sm">
              Header
            </TabsTrigger>
            <TabsTrigger value="contacts" className="rounded-none px-3 py-2 text-sm">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="experiences" className="rounded-none px-3 py-2 text-sm">
              Experience
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-none px-3 py-2 text-sm">
              Projects
            </TabsTrigger>
            <TabsTrigger value="education" className="rounded-none px-3 py-2 text-sm">
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-none px-3 py-2 text-sm">
              Skills
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="header" className="mt-0 outline-none">
          <div className="space-y-4">
            <SectionIntro
              title="Header"
              description="Change the name, professional title, and summary for this version of the CV."
              count={3}
            />

            <Card className={panelClassName}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Full name</FieldLabel>
                  <Input
                    value={model.personal.full_name}
                    onChange={(event) => onPersonalChange("full_name", event.target.value)}
                    placeholder="Jane Doe"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Professional title</FieldLabel>
                  <Input
                    value={model.personal.title}
                    onChange={(event) => onPersonalChange("title", event.target.value)}
                    placeholder="Frontend Engineer"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-sm font-medium text-on-surface">Summary</FieldLabel>
                  <button
                    type="button"
                    onClick={handleSummaryRewrite}
                    disabled={summaryAiState === "loading"}
                    className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                    aria-label="Rewrite summary with AI"
                  >
                    <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                  </button>
                </div>
                <Textarea
                  value={model.personal.summary}
                  onChange={(event) => onPersonalChange("summary", event.target.value)}
                  placeholder="A short introduction for this CV"
                  className={textareaClassName}
                />
                <AiDiffOverlay
                  suggestion={summarySuggestion}
                  isLoading={summaryAiState === "loading"}
                  error={summaryError}
                  onApply={handleSummaryApply}
                  onRegenerate={handleSummaryRewrite}
                  onCancel={() => {
                    setSummaryAiState("idle")
                    setSummarySuggestion(null)
                  }}
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-0 outline-none">
          <div className="space-y-4">
            <SectionIntro
              title="Contacts"
              description="Edit how each contact line appears on this CV."
              count={model.contacts.length}
              hidden={hiddenSectionSet.has("contacts")}
            />

            {hiddenSectionSet.has("contacts") ? <HiddenNotice onOpenLayout={onOpenLayout} /> : null}

            {selectedContact ? (
              <>
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Editing</FieldLabel>
                  <NativeSelect
                    value={selectedContact.id}
                    onChange={(event) =>
                      setSelectedItemIds((current) => ({
                        ...current,
                        contacts: event.target.value,
                      }))
                    }
                    className={selectClassName}
                  >
                    {model.contacts.map((contact) => (
                      <NativeSelectOption key={contact.id} value={contact.id}>
                        {(contact.type || "Contact") + (contact.value ? ` — ${contact.value}` : "")}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <Card className={panelClassName}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Label</FieldLabel>
                      <Input
                        value={selectedContact.type}
                        onChange={(event) =>
                          onContactChange(selectedContact.id, { type: event.target.value })
                        }
                        placeholder="Email"
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Value</FieldLabel>
                      <Input
                        value={selectedContact.value}
                        onChange={(event) =>
                          onContactChange(selectedContact.id, { value: event.target.value })
                        }
                        placeholder="name@example.com"
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <EmptySectionNotice
                message="No contact lines are showing in this CV right now. Turn one on when you want to edit it here."
                onOpenItems={onOpenItems}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="experiences" className="mt-0 outline-none">
          <div className="space-y-4">
            <SectionIntro
              title="Experience"
              description="Choose one role, then adjust its wording for this CV."
              count={model.experiences.length}
              hidden={hiddenSectionSet.has("experiences")}
            />

            {hiddenSectionSet.has("experiences") ? <HiddenNotice onOpenLayout={onOpenLayout} /> : null}

            {selectedExperience ? (
              <>
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Editing</FieldLabel>
                  <NativeSelect
                    value={selectedExperience.id}
                    onChange={(event) =>
                      setSelectedItemIds((current) => ({
                        ...current,
                        experiences: event.target.value,
                      }))
                    }
                    className={selectClassName}
                  >
                    {model.experiences.map((experience) => (
                      <NativeSelectOption key={experience.id} value={experience.id}>
                        {(experience.role || "Role") + (experience.company ? ` — ${experience.company}` : "")}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <Card className={panelClassName}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel className="text-sm font-medium text-on-surface">Role</FieldLabel>
                        <button
                          type="button"
                          onClick={handleExperienceRoleRewrite}
                          disabled={experienceRoleAiState === "loading"}
                          className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                          aria-label="Rewrite role with AI"
                        >
                          <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                        </button>
                      </div>
                      <Input
                        value={selectedExperience.role}
                        onChange={(event) =>
                          onExperienceChange(selectedExperience.id, { role: event.target.value })
                        }
                        placeholder="Senior Frontend Engineer"
                        className={inputClassName}
                      />
                      <AiDiffOverlay
                        suggestion={experienceRoleSuggestion}
                        isLoading={experienceRoleAiState === "loading"}
                        error={experienceRoleError}
                        onApply={handleExperienceRoleApply}
                        onRegenerate={handleExperienceRoleRewrite}
                        onCancel={() => {
                          setExperienceRoleAiState("idle")
                          setExperienceRoleSuggestion(null)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Company</FieldLabel>
                      <Input
                        value={selectedExperience.company}
                        onChange={(event) =>
                          onExperienceChange(selectedExperience.id, { company: event.target.value })
                        }
                        placeholder="Acme"
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Location</FieldLabel>
                      <Input
                        value={selectedExperience.location}
                        onChange={(event) =>
                          onExperienceChange(selectedExperience.id, { location: event.target.value })
                        }
                        placeholder="Remote"
                        className={inputClassName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldLabel className="text-sm font-medium text-on-surface">Start</FieldLabel>
                        <Input
                          value={selectedExperience.start_date}
                          onChange={(event) =>
                            onExperienceChange(selectedExperience.id, { start_date: event.target.value })
                          }
                          placeholder="2024-01"
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel className="text-sm font-medium text-on-surface">End</FieldLabel>
                        <Input
                          value={selectedExperience.end_date ?? ""}
                          onChange={(event) =>
                            onExperienceChange(selectedExperience.id, { end_date: event.target.value })
                          }
                          placeholder="Leave blank for Present"
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-sm font-medium text-on-surface">Bullet points</FieldLabel>
                      <button
                        type="button"
                        onClick={handleExperienceBulletsRewrite}
                        disabled={experienceBulletsAiState === "loading"}
                        className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                        aria-label="Rewrite bullet points with AI"
                      >
                        <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                      </button>
                    </div>
                    <FieldDescription>Use one line per bullet.</FieldDescription>
                    <Textarea
                      value={listToEditorValue(selectedExperience.bullets)}
                      onChange={(event) =>
                        onExperienceChange(selectedExperience.id, {
                          bullets: editorValueToList(event.target.value),
                        })
                      }
                      placeholder="Built reusable UI systems"
                      className={textareaClassName}
                    />
                    <AiDiffOverlay
                      suggestion={experienceBulletsSuggestion}
                      isLoading={experienceBulletsAiState === "loading"}
                      error={experienceBulletsError}
                      onApply={handleExperienceBulletsApply}
                      onRegenerate={handleExperienceBulletsRewrite}
                      onCancel={() => {
                        setExperienceBulletsAiState("idle")
                        setExperienceBulletsSuggestion(null)
                      }}
                    />
                  </div>
                </Card>
              </>
            ) : (
              <EmptySectionNotice
                message="No experience entries are showing in this CV right now. Turn one on when you want to edit it here."
                onOpenItems={onOpenItems}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-0 outline-none">
          <div className="space-y-4">
            <SectionIntro
              title="Projects"
              description="Choose one project, then refine its wording for this CV."
              count={model.projects.length}
              hidden={hiddenSectionSet.has("projects")}
            />

            {hiddenSectionSet.has("projects") ? <HiddenNotice onOpenLayout={onOpenLayout} /> : null}

            {selectedProject ? (
              <>
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Editing</FieldLabel>
                  <NativeSelect
                    value={selectedProject.id}
                    onChange={(event) =>
                      setSelectedItemIds((current) => ({
                        ...current,
                        projects: event.target.value,
                      }))
                    }
                    className={selectClassName}
                  >
                    {model.projects.map((project) => (
                      <NativeSelectOption key={project.id} value={project.id}>
                        {project.name || "Project"}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <Card className={panelClassName}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Project name</FieldLabel>
                      <Input
                        value={selectedProject.name}
                        onChange={(event) =>
                          onProjectChange(selectedProject.id, { name: event.target.value })
                        }
                        placeholder="Resume Builder"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel className="text-sm font-medium text-on-surface">Description</FieldLabel>
                        <button
                          type="button"
                          onClick={handleProjectDescriptionRewrite}
                          disabled={projectDescriptionAiState === "loading"}
                          className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                          aria-label="Rewrite description with AI"
                        >
                          <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                        </button>
                      </div>
                      <Textarea
                        value={selectedProject.description}
                        onChange={(event) =>
                          onProjectChange(selectedProject.id, { description: event.target.value })
                        }
                        placeholder="A short description for this project"
                        className={textareaClassName}
                      />
                      <AiDiffOverlay
                        suggestion={projectDescriptionSuggestion}
                        isLoading={projectDescriptionAiState === "loading"}
                        error={projectDescriptionError}
                        onApply={handleProjectDescriptionApply}
                        onRegenerate={handleProjectDescriptionRewrite}
                        onCancel={() => {
                          setProjectDescriptionAiState("idle")
                          setProjectDescriptionSuggestion(null)
                        }}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel className="text-sm font-medium text-on-surface">Tech stack</FieldLabel>
                        <FieldDescription>Use one line per technology.</FieldDescription>
                        <Textarea
                          value={listToEditorValue(selectedProject.tech_stack)}
                          onChange={(event) =>
                            onProjectChange(selectedProject.id, {
                              tech_stack: editorValueToList(event.target.value),
                            })
                          }
                          placeholder="Next.js"
                          className={textareaClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FieldLabel className="text-sm font-medium text-on-surface">Bullet points</FieldLabel>
                          <button
                            type="button"
                            onClick={handleProjectBulletsRewrite}
                            disabled={projectBulletsAiState === "loading"}
                            className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                            aria-label="Rewrite bullet points with AI"
                          >
                            <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                          </button>
                        </div>
                        <FieldDescription>Use one line per bullet.</FieldDescription>
                        <Textarea
                          value={listToEditorValue(selectedProject.bullets)}
                          onChange={(event) =>
                            onProjectChange(selectedProject.id, {
                              bullets: editorValueToList(event.target.value),
                            })
                          }
                          placeholder="Improved form completion by 24%"
                          className={textareaClassName}
                        />
                        <AiDiffOverlay
                          suggestion={projectBulletsSuggestion}
                          isLoading={projectBulletsAiState === "loading"}
                          error={projectBulletsError}
                          onApply={handleProjectBulletsApply}
                          onRegenerate={handleProjectBulletsRewrite}
                          onCancel={() => {
                            setProjectBulletsAiState("idle")
                            setProjectBulletsSuggestion(null)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <EmptySectionNotice
                message="No projects are showing in this CV right now. Open Choose items to add one back, even if the linked profile filtered it out."
                onOpenItems={onOpenItems}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="education" className="mt-0 outline-none">
          <div className="space-y-4">
            <SectionIntro
              title="Education"
              description="Choose one education entry, then adjust its details for this CV."
              count={model.education.length}
              hidden={hiddenSectionSet.has("education")}
            />

            {hiddenSectionSet.has("education") ? <HiddenNotice onOpenLayout={onOpenLayout} /> : null}

            {selectedEducation ? (
              <>
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Editing</FieldLabel>
                  <NativeSelect
                    value={selectedEducation.id}
                    onChange={(event) =>
                      setSelectedItemIds((current) => ({
                        ...current,
                        education: event.target.value,
                      }))
                    }
                    className={selectClassName}
                  >
                    {model.education.map((entry) => (
                      <NativeSelectOption key={entry.id} value={entry.id}>
                        {(entry.degree || "Degree") + (entry.institution ? ` — ${entry.institution}` : "")}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <Card className={panelClassName}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Degree</FieldLabel>
                      <Input
                        value={selectedEducation.degree}
                        onChange={(event) =>
                          onEducationChange(selectedEducation.id, { degree: event.target.value })
                        }
                        placeholder="BSc Computer Science"
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Institution</FieldLabel>
                      <Input
                        value={selectedEducation.institution}
                        onChange={(event) =>
                          onEducationChange(selectedEducation.id, { institution: event.target.value })
                        }
                        placeholder="State University"
                        className={inputClassName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                      <div className="space-y-2">
                        <FieldLabel className="text-sm font-medium text-on-surface">Start</FieldLabel>
                        <Input
                          value={selectedEducation.start_date}
                          onChange={(event) =>
                            onEducationChange(selectedEducation.id, { start_date: event.target.value })
                          }
                          placeholder="2019-09"
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel className="text-sm font-medium text-on-surface">End</FieldLabel>
                        <Input
                          value={selectedEducation.end_date ?? ""}
                          onChange={(event) =>
                            onEducationChange(selectedEducation.id, { end_date: event.target.value })
                          }
                          placeholder="Leave blank for Present"
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-sm font-medium text-on-surface">Details</FieldLabel>
                      <button
                        type="button"
                        onClick={handleEducationDetailsRewrite}
                        disabled={educationDetailsAiState === "loading"}
                        className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                        aria-label="Rewrite details with AI"
                      >
                        <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                      </button>
                    </div>
                    <Textarea
                      value={selectedEducation.details}
                      onChange={(event) =>
                        onEducationChange(selectedEducation.id, { details: event.target.value })
                      }
                      placeholder="Honors, awards, or relevant notes"
                      className={textareaClassName}
                    />
                    <AiDiffOverlay
                      suggestion={educationDetailsSuggestion}
                      isLoading={educationDetailsAiState === "loading"}
                      error={educationDetailsError}
                      onApply={handleEducationDetailsApply}
                      onRegenerate={handleEducationDetailsRewrite}
                      onCancel={() => {
                        setEducationDetailsAiState("idle")
                        setEducationDetailsSuggestion(null)
                      }}
                    />
                  </div>
                </Card>
              </>
            ) : (
              <EmptySectionNotice
                message="No education entries are showing in this CV right now. Turn one on when you want to edit it here."
                onOpenItems={onOpenItems}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-0 outline-none">
          <div className="space-y-4">
            <SectionIntro
              title="Skills"
              description="Choose one skill, then rename or regroup it for this CV."
              count={model.skills.length}
              hidden={hiddenSectionSet.has("skills")}
            />

            {hiddenSectionSet.has("skills") ? <HiddenNotice onOpenLayout={onOpenLayout} /> : null}

            {selectedSkill ? (
              <>
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Editing</FieldLabel>
                  <NativeSelect
                    value={selectedSkill.id}
                    onChange={(event) =>
                      setSelectedItemIds((current) => ({
                        ...current,
                        skills: event.target.value,
                      }))
                    }
                    className={selectClassName}
                  >
                    {model.skills.map((skill) => (
                      <NativeSelectOption key={skill.id} value={skill.id}>
                        {skill.name || "Skill"}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <Card className={panelClassName}>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Skill name</FieldLabel>
                      <Input
                        value={selectedSkill.name}
                        onChange={(event) =>
                          onSkillChange(selectedSkill.id, { name: event.target.value })
                        }
                        placeholder="React"
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium text-on-surface">Category</FieldLabel>
                      <Input
                        value={selectedSkill.category}
                        onChange={(event) =>
                          onSkillChange(selectedSkill.id, { category: event.target.value })
                        }
                        placeholder="Frontend"
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <FieldLabel className="text-sm font-medium text-on-surface">Level</FieldLabel>
                      <Input
                        value={selectedSkill.level}
                        onChange={(event) =>
                          onSkillChange(selectedSkill.id, { level: event.target.value })
                        }
                        placeholder="Advanced"
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <EmptySectionNotice
                message="No skills are showing in this CV right now. Turn one on when you want to edit it here."
                onOpenItems={onOpenItems}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
