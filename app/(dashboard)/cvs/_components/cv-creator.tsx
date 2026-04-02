"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import { createCv } from "@/lib/cvs/api"
import { buildCvPreview, buildCvRenderModel } from "@/lib/cvs/engine"
import { defaultCvOverrides, type CvTemplateMetadata } from "@/lib/cvs/types"
import {
  getFirstCvValidationMessage,
  hasCvValidationErrors,
  validateCvPayload,
} from "@/lib/cvs/validation"
import type { ProfileData } from "@/lib/profiles/types"

import { CvPreviewPanel } from "./cv-preview-panel"

type TemplateOption = CvTemplateMetadata & {
  preview_blurb: string
}

type CvCreatorProps = {
  profiles: ProfileData[]
  careerData: CareerWorkspaceData
  templates: TemplateOption[]
}

function buildSuggestedName(profile: ProfileData | undefined, template: TemplateOption | undefined) {
  if (!profile || !template) {
    return ""
  }

  return `${profile.name} — ${template.name}`
}

export function CvCreator({ profiles, careerData, templates }: CvCreatorProps) {
  const router = useRouter()
  const [profileId, setProfileId] = useState(() => profiles[0]?.id ?? "")
  const [templateId, setTemplateId] = useState(() => templates[0]?.id ?? "")
  const [name, setName] = useState("")
  const [hasEditedName, setHasEditedName] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedProfile = profiles.find((profile) => profile.id === profileId)
  const selectedTemplate = templates.find((template) => template.id === templateId)
  const suggestedName = useMemo(
    () => buildSuggestedName(selectedProfile, selectedTemplate),
    [selectedProfile, selectedTemplate]
  )

  useEffect(() => {
    if (!hasEditedName) {
      setName(suggestedName)
    }
  }, [hasEditedName, suggestedName])

  const payload = useMemo(
    () => ({
      name: name.trim(),
      profile_id: profileId,
      template_id: templateId,
      overrides: defaultCvOverrides,
    }),
    [name, profileId, templateId]
  )
  const validationErrors = useMemo(() => validateCvPayload(payload), [payload])

  const renderModel = useMemo(() => {
    if (!selectedProfile || !selectedTemplate) {
      return null
    }

    return buildCvRenderModel(payload, selectedProfile, careerData, selectedTemplate)
  }, [careerData, payload, selectedProfile, selectedTemplate])

  const preview = useMemo(() => (renderModel ? buildCvPreview(renderModel) : null), [renderModel])

  const handleCreate = async () => {
    setErrorMessage(null)

    if (hasCvValidationErrors(validationErrors)) {
      setErrorMessage(getFirstCvValidationMessage(validationErrors))
      return
    }

    setIsSubmitting(true)

    try {
      const createdCv = await createCv(payload)
      router.push(`/cvs/${createdCv.id}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We couldn’t create this CV right now.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!profiles.length) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8 xl:px-12">
        <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-16">
          <EmptyHeader>
            <EmptyTitle>Create a profile first</EmptyTitle>
            <EmptyDescription>
              Every CV starts from a profile. Create one first, then come back here to generate the document.
            </EmptyDescription>
          </EmptyHeader>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/profiles/new" className="inline-flex rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              Create profile
            </Link>
            <Link href="/career-data" className="inline-flex rounded-sm border border-outline-variant/60 px-4 py-3 text-sm font-medium text-on-surface">
              Review career data
            </Link>
          </div>
        </Empty>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 xl:px-12">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Link href="/cvs" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Back to CVs
            </Link>
            <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
              New CV
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                Create your next CV
              </h1>
              <p className="text-sm text-on-surface-variant/75 md:text-base">
                Choose a profile, confirm the template, give the document a clear name, and you are ready to go.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertTitle>We couldn’t create this CV.</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm">
            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">Step 1</p>
                  <h2 className="mt-2 text-xl font-semibold text-on-surface">Choose a profile</h2>
                  <p className="mt-1 text-sm text-on-surface-variant/75">
                    Your profile decides which parts of your saved career data appear in this CV.
                  </p>
                </div>

                <div className="grid gap-3">
                  {profiles.map((profile) => {
                    const isActive = profile.id === profileId

                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          setProfileId(profile.id)
                          setErrorMessage(null)
                        }}
                        className={`rounded-sm border px-4 py-4 text-left transition-colors ${
                          isActive
                            ? "border-primary/30 bg-primary-soft text-primary"
                            : "border-outline-variant/60 bg-background text-on-surface hover:border-primary/20 hover:bg-surface-subtle"
                        }`}
                      >
                        <p className="text-sm font-medium">{profile.name}</p>
                        <p className="mt-1 text-sm text-current/80">
                          {profile.include_tags.length || profile.exclude_tags.length
                            ? `${profile.include_tags.length} include tag${profile.include_tags.length === 1 ? "" : "s"} • ${profile.exclude_tags.length} exclude tag${profile.exclude_tags.length === 1 ? "" : "s"}`
                            : "Uses all matching data"}
                        </p>
                      </button>
                    )
                  })}
                </div>
                <FieldError>{validationErrors.profile_id}</FieldError>
              </section>

              <section className="space-y-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">Step 2</p>
                  <h2 className="mt-2 text-xl font-semibold text-on-surface">Choose a template</h2>
                  <p className="mt-1 text-sm text-on-surface-variant/75">
                    Start with one clean, reliable template now. More templates can be added later without changing your data.
                  </p>
                </div>

                <div className="grid gap-3">
                  {templates.map((template) => {
                    const isActive = template.id === templateId

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setTemplateId(template.id)
                          setErrorMessage(null)
                        }}
                        className={`rounded-sm border px-4 py-4 text-left transition-colors ${
                          isActive
                            ? "border-primary/30 bg-primary-soft text-primary"
                            : "border-outline-variant/60 bg-background text-on-surface hover:border-primary/20 hover:bg-surface-subtle"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{template.name}</p>
                          <Badge variant="outline">{template.layout_type.replace("-", " ")}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-current/80">{template.description}</p>
                        <p className="mt-2 text-xs text-current/70">{template.preview_blurb}</p>
                      </button>
                    )
                  })}
                </div>
                <FieldError>{validationErrors.template_id}</FieldError>
              </section>

              <section className="space-y-2">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">Step 3</p>
                  <h2 className="mt-2 text-xl font-semibold text-on-surface">Name this CV</h2>
                </div>
                <FieldLabel className="text-sm font-medium text-on-surface">CV name</FieldLabel>
                <FieldDescription>
                  Use a name that will make sense later, like the role or company this version is for.
                </FieldDescription>
                <Input
                  value={name}
                  onChange={(event) => {
                    setHasEditedName(true)
                    setName(event.target.value)
                    setErrorMessage(null)
                  }}
                  placeholder="Frontend Engineer CV"
                  className="h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"
                />
                <FieldError>{validationErrors.name}</FieldError>
              </section>

              <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4">
                <p className="text-sm font-medium text-on-surface">Ready when you are</p>
                <p className="mt-1 text-sm text-on-surface-variant/75">
                  After you create it, you can fine-tune section order, visible items, preview, and export from the CV editor.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => void handleCreate()} disabled={isSubmitting || hasCvValidationErrors(validationErrors)}>
                  {isSubmitting ? <Spinner className="size-4" /> : null}
                  Create CV
                </Button>
                <Link href="/cvs" className="inline-flex rounded-sm border border-outline-variant/60 px-4 py-3 text-sm font-medium text-on-surface">
                  Cancel
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          {renderModel && preview ? (
            <CvPreviewPanel
              title="Live preview"
              description="This is exactly how your chosen profile and template fit together right now."
              templateId={selectedTemplate?.id ?? ""}
              model={renderModel}
              preview={preview}
            />
          ) : (
            <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-16">
              <EmptyHeader>
                <EmptyTitle>Choose a profile and template</EmptyTitle>
                <EmptyDescription>
                  Your live preview will appear here as soon as the document setup is complete.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </main>
  )
}
