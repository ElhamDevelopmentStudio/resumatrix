"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AiDiffOverlay } from "@/components/ai-diff-overlay"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"
import type { RewriteSuggestion } from "@/lib/ai/types"
import { getAiClientErrorMessage } from "@/lib/ai/client-error"
import type { ExperienceDraft } from "@/lib/career-data/drafts"
import type { ExperienceErrorState } from "@/lib/career-data/validation"
import { useState } from "react"

import { fieldLabelClassName, textAreaClassName, textInputClassName } from "./career-form-styles"
import { ItemCard } from "./item-card"

type ExperienceItemProps = {
  experience: ExperienceDraft
  errors: ExperienceErrorState
  updateExperienceField: (clientId: string, field: keyof ExperienceDraft, value: string) => void
  removeExperience: (clientId: string) => Promise<void>
}

export function ExperienceItem({
  experience,
  errors,
  updateExperienceField,
  removeExperience,
}: ExperienceItemProps) {
  const careerData = useCareerDataStore((state) => state)
  const rewriteField = useAction(api.ai_functions.rewrite_field.rewrite_field)

  // AI state for role field
  const [roleAiState, setRoleAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [roleSuggestion, setRoleSuggestion] = useState<RewriteSuggestion | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)

  // AI state for bullets field
  const [bulletsAiState, setBulletsAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [bulletsSuggestion, setBulletsSuggestion] = useState<RewriteSuggestion | null>(null)
  const [bulletsError, setBulletsError] = useState<string | null>(null)

  async function handleRoleRewrite() {
    setRoleAiState("loading")
    setRoleError(null)
    setRoleSuggestion(null)

    try {
      const result = await rewriteField({
        fieldType: "role",
        originalValue: experience.role,
        careerDataSerialized: JSON.stringify(careerData),
      })

      if (result.ok) {
        setRoleSuggestion(result.data)
        setRoleAiState("suggestion")
      } else {
        setRoleError(result.error)
        setRoleAiState("error")
      }
    } catch (error) {
      setRoleError(getAiClientErrorMessage(error))
      setRoleAiState("error")
    }
  }

  function handleRoleApply(newValue: string) {
    updateExperienceField(experience.clientId, "role", newValue)
    setRoleAiState("idle")
    setRoleSuggestion(null)
    setRoleError(null)
  }

  async function handleBulletsRewrite() {
    setBulletsAiState("loading")
    setBulletsError(null)
    setBulletsSuggestion(null)

    try {
      const result = await rewriteField({
        fieldType: "bullet",
        originalValue: experience.bullets_text,
        careerDataSerialized: JSON.stringify(careerData),
      })

      if (result.ok) {
        setBulletsSuggestion(result.data)
        setBulletsAiState("suggestion")
      } else {
        setBulletsError(result.error)
        setBulletsAiState("error")
      }
    } catch (error) {
      setBulletsError(getAiClientErrorMessage(error))
      setBulletsAiState("error")
    }
  }

  function handleBulletsApply(newValue: string) {
    updateExperienceField(experience.clientId, "bullets_text", newValue)
    setBulletsAiState("idle")
    setBulletsSuggestion(null)
    setBulletsError(null)
  }

  return (
    <ItemCard
      title={experience.company || "New experience"}
      subtitle={experience.role || "Add the company, role, dates, and impact."}
      onRemove={() => void removeExperience(experience.clientId)}
      removeLabel={`Remove ${experience.company || "experience"}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Company</FieldLabel>
          <Input
            type="text"
            value={experience.company}
            onChange={(event) => updateExperienceField(experience.clientId, "company", event.target.value)}
            aria-invalid={Boolean(errors.company)}
            placeholder="e.g. Acme Studio"
            className={textInputClassName}
          />
          <FieldError>{errors.company}</FieldError>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel className={fieldLabelClassName}>Role</FieldLabel>
            <button
              type="button"
              onClick={handleRoleRewrite}
              disabled={roleAiState === "loading"}
              className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
              aria-label="Rewrite role with AI"
            >
              <HugeiconsIcon icon={SparklesIcon} className="size-4" />
            </button>
          </div>
          <Input
            type="text"
            value={experience.role}
            onChange={(event) => updateExperienceField(experience.clientId, "role", event.target.value)}
            aria-invalid={Boolean(errors.role)}
            placeholder="e.g. Senior Frontend Engineer"
            className={textInputClassName}
          />
          <FieldError>{errors.role}</FieldError>
          <AiDiffOverlay
            suggestion={roleSuggestion}
            isLoading={roleAiState === "loading"}
            error={roleError}
            onApply={handleRoleApply}
            onRegenerate={handleRoleRewrite}
            onCancel={() => {
              setRoleAiState("idle")
              setRoleSuggestion(null)
              setRoleError(null)
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Start date</FieldLabel>
          <Input
            type="month"
            value={experience.start_date}
            onChange={(event) => updateExperienceField(experience.clientId, "start_date", event.target.value)}
            className={textInputClassName}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>End date</FieldLabel>
          <Input
            type="month"
            value={experience.end_date}
            onChange={(event) => updateExperienceField(experience.clientId, "end_date", event.target.value)}
            className={textInputClassName}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Location</FieldLabel>
          <Input
            type="text"
            value={experience.location}
            onChange={(event) => updateExperienceField(experience.clientId, "location", event.target.value)}
            placeholder="e.g. Remote"
            className={textInputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className={fieldLabelClassName}>Achievements</FieldLabel>
          <button
            type="button"
            onClick={handleBulletsRewrite}
            disabled={bulletsAiState === "loading"}
            className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
            aria-label="Rewrite achievements with AI"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-4" />
          </button>
        </div>
        <Textarea
          value={experience.bullets_text}
          onChange={(event) => updateExperienceField(experience.clientId, "bullets_text", event.target.value)}
          placeholder={"Write one achievement per line.\nExample: Led the redesign of the customer dashboard."}
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
            setBulletsError(null)
          }}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel className={fieldLabelClassName}>Tags</FieldLabel>
        <Input
          type="text"
          value={experience.tags_text}
          onChange={(event) => updateExperienceField(experience.clientId, "tags_text", event.target.value)}
          placeholder="e.g. react, performance, leadership"
          className={textInputClassName}
        />
      </div>
    </ItemCard>
  )
}
