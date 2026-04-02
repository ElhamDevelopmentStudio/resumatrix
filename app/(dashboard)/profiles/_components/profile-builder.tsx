"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
import { buttonVariants, Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { FormSection } from "@/components/ui/form-section"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import { createProfile, deleteProfile, updateProfile } from "@/lib/profiles/api"
import { buildProfilePreview, getWorkspaceTagSuggestions, profileHasActiveRules } from "@/lib/profiles/engine"
import { buildProfileCoverageSummary, getProfileStatus } from "@/lib/profiles/presentation"
import {
  defaultProfileConfig,
  educationOrderingOptions,
  emptyProfilePayload,
  experienceOrderingOptions,
  projectOrderingOptions,
  type ProfileBuilderMode,
  type ProfileData,
  type ProfilePayload,
} from "@/lib/profiles/types"
import {
  getFirstProfileValidationMessage,
  hasProfileValidationErrors,
  normalizeProfilePayload,
  validateProfilePayload,
} from "@/lib/profiles/validation"
import { cn } from "@/lib/utils"

import { ProfileTagEditor } from "./profile-tag-editor"

const inputClassName =
  "h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20 md:text-sm"

const selectClassName =
  "w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:rounded-sm [&_[data-slot=native-select]]:border-outline-variant/70 [&_[data-slot=native-select]]:bg-background [&_[data-slot=native-select]]:px-3 [&_[data-slot=native-select]]:pr-8 [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:text-on-surface [&_[data-slot=native-select]]:focus-visible:border-primary [&_[data-slot=native-select]]:focus-visible:ring-primary/20 [&_[data-slot=native-select-icon]]:right-3 [&_[data-slot=native-select-icon]]:size-4 [&_[data-slot=native-select-icon]]:text-on-surface-variant/60"

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
    },
  })
}

function buildSnapshot(payload: ProfilePayload) {
  return JSON.stringify(payload)
}

function ProgressItem({
  label,
  helper,
  done,
  optional = false,
}: {
  label: string
  helper: string
  done: boolean
  optional?: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-3">
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm text-xs font-semibold",
          done ? "bg-primary-soft text-primary" : "bg-surface-subtle text-on-surface-variant/70"
        )}
      >
        {done ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" /> : optional ? "O" : "•"}
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-on-surface">{label}</p>
          {optional ? <Badge variant="outline">Optional</Badge> : null}
        </div>
        <p className="text-xs text-on-surface-variant/75">{helper}</p>
      </div>
    </div>
  )
}

function PreviewMetric({ label, value, helper }: { label: string; value: number; helper?: string }) {
  return (
    <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-3">
      <p className="text-xs font-medium text-on-surface-variant/70">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
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

  const payload = useMemo(() => buildPayload(state), [state])
  const payloadSnapshot = useMemo(() => buildSnapshot(payload), [payload])
  const validationErrors = useMemo(() => validateProfilePayload(payload), [payload])
  const preview = useMemo(() => buildProfilePreview(payload, careerData), [careerData, payload])
  const tagSuggestions = useMemo(() => getWorkspaceTagSuggestions(careerData), [careerData])
  const isDirty = payloadSnapshot !== savedSnapshot
  const currentMode: ProfileBuilderMode = savedProfile ? "edit" : mode
  const status = getProfileStatus(preview)
  const hasRules = profileHasActiveRules(payload)

  const visibleErrors = hasAttemptedSubmit ? validationErrors : {}

  const updateState = (updater: (currentState: ProfileFormState) => ProfileFormState) => {
    setState((currentState) => updater(currentState))
    setSubmitError(null)
    setSaveNotice(null)
  }

  const saveStatusLabel = isSubmitting
    ? "Saving…"
    : submitError
      ? "Fix the form issues"
      : currentMode === "create"
        ? "Not saved yet"
        : isDirty
          ? "Unsaved changes"
          : "All changes saved"

  const progressItems = [
    {
      label: "Name the profile",
      helper: payload.name ? `Current name: ${payload.name}` : "Give the profile a job-focused name.",
      done: Boolean(payload.name),
      optional: false,
    },
    {
      label: "Choose include tags",
      helper: payload.include_tags.length
        ? `${payload.include_tags.length} include tag${payload.include_tags.length === 1 ? "" : "s"} selected.`
        : "Add include tags if you want to narrow the profile to specific work.",
      done: payload.include_tags.length > 0,
      optional: true,
    },
    {
      label: "Remove anything off-target",
      helper: payload.exclude_tags.length
        ? `${payload.exclude_tags.length} exclude tag${payload.exclude_tags.length === 1 ? "" : "s"} selected.`
        : "Use exclude tags to hide work that weakens this version.",
      done: payload.exclude_tags.length > 0,
      optional: true,
    },
    {
      label: "Fine-tune limits and order",
      helper: hasRules
        ? "This profile already has at least one custom rule."
        : "Optional, but useful when you want tighter control over the final output.",
      done:
        payload.config.limits.experiences !== null ||
        payload.config.limits.projects !== null ||
        payload.config.ordering.experiences !== defaultProfileConfig.ordering.experiences ||
        payload.config.ordering.projects !== defaultProfileConfig.ordering.projects ||
        payload.config.ordering.education !== defaultProfileConfig.ordering.education,
      optional: true,
    },
  ]

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
        await createProfile(payload)
        router.push("/profiles")
        return
      }

      if (!savedProfile) {
        return
      }

      const updatedProfile = await updateProfile(savedProfile.id, payload)
      setSavedProfile(updatedProfile)
      setSavedSnapshot(payloadSnapshot)
      setSaveNotice("Changes saved.")
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
      await deleteProfile(savedProfile.id)
      router.push("/profiles")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t delete this profile right now.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8 xl:px-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Link href="/profiles" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to profiles
          </Link>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
                {currentMode === "create" ? "New profile" : "Edit profile"}
              </Badge>
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                  {currentMode === "create"
                    ? "Create a profile that knows what to keep"
                    : `Refine ${savedProfile?.name ?? "this profile"}`}
                </h1>
                <p className="text-sm text-on-surface-variant/75 md:text-base">
                  Profiles help you reuse one career dataset for multiple resume targets. Set the rules once, then come back here anytime to adjust them.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-sm border border-outline-variant/60 bg-card px-3 py-2 text-sm text-on-surface-variant shadow-sm">
                {saveStatusLabel}
              </div>
              {currentMode === "edit" ? (
                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
                  Delete profile
                </Button>
              ) : null}
              <Link href="/profiles" className={cn(buttonVariants({ variant: "outline", size: "default" }), "px-4")}>
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting || (currentMode === "edit" && !isDirty)}>
                {isSubmitting ? <Spinner className="size-4" /> : null}
                {currentMode === "create" ? "Save profile" : "Save changes"}
              </Button>
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

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-3 shadow-sm">
          <nav className="flex flex-wrap gap-2">
            {[
              ["profile-basics", "Basics"],
              ["profile-rules", "Filtering rules"],
              ["profile-display", "Ordering and limits"],
            ].map(([target, label]) => (
              <a
                key={target}
                href={`#${target}`}
                className="rounded-sm border border-outline-variant/60 px-3 py-2 text-sm text-on-surface-variant transition-colors hover:border-primary/20 hover:bg-primary-soft hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <div id="profile-basics">
              <FormSection
                title="Basics"
                step="01"
                description="Start with a name that makes sense to you when you come back later."
                action={<Badge variant="outline">Required</Badge>}
                contentClassName="p-6"
              >
                <div className="space-y-2">
                  <FieldLabel className="text-sm font-medium text-on-surface">Profile name</FieldLabel>
                  <FieldDescription>
                    Use the role or audience this profile is meant for, like Frontend Engineer, Product Designer, or Technical Lead.
                  </FieldDescription>
                  <Input
                    value={state.name}
                    onChange={(event) =>
                      updateState((currentState) => ({
                        ...currentState,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Frontend Engineer"
                    className={inputClassName}
                    aria-invalid={Boolean(visibleErrors.name)}
                  />
                  <FieldError>{visibleErrors.name}</FieldError>
                </div>
              </FormSection>
            </div>

            <div id="profile-rules">
              <FormSection
                title="Filtering rules"
                step="02"
                description="Decide what this profile should keep and what it should leave out."
                action={<Badge variant="outline">Optional</Badge>}
                contentClassName="space-y-5 p-6"
              >
                <Alert className="border-outline-variant/60 bg-surface-subtle/50">
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 text-primary" />
                  <AlertTitle>Important rule</AlertTitle>
                  <AlertDescription>
                    Exclude tags always win. If an item has both an include tag and an exclude tag, it will be removed.
                  </AlertDescription>
                </Alert>

                <ProfileTagEditor
                  label="Include tags"
                  description="Only experiences and projects with these tags will be kept. Leave this empty to keep everything unless excluded."
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
                      to make profile filtering more useful.
                    </span>
                  }
                />

                <ProfileTagEditor
                  label="Exclude tags"
                  description="Use exclude tags for anything that weakens this version, even if it also matches an include tag."
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
              </FormSection>
            </div>

            <div id="profile-display">
              <FormSection
                title="Ordering and limits"
                step="03"
                description="Fine-tune how much content appears and how it should be arranged."
                action={<Badge variant="outline">Optional</Badge>}
                contentClassName="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-medium text-on-surface">Experience limit</FieldLabel>
                    <FieldDescription>
                      Leave this blank to keep every matching experience entry.
                    </FieldDescription>
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
                    <FieldDescription>
                      Leave this blank to keep every matching project entry.
                    </FieldDescription>
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
                    <FieldDescription>Choose whether newer or older experience should appear first.</FieldDescription>
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
                    <FieldDescription>Saved order follows how projects are arranged in your workspace.</FieldDescription>
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
                    <FieldDescription>Choose whether newer or older education appears first.</FieldDescription>
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

                <FieldError>{visibleErrors.config}</FieldError>
              </FormSection>
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
              <div className="space-y-1">
                <h2 className="font-headline text-lg font-semibold text-on-surface">Setup progress</h2>
                <p className="text-sm text-on-surface-variant/75">
                  Use this as a guide if you’re not sure what to do next.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {progressItems.map((item) => (
                  <ProgressItem key={item.label} {...item} />
                ))}
              </div>
            </Card>

            <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-headline text-lg font-semibold text-on-surface">Live preview</h2>
                  <Badge variant={status.tone === "destructive" ? "destructive" : "default"}>{status.label}</Badge>
                </div>
                <p className="text-sm text-on-surface-variant/75">{status.helper}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <PreviewMetric label="Experience" value={preview.displayedExperiences} helper={`${preview.matchedExperiences} matched before limits`} />
                <PreviewMetric label="Projects" value={preview.displayedProjects} helper={`${preview.matchedProjects} matched before limits`} />
                <PreviewMetric label="Education" value={preview.educationCount} />
                <PreviewMetric label="Skills" value={preview.skillsCount} />
              </div>

              <div className="mt-4 rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4">
                <p className="text-xs font-medium text-on-surface-variant/70">Coverage summary</p>
                <p className="mt-2 text-sm text-on-surface">{buildProfileCoverageSummary(preview)}</p>
                <p className="mt-1 text-xs text-on-surface-variant/70">{preview.totalDisplayedItems} total visible items in this profile.</p>
              </div>
            </Card>

            <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
              <div className="space-y-1">
                <h2 className="font-headline text-lg font-semibold text-on-surface">Tag guidance</h2>
                <p className="text-sm text-on-surface-variant/75">
                  Tags make profile filtering much more precise.
                </p>
              </div>

              {tagSuggestions.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tagSuggestions.slice(0, 12).map((tag) => (
                    <Badge key={tag} variant="outline" className="border-outline-variant/70 bg-surface-subtle text-on-surface-variant">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-sm border border-dashed border-outline-variant/60 bg-surface-subtle/40 p-3 text-sm text-on-surface-variant/75">
                  No saved tags yet. Add or edit tags in Career Data first.
                </div>
              )}

              <div className="mt-4">
                <Link href="/career-data" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Open career data
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </form>

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
