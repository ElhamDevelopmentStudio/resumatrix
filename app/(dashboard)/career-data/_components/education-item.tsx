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
import type { EducationDraft } from "@/lib/career-data/drafts"
import type { EducationErrorState } from "@/lib/career-data/validation"
import { useState } from "react"

import { fieldLabelClassName, textAreaClassName, textInputClassName } from "./career-form-styles"
import { ItemCard } from "./item-card"

type EducationItemProps = {
  entry: EducationDraft
  errors: EducationErrorState
  updateEducationField: (clientId: string, field: keyof EducationDraft, value: string) => void
  removeEducation: (clientId: string) => Promise<void>
}

export function EducationItem({
  entry,
  errors,
  updateEducationField,
  removeEducation,
}: EducationItemProps) {
  const careerData = useCareerDataStore((state) => state)
  const rewriteField = useMutation(api.ai_functions.rewrite_field.rewrite_field)

  // AI state for details field
  const [detailsAiState, setDetailsAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [detailsSuggestion, setDetailsSuggestion] = useState<RewriteSuggestion | null>(null)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  async function handleDetailsRewrite() {
    setDetailsAiState("loading")
    setDetailsError(null)
    const result = await rewriteField({
      fieldType: "details",
      originalValue: entry.details,
      careerDataSerialized: JSON.stringify(careerData),
    })
    if (result.ok) {
      setDetailsSuggestion(result.data)
      setDetailsAiState("suggestion")
    } else {
      setDetailsError(result.error)
      setDetailsAiState("error")
    }
  }

  function handleDetailsApply(newValue: string) {
    updateEducationField(entry.clientId, "details", newValue)
    setDetailsAiState("idle")
    setDetailsSuggestion(null)
  }

  return (
    <ItemCard
      title={entry.institution || "New education entry"}
      subtitle={entry.degree || "Add the school, program, dates, and extra details."}
      onRemove={() => void removeEducation(entry.clientId)}
      removeLabel={`Remove ${entry.institution || "education entry"}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Institution</FieldLabel>
          <Input
            type="text"
            value={entry.institution}
            onChange={(event) => updateEducationField(entry.clientId, "institution", event.target.value)}
            aria-invalid={Boolean(errors.institution)}
            placeholder="e.g. State University"
            className={textInputClassName}
          />
          <FieldError>{errors.institution}</FieldError>
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Degree or program</FieldLabel>
          <Input
            type="text"
            value={entry.degree}
            onChange={(event) => updateEducationField(entry.clientId, "degree", event.target.value)}
            aria-invalid={Boolean(errors.degree)}
            placeholder="e.g. B.S. in Computer Science"
            className={textInputClassName}
          />
          <FieldError>{errors.degree}</FieldError>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Start date</FieldLabel>
          <Input
            type="month"
            value={entry.start_date}
            onChange={(event) => updateEducationField(entry.clientId, "start_date", event.target.value)}
            className={textInputClassName}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>End date</FieldLabel>
          <Input
            type="month"
            value={entry.end_date}
            onChange={(event) => updateEducationField(entry.clientId, "end_date", event.target.value)}
            className={textInputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className={fieldLabelClassName}>Details</FieldLabel>
          <button
            type="button"
            onClick={handleDetailsRewrite}
            disabled={detailsAiState === "loading"}
            className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
            aria-label="Rewrite details with AI"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-4" />
          </button>
        </div>
        <Textarea
          value={entry.details}
          onChange={(event) => updateEducationField(entry.clientId, "details", event.target.value)}
          placeholder="Add honors, coursework, thesis notes, or certification details if they help."
          className={textAreaClassName}
        />
        <AiDiffOverlay
          suggestion={detailsSuggestion}
          isLoading={detailsAiState === "loading"}
          error={detailsError}
          onApply={handleDetailsApply}
          onRegenerate={handleDetailsRewrite}
          onCancel={() => {
            setDetailsAiState("idle")
            setDetailsSuggestion(null)
          }}
        />
      </div>
    </ItemCard>
  )
}
