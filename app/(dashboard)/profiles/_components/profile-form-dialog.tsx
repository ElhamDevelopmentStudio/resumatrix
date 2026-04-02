"use client"

import { useMemo, useState, type FormEvent } from "react"
import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import { buildProfilePreview } from "@/lib/profiles/engine"
import {
  defaultProfileConfig,
  educationOrderingOptions,
  emptyProfilePayload,
  experienceOrderingOptions,
  projectOrderingOptions,
  type ProfileData,
  type ProfilePayload,
} from "@/lib/profiles/types"
import {
  getFirstProfileValidationMessage,
  hasProfileValidationErrors,
  normalizeProfilePayload,
  validateProfilePayload,
} from "@/lib/profiles/validation"

import { ProfileTagEditor } from "./profile-tag-editor"

const inputClassName =
  "h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20 md:text-sm"

const selectClassName =
  "w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:rounded-sm [&_[data-slot=native-select]]:border-outline-variant/70 [&_[data-slot=native-select]]:bg-background [&_[data-slot=native-select]]:px-3 [&_[data-slot=native-select]]:pr-8 [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:text-on-surface [&_[data-slot=native-select]]:focus-visible:border-primary [&_[data-slot=native-select]]:focus-visible:ring-primary/20 [&_[data-slot=native-select-icon]]:right-3 [&_[data-slot=native-select-icon]]:size-4 [&_[data-slot=native-select-icon]]:text-on-surface-variant/60"

type ProfileFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  profile: ProfileData | null
  careerData: CareerWorkspaceData
  tagSuggestions: string[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: ProfilePayload) => Promise<void>
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

type ProfileFormContentProps = ProfileFormDialogProps

function ProfileFormContent({
  open,
  mode,
  profile,
  careerData,
  tagSuggestions,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ProfileFormContentProps) {
  const [state, setState] = useState<ProfileFormState>(() => buildFormState(profile))
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const payload = useMemo(() => buildPayload(state), [state])
  const validationErrors = useMemo(() => validateProfilePayload(payload), [payload])
  const preview = useMemo(() => buildProfilePreview(payload, careerData), [careerData, payload])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setSubmitError(null)

    if (hasProfileValidationErrors(validationErrors)) {
      setSubmitError(getFirstProfileValidationMessage(validationErrors))
      return
    }

    try {
      await onSubmit(payload)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "We couldn’t save this profile right now."
      )
    }
  }

  const visibleErrors = hasAttemptedSubmit ? validationErrors : {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-3rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <DialogHeader className="border-b border-outline-variant/60 px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-on-surface">
              {mode === "create" ? "Create profile" : "Edit profile"}
            </DialogTitle>
            <DialogDescription>
              Profiles turn your saved career data into targeted resume variants.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(22rem,1fr)]">
            <div className="space-y-5">
              {submitError ? (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
                  <AlertTitle>We couldn’t save this profile.</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <FieldLabel className="text-sm font-medium text-on-surface">Profile name</FieldLabel>
                <FieldDescription>
                  Give this profile a job-targeted name, like Frontend Developer or Product Designer.
                </FieldDescription>
                <Input
                  value={state.name}
                  onChange={(event) => setState((currentState) => ({ ...currentState, name: event.target.value }))}
                  placeholder="e.g. Frontend Developer"
                  className={inputClassName}
                  aria-invalid={Boolean(visibleErrors.name)}
                />
                <FieldError>{visibleErrors.name}</FieldError>
              </div>

              <ProfileTagEditor
                label="Include tags"
                description="Only experiences and projects with these tags will be kept. Leave this empty to keep everything unless excluded."
                tags={state.include_tags}
                onChange={(nextTags) => setState((currentState) => ({ ...currentState, include_tags: nextTags }))}
                suggestions={tagSuggestions}
                blockedTags={state.exclude_tags}
                placeholder="Type a tag and press Enter"
                error={visibleErrors.include_tags}
              />

              <ProfileTagEditor
                label="Exclude tags"
                description="Any experience or project with one of these tags will be removed, even if it also matches an include tag."
                tags={state.exclude_tags}
                onChange={(nextTags) => setState((currentState) => ({ ...currentState, exclude_tags: nextTags }))}
                suggestions={tagSuggestions}
                blockedTags={state.include_tags}
                placeholder="Type a tag and press Enter"
                error={visibleErrors.exclude_tags}
                tone="destructive"
              />

              <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-5 shadow-none">
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-semibold text-on-surface">Display settings</h3>
                  <p className="text-sm text-on-surface-variant/75">
                    Fine-tune how much content each profile should surface.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-medium text-on-surface">Experience limit</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={state.experience_limit}
                      onChange={(event) =>
                        setState((currentState) => ({
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
                    <Input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={state.project_limit}
                      onChange={(event) =>
                        setState((currentState) => ({
                          ...currentState,
                          project_limit: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-medium text-on-surface">Experience order</FieldLabel>
                    <NativeSelect
                      value={state.experience_order}
                      onChange={(event) =>
                        setState((currentState) => ({
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
                        setState((currentState) => ({
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
                        setState((currentState) => ({
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

                <FieldError className="mt-3">{visibleErrors.config}</FieldError>
              </Card>
            </div>

            <aside className="space-y-4">
              <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-none">
                <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-success" />
                  Live preview
                </div>
                <p className="mt-2 text-sm text-on-surface-variant/75">
                  This is what the profile would keep from your current career data.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/50 p-3">
                    <p className="text-xs font-medium text-on-surface-variant/70">Experience</p>
                    <p className="mt-1 text-2xl font-semibold text-on-surface">{preview.displayedExperiences}</p>
                    <p className="mt-1 text-xs text-on-surface-variant/70">
                      {preview.matchedExperiences} matched before limits
                    </p>
                  </div>

                  <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/50 p-3">
                    <p className="text-xs font-medium text-on-surface-variant/70">Projects</p>
                    <p className="mt-1 text-2xl font-semibold text-on-surface">{preview.displayedProjects}</p>
                    <p className="mt-1 text-xs text-on-surface-variant/70">
                      {preview.matchedProjects} matched before limits
                    </p>
                  </div>

                  <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/50 p-3">
                    <p className="text-xs font-medium text-on-surface-variant/70">Education</p>
                    <p className="mt-1 text-2xl font-semibold text-on-surface">{preview.educationCount}</p>
                  </div>

                  <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/50 p-3">
                    <p className="text-xs font-medium text-on-surface-variant/70">Skills</p>
                    <p className="mt-1 text-2xl font-semibold text-on-surface">{preview.skillsCount}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-sm border border-outline-variant/60 bg-background p-4">
                  <p className="text-xs font-medium text-on-surface-variant/70">Total displayed items</p>
                  <p className="mt-1 text-2xl font-semibold text-on-surface">{preview.totalDisplayedItems}</p>
                  <p className="mt-1 text-xs text-on-surface-variant/70">
                    Contacts stay available for all profiles: {preview.contactsCount}
                  </p>
                </div>
              </Card>

              {preview.hasEmptyPrimaryResults ? (
                <Alert className="border-outline-variant/60 bg-surface-subtle/50">
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 text-primary" />
                  <AlertTitle>No experience or project entries match yet.</AlertTitle>
                  <AlertDescription>
                    Try fewer include tags, or remove excludes that are filtering too much.
                  </AlertDescription>
                </Alert>
              ) : null}
            </aside>
          </div>

          <DialogFooter className="border-t border-outline-variant/60 px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-outline-variant/70 px-4 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-subtle hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Spinner className="size-4" /> : null}
              <span>{mode === "create" ? "Create profile" : "Save changes"}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProfileFormDialog(props: ProfileFormDialogProps) {
  const resetKey = `${props.mode}-${props.profile?.id ?? "new"}-${props.open ? "open" : "closed"}`

  return <ProfileFormContent key={resetKey} {...props} />
}
