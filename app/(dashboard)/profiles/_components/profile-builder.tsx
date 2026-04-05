"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ProfileSuggestion } from "@/lib/ai/types"
import { getAllRegionIds, getRegionStandard } from "@/lib/region-instructions"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import {
  buildProfilePreview,
  getWorkspaceTagSuggestions,
  matchesProfileTagRules,
} from "@/lib/profiles/engine"
import {
  buildProfileCoverageSummary,
  getProfileStatus,
} from "@/lib/profiles/presentation"
import {
  defaultProfileConfig,
  educationOrderingOptions,
  emptyProfilePayload,
  experienceOrderingOptions,
  projectOrderingOptions,
  type ProfileBuilderMode,
  type ProfileData,
  type ProfilePayload,
  type ProfileSelectableSection,
} from "@/lib/profiles/types"
import {
  getFirstProfileValidationMessage,
  hasProfileValidationErrors,
  normalizeProfilePayload,
  validateProfilePayload,
} from "@/lib/profiles/validation"
import { cn } from "@/lib/utils"

import {
  ProfileSectionSelectorDialog,
  type ProfileSectionSelectorItem,
} from "./profile-section-selector-dialog"
import { ProfileTagEditor } from "./profile-tag-editor"
import { createProfile, deleteProfile, updateProfile } from "../actions"

const inputClassName =
  "h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20 md:text-sm"

const textareaClassName =
  "min-h-[120px] rounded-sm border-outline-variant/70 bg-background px-3 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20 md:text-sm resize-y"

const selectClassName =
  "w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:rounded-sm [&_[data-slot=native-select]]:border-outline-variant/70 [&_[data-slot=native-select]]:bg-background [&_[data-slot=native-select]]:px-3 [&_[data-slot=native-select]]:pr-8 [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:text-on-surface [&_[data-slot=native-select]]:focus-visible:border-primary [&_[data-slot=native-select]]:focus-visible:ring-primary/20 [&_[data-slot=native-select-icon]]:right-3 [&_[data-slot=native-select-icon]]:size-4 [&_[data-slot=native-select-icon]]:text-on-surface-variant/60"

const stepOrder = ["name", "generate", "filters", "items", "review"] as const

const stepContent = {
  name: {
    title: "Step 1: Name this profile",
    description: "Pick a short name so you can recognize this version later.",
    helper: "You can save a profile with only a name. Everything else is optional.",
    navLabel: "Name",
  },
  generate: {
    title: "Step 2: Generate with AI",
    description: "Describe the CV you want and let AI build a profile for you.",
    helper: "Or skip this and set up tags and items manually in the next steps.",
    navLabel: "AI Generate",
  },
  filters: {
    title: "Step 2: Add tags if you want a focused profile",
    description: "Leave both lists empty if you want a broad profile.",
    helper: "Include tags narrow the profile down. Exclude tags keep things out.",
    navLabel: "Tags",
  },
  items: {
    title: "Step 3: Turn specific items on or off",
    description: "Every saved item starts on. Only change a section if you want more control.",
    helper: "This is for hand-picking items after tags do their job.",
    navLabel: "Items",
  },
  review: {
    title: "Step 4: Review and save",
    description: "Check the result, open advanced options if you need them, then save.",
    helper: "If the preview looks right, you are done.",
    navLabel: "Review",
  },
} as const

type StepKey = (typeof stepOrder)[number]

type ProfileBuilderProps = {
  mode: ProfileBuilderMode
  careerData: CareerWorkspaceData
  profile: ProfileData | null
}

type ProfileFormState = {
  name: string
  include_tags: string[]
  exclude_tags: string[]
  experience_limit: string
  project_limit: string
  experience_order: ProfilePayload["config"]["ordering"]["experiences"]
  project_order: ProfilePayload["config"]["ordering"]["projects"]
  education_order: ProfilePayload["config"]["ordering"]["education"]
  selections: ProfilePayload["config"]["selections"]
}

type SelectionSectionDefinition = {
  key: ProfileSelectableSection
  label: string
  itemLabel: string
  description: string
  automaticDescription: string
  items: ProfileSectionSelectorItem[]
  currentCount: number
  helper: string
  selection: string[] | null
}

function buildFormState(profile: ProfileData | null): ProfileFormState {
  if (!profile) {
    return {
      name: emptyProfilePayload.name,
      include_tags: [],
      exclude_tags: [],
      experience_limit: "",
      project_limit: "",
      experience_order: defaultProfileConfig.ordering.experiences,
      project_order: defaultProfileConfig.ordering.projects,
      education_order: defaultProfileConfig.ordering.education,
      selections: defaultProfileConfig.selections,
    }
  }

  return {
    name: profile.name,
    include_tags: profile.include_tags,
    exclude_tags: profile.exclude_tags,
    experience_limit: profile.config.limits.experiences ? String(profile.config.limits.experiences) : "",
    project_limit: profile.config.limits.projects ? String(profile.config.limits.projects) : "",
    experience_order: profile.config.ordering.experiences,
    project_order: profile.config.ordering.projects,
    education_order: profile.config.ordering.education,
    selections: profile.config.selections,
  }
}

function buildPayload(state: ProfileFormState) {
  return normalizeProfilePayload({
    name: state.name,
    include_tags: state.include_tags,
    exclude_tags: state.exclude_tags,
    config: {
      ordering: {
        experiences: state.experience_order,
        projects: state.project_order,
        education: state.education_order,
      },
      limits: {
        experiences: state.experience_limit,
        projects: state.project_limit,
      },
      selections: state.selections,
    },
  })
}

function buildSnapshot(payload: ProfilePayload) {
  return JSON.stringify(payload)
}

function SummaryMetric({ label, value, helper }: { label: string; value: number; helper?: string }) {
  return (
    <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-3">
      <p className="text-xs font-medium text-on-surface-variant/70">{label}</p>
      <p className="mt-1 text-xl font-semibold text-on-surface">{value}</p>
      {helper ? <p className="mt-1 text-xs text-on-surface-variant/70">{helper}</p> : null}
    </div>
  )
}

export function ProfileBuilder({ mode, careerData, profile }: ProfileBuilderProps) {
  const router = useRouter()
  const [state, setState] = useState<ProfileFormState>(() => buildFormState(profile))
  const [savedProfile, setSavedProfile] = useState(profile)
  const [savedSnapshot, setSavedSnapshot] = useState(() => buildSnapshot(buildPayload(buildFormState(profile))))
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeSelectionSection, setActiveSelectionSection] =
    useState<ProfileSelectableSection | null>(null)
  const [activeStep, setActiveStep] = useState<StepKey>("name")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiRegionId, setAiRegionId] = useState("international")
  const [aiGenLoading, setAiGenLoading] = useState(false)
  const [aiGenError, setAiGenError] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<ProfileSuggestion | null>(null)

  const generateProfileMutation = useAction(api.ai_functions.generate_profile.generate_profile)

  const payload = useMemo(() => buildPayload(state), [state])
  const payloadSnapshot = useMemo(() => buildSnapshot(payload), [payload])
  const validationErrors = useMemo(() => validateProfilePayload(payload), [payload])
  const preview = useMemo(() => buildProfilePreview(payload, careerData), [careerData, payload])
  const tagSuggestions = useMemo(() => getWorkspaceTagSuggestions(careerData), [careerData])
  const isDirty = payloadSnapshot !== savedSnapshot
  const currentMode: ProfileBuilderMode = savedProfile ? "edit" : mode
  const status = getProfileStatus(preview)
  const coverageSummary = buildProfileCoverageSummary(preview)
  const activeStepIndex = stepOrder.indexOf(activeStep)
  const hasAdvancedOptions =
    payload.config.limits.experiences !== null ||
    payload.config.limits.projects !== null ||
    payload.config.ordering.experiences !== defaultProfileConfig.ordering.experiences ||
    payload.config.ordering.projects !== defaultProfileConfig.ordering.projects ||
    payload.config.ordering.education !== defaultProfileConfig.ordering.education

  const selectionSections = useMemo<SelectionSectionDefinition[]>(
    () => [
      {
        key: "experiences",
        label: "Experience",
        itemLabel: "experience",
        description: "Turn saved experience entries on or off for this profile.",
        automaticDescription:
          "Every experience is on by default. Your tag rules and limits still decide what finally appears.",
        items: careerData.experiences.map((entry) => ({
          id: entry.id,
          title: `${entry.role} · ${entry.company}`,
          description: entry.location || "No location added",
          meta: [
            `${entry.start_date} → ${entry.end_date || "Present"}`,
            ...entry.tags.map((tag) => `#${tag}`),
          ],
          available: matchesProfileTagRules(entry.tags, payload),
        })),
        currentCount: preview.displayedExperiences,
        helper:
          payload.config.selections.experiences === null
            ? `All ${careerData.experiences.length} saved experiences are on.`
            : `${payload.config.selections.experiences.length} of ${careerData.experiences.length} saved experiences are on.`,
        selection: state.selections.experiences,
      },
      {
        key: "projects",
        label: "Projects",
        itemLabel: "project",
        description: "Turn saved projects on or off for this profile.",
        automaticDescription:
          "Every project is on by default. Your tag rules and limits still decide what finally appears.",
        items: careerData.projects.map((entry) => ({
          id: entry.id,
          title: entry.name,
          description: entry.description || "No description added",
          meta: [...entry.tech_stack, ...entry.tags.map((tag) => `#${tag}`)],
          available: matchesProfileTagRules(entry.tags, payload),
        })),
        currentCount: preview.displayedProjects,
        helper:
          payload.config.selections.projects === null
            ? `All ${careerData.projects.length} saved projects are on.`
            : `${payload.config.selections.projects.length} of ${careerData.projects.length} saved projects are on.`,
        selection: state.selections.projects,
      },
      {
        key: "education",
        label: "Education",
        itemLabel: "education item",
        description: "Turn saved education entries on or off for this profile.",
        automaticDescription: "Every education entry is on by default.",
        items: careerData.education.map((entry) => ({
          id: entry.id,
          title: `${entry.degree} · ${entry.institution}`,
          description: entry.details || "No extra details added",
          meta: [`${entry.start_date} → ${entry.end_date || "Present"}`],
          available: true,
        })),
        currentCount: preview.educationCount,
        helper:
          payload.config.selections.education === null
            ? `All ${careerData.education.length} education entries are on.`
            : `${payload.config.selections.education.length} of ${careerData.education.length} education entries are on.`,
        selection: state.selections.education,
      },
      {
        key: "skills",
        label: "Skills",
        itemLabel: "skill",
        description: "Turn saved skills on or off for this profile.",
        automaticDescription: "Every skill is on by default.",
        items: careerData.skills.map((entry) => ({
          id: entry.id,
          title: entry.name,
          description: `${entry.category} · ${entry.level}`,
          meta: [entry.category, entry.level],
          available: true,
        })),
        currentCount: preview.skillsCount,
        helper:
          payload.config.selections.skills === null
            ? `All ${careerData.skills.length} saved skills are on.`
            : `${payload.config.selections.skills.length} of ${careerData.skills.length} saved skills are on.`,
        selection: state.selections.skills,
      },
      {
        key: "contacts",
        label: "Contact methods",
        itemLabel: "contact method",
        description: "Turn saved contact methods on or off for this profile.",
        automaticDescription: "Every contact method is on by default.",
        items: careerData.contacts.map((entry) => ({
          id: entry.id,
          title: entry.type,
          description: entry.value,
          meta: [entry.type],
          available: true,
        })),
        currentCount: preview.contactsCount,
        helper:
          payload.config.selections.contacts === null
            ? `All ${careerData.contacts.length} contact methods are on.`
            : `${payload.config.selections.contacts.length} of ${careerData.contacts.length} contact methods are on.`,
        selection: state.selections.contacts,
      },
    ],
    [careerData, payload, preview, state.selections]
  )

  const customSelectionCount = selectionSections.filter((section) => section.selection !== null).length
  const activeSelectionDefinition = activeSelectionSection
    ? selectionSections.find((section) => section.key === activeSelectionSection) ?? null
    : null
  const visibleErrors = hasAttemptedSubmit ? validationErrors : {}

  const updateState = (updater: (currentState: ProfileFormState) => ProfileFormState) => {
    setState((currentState) => updater(currentState))
    setSubmitError(null)
    setSaveNotice(null)
  }

  const handleSelectionSave = (
    section: ProfileSelectableSection,
    nextSelection: string[] | null
  ) => {
    updateState((currentState) => ({
      ...currentState,
      selections: {
        ...currentState.selections,
        [section]: nextSelection,
      },
    }))
    setActiveSelectionSection(null)
  }

  const handleNextStep = () => {
    if (activeStep === "name" && !payload.name) {
      setHasAttemptedSubmit(true)
      setSubmitError("Give the profile a name before you continue.")
      return
    }

    setSubmitError(null)
    setActiveStep(stepOrder[Math.min(activeStepIndex + 1, stepOrder.length - 1)])
  }

  const handlePreviousStep = () => {
    setSubmitError(null)
    setActiveStep(stepOrder[Math.max(activeStepIndex - 1, 0)])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setSubmitError(null)
    setSaveNotice(null)

    if (hasProfileValidationErrors(validationErrors)) {
      setSubmitError(getFirstProfileValidationMessage(validationErrors))
      return
    }

    setIsSubmitting(true)

    try {
      if (currentMode === "create") {
        const createdProfile = await createProfile(payload)

        if (!createdProfile.success) {
          setSubmitError(createdProfile.error)
          return
        }

        router.push("/profiles")
        return
      }

      if (!savedProfile) {
        return
      }

      const updatedProfile = await updateProfile(savedProfile.id, payload)

      if (!updatedProfile.success) {
        setSubmitError(updatedProfile.error)
        return
      }

      setSavedProfile(updatedProfile.data)
      setSavedSnapshot(payloadSnapshot)
      setSaveNotice("Profile saved.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t save this profile right now.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!savedProfile) {
      return
    }

    setIsDeleting(true)
    setSubmitError(null)

    try {
      const deletedProfile = await deleteProfile(savedProfile.id)

      if (!deletedProfile.success) {
        setSubmitError(deletedProfile.error)
        return
      }

      router.push("/profiles")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t delete this profile right now.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleGenerateProfile = async () => {
    setAiGenLoading(true)
    setAiGenError(null)
    const result = await generateProfileMutation({
      userPrompt: aiPrompt,
      careerDataSerialized: JSON.stringify(careerData),
      regionId: aiRegionId,
    })
    setAiGenLoading(false)
    if (result.ok) {
      setAiSuggestion(result.data)
    } else {
      setAiGenError(result.error)
    }
  }

  const handleApplySuggestion = () => {
    if (!aiSuggestion) return
    updateState((currentState) => ({
      ...currentState,
      name: aiSuggestion.name || currentState.name,
      include_tags: aiSuggestion.include_tags,
      exclude_tags: aiSuggestion.exclude_tags,
      experience_order: aiSuggestion.ordering.experiences,
      project_order: aiSuggestion.ordering.projects,
      experience_limit: aiSuggestion.limits.experiences?.toString() ?? "",
      project_limit: aiSuggestion.limits.projects?.toString() ?? "",
    }))
    setAiSuggestion(null)
    setActiveStep("filters")
  }

  const saveStatusLabel = isSubmitting
    ? "Saving…"
    : submitError
      ? "Needs attention"
      : currentMode === "create"
        ? "Not saved yet"
        : isDirty
          ? "Unsaved changes"
          : "All changes saved"

  const stepLabel = stepContent[activeStep]
  const filtersSummary =
    payload.include_tags.length || payload.exclude_tags.length
      ? `${payload.include_tags.length} include tag${payload.include_tags.length === 1 ? "" : "s"} • ${payload.exclude_tags.length} exclude tag${payload.exclude_tags.length === 1 ? "" : "s"}`
      : "No tag rules"
  const itemChoiceSummary = customSelectionCount
    ? `${customSelectionCount} section${customSelectionCount === 1 ? "" : "s"} chosen by hand`
    : "Everything is on"
  const advancedSummary = hasAdvancedOptions ? "Custom order or limits are on" : "Default order and no limits"

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 md:px-8 xl:px-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Link href="/profiles" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to profiles
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
                {currentMode === "create" ? "New profile" : "Edit profile"}
              </Badge>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                {currentMode === "create" ? "Create profile" : `Edit ${savedProfile?.name ?? "profile"}`}
              </h1>
              <p className="text-sm text-on-surface-variant/75 md:text-base">
                Answer four simple questions: what this profile is called, which tags it follows, whether any exact items should be turned off, and whether you want custom ordering or limits.
              </p>
            </div>

            <div className="rounded-sm border border-outline-variant/60 bg-card px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-medium text-on-surface-variant/70">Status</p>
              <p className="mt-1 text-sm font-medium text-on-surface">{saveStatusLabel}</p>
            </div>
          </div>
        </div>

        {submitError ? (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
            <AlertTitle>We couldn’t save this profile.</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        {saveNotice ? (
          <Alert className="border-outline-variant/60 bg-surface-subtle/50">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-primary" />
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>{saveNotice}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline text-xl font-semibold text-on-surface">What this profile shows right now</h2>
                <Badge variant={status.tone === "destructive" ? "destructive" : "default"}>{status.label}</Badge>
              </div>
              <p className="text-sm text-on-surface-variant/75">{status.helper}</p>
              <p className="text-sm text-on-surface-variant/75">{coverageSummary}</p>
            </div>

            <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 px-4 py-3">
              <p className="text-xs font-medium text-on-surface-variant/70">Current setup</p>
              <div className="mt-2 space-y-1 text-sm text-on-surface-variant/80">
                <p>{payload.name ? `Name: ${payload.name}` : "Name: not set yet"}</p>
                <p>Tags: {filtersSummary.toLowerCase()}</p>
                <p>Items: {itemChoiceSummary.toLowerCase()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryMetric label="Experience" value={preview.displayedExperiences} helper={`${preview.matchedExperiences} matched`} />
            <SummaryMetric label="Projects" value={preview.displayedProjects} helper={`${preview.matchedProjects} matched`} />
            <SummaryMetric label="Education" value={preview.educationCount} />
            <SummaryMetric label="Skills" value={preview.skillsCount} />
            <SummaryMetric label="Contacts" value={preview.contactsCount} />
          </div>
        </Card>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-4">
            {stepOrder.map((stepKey, index) => {
              const isActive = activeStep === stepKey
              const isComplete = index < activeStepIndex

              return (
                <button
                  key={stepKey}
                  type="button"
                  onClick={() => setActiveStep(stepKey)}
                  className={cn(
                    "rounded-sm border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary-soft text-primary"
                      : "border-outline-variant/60 bg-background text-on-surface-variant hover:border-primary/20 hover:bg-surface-subtle hover:text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                        isActive || isComplete
                          ? "bg-primary text-on-primary"
                          : "bg-surface-subtle text-on-surface-variant"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-current">{stepContent[stepKey].navLabel}</p>
                      <p className="text-xs text-current/75">{stepKey === "filters" || stepKey === "items" ? "Optional" : "Required"}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-hidden rounded-sm border border-outline-variant/60 bg-card shadow-sm">
          <div className="border-b border-outline-variant/60 px-6 py-5">
            <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
              {stepLabel.title}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-on-surface">{stepLabel.description}</h2>
            <p className="mt-2 text-sm text-on-surface-variant/75">{stepLabel.helper}</p>
          </div>

          <div className="space-y-5 px-6 py-6">
            {activeStep === "name" ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Profile name</FieldLabel>
                  <FieldDescription>
                    Use a name you will understand later, like the kind of role this profile targets.
                  </FieldDescription>
                  <Input
                    value={state.name}
                    onChange={(event) =>
                      updateState((currentState) => ({
                        ...currentState,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Frontend Engineer"
                    className={inputClassName}
                    aria-invalid={Boolean(visibleErrors.name)}
                  />
                  <FieldError>{visibleErrors.name}</FieldError>
                </div>

                <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                  <p className="text-sm font-medium text-on-surface">Try one of these</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Frontend Engineer", "Product Designer", "Technical Lead"].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() =>
                          updateState((currentState) => ({
                            ...currentState,
                            name: example,
                          }))
                        }
                        className="rounded-sm border border-outline-variant/60 px-3 py-2 text-sm text-on-surface-variant transition-colors hover:border-primary/20 hover:bg-primary-soft hover:text-primary"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}

            {activeStep === "generate" ? (
              <div className="space-y-4">
                <Card className="rounded-sm border border-primary/20 bg-primary-soft/10 p-4">
                  <p className="text-sm font-medium text-on-surface">AI Profile Generation</p>
                  <p className="mt-1 text-sm text-on-surface-variant/75">
                    Describe the CV you want and AI will suggest tags, limits, and ordering.
                  </p>
                </Card>

                <div className="space-y-2">
                  <FieldLabel>What kind of CV do you want?</FieldLabel>
                  <FieldDescription>
                    e.g. "Senior frontend engineer for US tech companies, 5 years experience"
                  </FieldDescription>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Senior frontend engineer, US market, focused on React and TypeScript"
                    className={textareaClassName}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Region</FieldLabel>
                  <NativeSelect
                    value={aiRegionId}
                    onChange={(e) => setAiRegionId(e.target.value)}
                    className={selectClassName}
                  >
                    {getAllRegionIds().map((id) => (
                      <NativeSelectOption key={id} value={id}>
                        {getRegionStandard(id).name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                {aiGenLoading ? (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Spinner className="size-4" />
                    <span>Generating profile…</span>
                  </div>
                ) : aiGenError ? (
                  <p className="text-sm text-destructive">{aiGenError}</p>
                ) : null}

                <div className="flex gap-3">
                  <Button onClick={handleGenerateProfile} disabled={aiGenLoading || !aiPrompt.trim()}>
                    Generate
                  </Button>
                  {aiSuggestion && (
                    <Button variant="outline" onClick={handleApplySuggestion}>
                      Apply Suggestion
                    </Button>
                  )}
                </div>

                {aiSuggestion && (
                  <Card className="rounded-sm border border-primary/20 bg-primary-soft/10 p-4">
                    <p className="text-sm font-medium text-on-surface">Suggested Profile</p>
                    <div className="mt-2 space-y-1 text-sm text-on-surface-variant">
                      <p><strong>Name:</strong> {aiSuggestion.name}</p>
                      <p><strong>Include tags:</strong> {aiSuggestion.include_tags.join(", ") || "(none)"}</p>
                      <p><strong>Exclude tags:</strong> {aiSuggestion.exclude_tags.join(", ") || "(none)"}</p>
                      <p><strong>Experience order:</strong> {aiSuggestion.ordering.experiences}</p>
                      <p><strong>Project order:</strong> {aiSuggestion.ordering.projects}</p>
                      <p><strong>Experience limit:</strong> {aiSuggestion.limits.experiences ?? "none"}</p>
                      <p><strong>Project limit:</strong> {aiSuggestion.limits.projects ?? "none"}</p>
                    </div>
                  </Card>
                )}
              </div>
            ) : null}

            {activeStep === "filters" ? (
              <div className="space-y-5">
                <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                  <p className="text-sm font-medium text-on-surface">Quick rule</p>
                  <p className="mt-2 text-sm text-on-surface-variant/75">
                    Include tags help you focus the profile. Exclude tags keep things out. If both touch the same item, exclude wins.
                  </p>
                </Card>

                <ProfileTagEditor
                  label="Include tags"
                  description="Add tags only if you want this profile to focus on specific kinds of work."
                  tags={state.include_tags}
                  onChange={(nextTags) =>
                    updateState((currentState) => ({
                      ...currentState,
                      include_tags: nextTags,
                    }))
                  }
                  suggestions={tagSuggestions}
                  blockedTags={state.exclude_tags}
                  placeholder="Type a tag and press Enter"
                  error={visibleErrors.include_tags}
                  emptyHint={
                    <span>
                      No tag suggestions yet. Add tags in{" "}
                      <Link href="/career-data" className="text-primary underline underline-offset-4">
                        Career Data
                      </Link>{" "}
                      first.
                    </span>
                  }
                />

                <ProfileTagEditor
                  label="Exclude tags"
                  description="Use exclude tags for anything that should stay out of this version."
                  tags={state.exclude_tags}
                  onChange={(nextTags) =>
                    updateState((currentState) => ({
                      ...currentState,
                      exclude_tags: nextTags,
                    }))
                  }
                  suggestions={tagSuggestions}
                  blockedTags={state.include_tags}
                  placeholder="Type a tag and press Enter"
                  error={visibleErrors.exclude_tags}
                  tone="destructive"
                  emptyHint={
                    <span>
                      No tag suggestions yet. Add tags in{" "}
                      <Link href="/career-data" className="text-primary underline underline-offset-4">
                        Career Data
                      </Link>{" "}
                      first.
                    </span>
                  }
                />
              </div>
            ) : null}

            {activeStep === "items" ? (
              <div className="space-y-5">
                <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                  <p className="text-sm font-medium text-on-surface">Keep this easy</p>
                  <p className="mt-2 text-sm text-on-surface-variant/75">
                    You do not need to open every section. Everything is already on. Only change a section when you want to hide or hand-pick exact items.
                  </p>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  {selectionSections.map((section) => {
                    const isCustom = section.selection !== null
                    const enabledCount = section.selection?.length ?? section.items.length

                    return (
                      <Card key={section.key} className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-none">
                        <div className="flex h-full flex-col gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-medium text-on-surface">{section.label}</h3>
                              <Badge variant={isCustom ? "default" : "outline"}>
                                {isCustom ? "Chosen by hand" : "Everything on"}
                              </Badge>
                            </div>
                            <p className="text-sm text-on-surface-variant/75">{section.helper}</p>
                            <p className="text-xs text-on-surface-variant/70">
                              {enabledCount} of {section.items.length} turned on • {section.currentCount} currently appear in the preview
                            </p>
                          </div>

                          <div className="mt-auto flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveSelectionSection(section.key)}
                              disabled={section.items.length === 0}
                            >
                              Choose {section.label.toLowerCase()}
                            </Button>
                            {isCustom ? (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleSelectionSave(section.key, null)}
                              >
                                Turn everything back on
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {activeStep === "review" ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                    <p className="text-xs font-medium text-on-surface-variant/70">Tags</p>
                    <p className="mt-2 text-sm font-medium text-on-surface">{filtersSummary}</p>
                  </Card>

                  <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                    <p className="text-xs font-medium text-on-surface-variant/70">Item choices</p>
                    <p className="mt-2 text-sm font-medium text-on-surface">{itemChoiceSummary}</p>
                  </Card>

                  <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                    <p className="text-xs font-medium text-on-surface-variant/70">Advanced options</p>
                    <p className="mt-2 text-sm font-medium text-on-surface">{advancedSummary}</p>
                  </Card>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <SummaryMetric label="Experience" value={preview.displayedExperiences} helper={`${preview.matchedExperiences} matched`} />
                  <SummaryMetric label="Projects" value={preview.displayedProjects} helper={`${preview.matchedProjects} matched`} />
                  <SummaryMetric label="Education" value={preview.educationCount} />
                  <SummaryMetric label="Skills" value={preview.skillsCount} />
                  <SummaryMetric label="Contacts" value={preview.contactsCount} />
                </div>

                <Accordion defaultValue={hasAdvancedOptions ? ["advanced-options"] : []} multiple className="rounded-sm border border-outline-variant/60 bg-card">
                  <AccordionItem value="advanced-options" className="border-0 bg-transparent">
                    <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
                      Advanced options
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      <div className="space-y-5 pt-2">
                        <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                          <p className="text-sm font-medium text-on-surface">Only open this if you need more control</p>
                          <p className="mt-2 text-sm text-on-surface-variant/75">
                            Most profiles can stay on the default order with no limits.
                          </p>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Experience limit</FieldLabel>
                            <FieldDescription>Leave blank to keep every matching experience entry.</FieldDescription>
                            <Input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              value={state.experience_limit}
                              onChange={(event) =>
                                updateState((currentState) => ({
                                  ...currentState,
                                  experience_limit: event.target.value,
                                }))
                              }
                              placeholder="Optional"
                              className={inputClassName}
                            />
                          </div>

                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Project limit</FieldLabel>
                            <FieldDescription>Leave blank to keep every matching project entry.</FieldDescription>
                            <Input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              value={state.project_limit}
                              onChange={(event) =>
                                updateState((currentState) => ({
                                  ...currentState,
                                  project_limit: event.target.value,
                                }))
                              }
                              placeholder="Optional"
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Experience order</FieldLabel>
                            <NativeSelect
                              value={state.experience_order}
                              onChange={(event) =>
                                updateState((currentState) => ({
                                  ...currentState,
                                  experience_order: event.target.value as ProfileFormState["experience_order"],
                                }))
                              }
                              className={selectClassName}
                            >
                              {experienceOrderingOptions.map((option) => (
                                <NativeSelectOption key={option.value} value={option.value}>
                                  {option.label}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </div>

                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Project order</FieldLabel>
                            <NativeSelect
                              value={state.project_order}
                              onChange={(event) =>
                                updateState((currentState) => ({
                                  ...currentState,
                                  project_order: event.target.value as ProfileFormState["project_order"],
                                }))
                              }
                              className={selectClassName}
                            >
                              {projectOrderingOptions.map((option) => (
                                <NativeSelectOption key={option.value} value={option.value}>
                                  {option.label}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </div>

                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Education order</FieldLabel>
                            <NativeSelect
                              value={state.education_order}
                              onChange={(event) =>
                                updateState((currentState) => ({
                                  ...currentState,
                                  education_order: event.target.value as ProfileFormState["education_order"],
                                }))
                              }
                              className={selectClassName}
                            >
                              {educationOrderingOptions.map((option) => (
                                <NativeSelectOption key={option.value} value={option.value}>
                                  {option.label}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <FieldError>{visibleErrors.config}</FieldError>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-outline-variant/60 px-6 py-4">
            <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={activeStepIndex === 0}>
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Link href="/profiles" className="text-sm font-medium text-on-surface-variant underline-offset-4 hover:underline">
                Cancel
              </Link>
              {activeStep !== "review" ? (
                <Button type="button" onClick={handleNextStep}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || (currentMode === "edit" && !isDirty)}>
                  {isSubmitting ? <Spinner className="size-4" /> : null}
                  {currentMode === "create" ? "Save profile" : "Save changes"}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {currentMode === "edit" ? (
          <Card className="rounded-sm border border-primary/20 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-on-surface">Regenerate with AI</h2>
                <p className="text-sm text-on-surface-variant/75">
                  Start fresh with a new AI-generated profile based on your career data.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAiPrompt("")
                  setAiSuggestion(null)
                  setAiGenError(null)
                  setActiveStep("generate")
                }}
              >
                Regenerate with AI
              </Button>
            </div>
          </Card>
        ) : null}

        {currentMode === "edit" ? (
          <Card className="rounded-sm border border-destructive/20 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-on-surface">Delete this profile</h2>
                <p className="text-sm text-on-surface-variant/75">
                  Delete this profile only if you no longer need it. This cannot be undone.
                </p>
              </div>
              <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
                Delete profile
              </Button>
            </div>
          </Card>
        ) : null}
      </form>

      {activeSelectionDefinition ? (
        <ProfileSectionSelectorDialog
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
          automaticDescription={activeSelectionDefinition.automaticDescription}
          items={activeSelectionDefinition.items}
          value={activeSelectionDefinition.selection}
          onSave={(nextSelection) => handleSelectionSave(activeSelectionDefinition.key, nextSelection)}
        />
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete profile?</AlertDialogTitle>
            <AlertDialogDescription>
              {savedProfile
                ? `This will permanently delete ${savedProfile.name}. This can’t be undone.`
                : "This profile will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={isDeleting} className="gap-2">
              {isDeleting ? <Spinner className="size-4" /> : null}
              Delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
