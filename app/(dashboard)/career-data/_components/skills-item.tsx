"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { FunctionReference } from "convex/server"
import { AiDiffOverlay } from "@/components/ai-diff-overlay"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { skillCategoryOptions, skillLevelOptions } from "@/lib/career-data/types"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"
import type { RewriteSuggestion } from "@/lib/ai/types"
import type { SkillDraft } from "@/lib/career-data/drafts"
import type { SkillErrorState } from "@/lib/career-data/validation"
import { useState } from "react"

import { fieldLabelClassName, selectClassName, textInputClassName } from "./career-form-styles"
import { ItemCard } from "./item-card"

type SkillsItemProps = {
  skill: SkillDraft
  errors: SkillErrorState
  updateSkillField: (clientId: string, field: keyof SkillDraft, value: string) => void
  removeSkill: (clientId: string) => Promise<void>
}

export function SkillsItem({
  skill,
  errors,
  updateSkillField,
  removeSkill,
}: SkillsItemProps) {
  const careerData = useCareerDataStore((state) => state)
  const rewriteField = useMutation(api.ai_functions.rewrite_field as unknown as FunctionReference<"mutation">)

  // AI state for name field
  const [nameAiState, setNameAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [nameSuggestion, setNameSuggestion] = useState<RewriteSuggestion | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  async function handleNameRewrite() {
    setNameAiState("loading")
    setNameError(null)
    const result = await rewriteField({
      fieldType: "role",
      originalValue: skill.name,
      careerDataSerialized: JSON.stringify(careerData),
    })
    if (result.ok) {
      setNameSuggestion(result.data)
      setNameAiState("suggestion")
    } else {
      setNameError(result.error)
      setNameAiState("error")
    }
  }

  function handleNameApply(newValue: string) {
    updateSkillField(skill.clientId, "name", newValue)
    setNameAiState("idle")
    setNameSuggestion(null)
  }

  return (
    <ItemCard
      title={skill.name || "New skill"}
      subtitle={skill.category || "Choose a category and optional level."}
      onRemove={() => void removeSkill(skill.clientId)}
      removeLabel={`Remove ${skill.name || "skill"}`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel className={fieldLabelClassName}>Skill</FieldLabel>
            <button
              type="button"
              onClick={handleNameRewrite}
              disabled={nameAiState === "loading"}
              className="flex size-7 items-center justify-center rounded-sm text-primary hover:bg-primary/10 disabled:opacity-50"
              aria-label="Rewrite skill name with AI"
            >
              <HugeiconsIcon icon={SparklesIcon} className="size-4" />
            </button>
          </div>
          <Input
            type="text"
            value={skill.name}
            onChange={(event) => updateSkillField(skill.clientId, "name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            placeholder="e.g. React"
            className={textInputClassName}
          />
          <FieldError>{errors.name}</FieldError>
          <AiDiffOverlay
            suggestion={nameSuggestion}
            isLoading={nameAiState === "loading"}
            error={nameError}
            onApply={handleNameApply}
            onRegenerate={handleNameRewrite}
            onCancel={() => {
              setNameAiState("idle")
              setNameSuggestion(null)
            }}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Category</FieldLabel>
          <NativeSelect
            value={skill.category}
            onChange={(event) => updateSkillField(skill.clientId, "category", event.target.value)}
            aria-invalid={Boolean(errors.category)}
            className={selectClassName}
          >
            <NativeSelectOption value="">Select category</NativeSelectOption>
            {skillCategoryOptions.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{errors.category}</FieldError>
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Level</FieldLabel>
          <NativeSelect
            value={skill.level}
            onChange={(event) => updateSkillField(skill.clientId, "level", event.target.value)}
            className={selectClassName}
          >
            <NativeSelectOption value="">Optional</NativeSelectOption>
            {skillLevelOptions.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
    </ItemCard>
  )
}