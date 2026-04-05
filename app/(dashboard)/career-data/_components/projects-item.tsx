"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AiDiffOverlay } from "@/components/ai-diff-overlay"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"
import type { RewriteSuggestion } from "@/lib/ai/types"
import type { ProjectDraft } from "@/lib/career-data/drafts"
import type { ProjectErrorState } from "@/lib/career-data/validation"
import { useState } from "react"

import { fieldLabelClassName, textAreaClassName, textInputClassName } from "./career-form-styles"
import { ItemCard } from "./item-card"

type ProjectsItemProps = {
  project: ProjectDraft
  errors: ProjectErrorState
  updateProjectField: (clientId: string, field: keyof ProjectDraft, value: string) => void
  removeProject: (clientId: string) => Promise<void>
}

export function ProjectsItem({
  project,
  errors,
  updateProjectField,
  removeProject,
}: ProjectsItemProps) {
  const careerData = useCareerDataStore((state) => state)
  const rewriteField = useMutation(api.ai_functions.rewrite_field.rewrite_field)

  // AI state for description field
  const [descriptionAiState, setDescriptionAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [descriptionSuggestion, setDescriptionSuggestion] = useState<RewriteSuggestion | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)

  // AI state for bullets field
  const [bulletsAiState, setBulletsAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [bulletsSuggestion, setBulletsSuggestion] = useState<RewriteSuggestion | null>(null)
  const [bulletsError, setBulletsError] = useState<string | null>(null)

  async function handleDescriptionRewrite() {
    setDescriptionAiState("loading")
    setDescriptionError(null)
    const result = await rewriteField({
      fieldType: "description",
      originalValue: project.description,
      careerDataSerialized: JSON.stringify(careerData),
    })
    if (result.ok) {
      setDescriptionSuggestion(result.data)
      setDescriptionAiState("suggestion")
    } else {
      setDescriptionError(result.error)
      setDescriptionAiState("error")
    }
  }

  function handleDescriptionApply(newValue: string) {
    updateProjectField(project.clientId, "description", newValue)
    setDescriptionAiState("idle")
    setDescriptionSuggestion(null)
  }

  async function handleBulletsRewrite() {
    setBulletsAiState("loading")
    setBulletsError(null)
    const result = await rewriteField({
      fieldType: "bullet",
      originalValue: project.bullets_text,
      careerDataSerialized: JSON.stringify(careerData),
    })
    if (result.ok) {
      setBulletsSuggestion(result.data)
      setBulletsAiState("suggestion")
    } else {
      setBulletsError(result.error)
      setBulletsAiState("error")
    }
  }

  function handleBulletsApply(newValue: string) {
    updateProjectField(project.clientId, "bullets_text", newValue)
    setBulletsAiState("idle")
    setBulletsSuggestion(null)
  }

  return (
    <ItemCard
      title={project.name || "New project"}
      subtitle={project.description || "Add the project name, stack, and outcomes."}
      onRemove={() => void removeProject(project.clientId)}
      removeLabel={`Remove ${project.name || "project"}`}
    >
      <div className="space-y-2">
        <FieldLabel className={fieldLabelClassName}>Project name</FieldLabel>
        <Input
          type="text"
          value={project.name}
          onChange={(event) => updateProjectField(project.clientId, "name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          placeholder="e.g. Resume Builder"
          className={textInputClassName}
        />
        <FieldError>{errors.name}</FieldError>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className={fieldLabelClassName}>Description</FieldLabel>
          <button
            type="button"
            onClick={handleDescriptionRewrite}
            disabled={descriptionAiState === "loading"}
            className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
            aria-label="Rewrite description with AI"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-4" />
          </button>
        </div>
        <Textarea
          value={project.description}
          onChange={(event) => updateProjectField(project.clientId, "description", event.target.value)}
          placeholder="Explain what the project does and why it matters."
          className={textAreaClassName}
        />
        <AiDiffOverlay
          suggestion={descriptionSuggestion}
          isLoading={descriptionAiState === "loading"}
          error={descriptionError}
          onApply={handleDescriptionApply}
          onRegenerate={handleDescriptionRewrite}
          onCancel={() => {
            setDescriptionAiState("idle")
            setDescriptionSuggestion(null)
          }}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel className={fieldLabelClassName}>Tech stack</FieldLabel>
        <Input
          type="text"
          value={project.tech_stack_text}
          onChange={(event) => updateProjectField(project.clientId, "tech_stack_text", event.target.value)}
          placeholder="e.g. Next.js, TypeScript, Prisma"
          className={textInputClassName}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className={fieldLabelClassName}>Highlights</FieldLabel>
          <button
            type="button"
            onClick={handleBulletsRewrite}
            disabled={bulletsAiState === "loading"}
            className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
            aria-label="Rewrite highlights with AI"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-4" />
          </button>
        </div>
        <Textarea
          value={project.bullets_text}
          onChange={(event) => updateProjectField(project.clientId, "bullets_text", event.target.value)}
          placeholder={"Write one highlight per line.\nExample: Built a live preview editor for ATS-friendly resumes."}
          className={textAreaClassName}
        />
        <AiDiffOverlay
          suggestion={bulletsSuggestion}
          isLoading={bulletsAiState === "loading"}
          error={bulletsError}
          onApply={handleBulletsApply}
          onRegenerate={handleBulletsRewrite}
          onCancel={() => {
            setBulletsAiState("idle")
            setBulletsSuggestion(null)
          }}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel className={fieldLabelClassName}>Tags</FieldLabel>
        <Input
          type="text"
          value={project.tags_text}
          onChange={(event) => updateProjectField(project.clientId, "tags_text", event.target.value)}
          placeholder="e.g. frontend, ai, product-design"
          className={textInputClassName}
        />
      </div>
    </ItemCard>
  )
}
