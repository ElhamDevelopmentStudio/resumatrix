"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { FunctionReference } from "convex/server"
import { AiDiffOverlay } from "@/components/ai-diff-overlay"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"
import type { RewriteSuggestion } from "@/lib/ai/types"
import { useState } from "react"

import { fieldLabelClassName, textAreaClassName, textInputClassName } from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"

export function PersonalSection() {
  const personal = useCareerDataStore((state) => state.personal)
  const personalErrors = useCareerDataStore((state) => state.personalErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.personal)
  const updatePersonalField = useCareerDataStore((state) => state.updatePersonalField)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)
  const careerData = useCareerDataStore((state) => state)

  const rewriteField = useMutation(api.ai_functions.rewrite_field as unknown as FunctionReference<"mutation">)

  const isOpen = expandedSections.includes("personal")
  const summary = personal.full_name ? personal.full_name : "Name and summary"

  // AI state for summary field
  const [summaryAiState, setSummaryAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
  const [summarySuggestion, setSummarySuggestion] = useState<RewriteSuggestion | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  async function handleSummaryRewrite() {
    setSummaryAiState("loading")
    setSummaryError(null)
    const result = await rewriteField({
      fieldType: "summary",
      originalValue: personal.summary,
      careerDataSerialized: JSON.stringify(careerData),
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
    updatePersonalField("summary", newValue)
    setSummaryAiState("idle")
    setSummarySuggestion(null)
  }

  return (
    <CareerSectionCard
      id="career-section-personal"
      step="01"
      title="Personal info"
      description="Your name, professional headline, and short summary."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("personal")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Full name</FieldLabel>
          <Input
            id="career-full-name"
            type="text"
            value={personal.full_name}
            onChange={(event) => updatePersonalField("full_name", event.target.value)}
            aria-invalid={Boolean(personalErrors.full_name)}
            placeholder="e.g. Alex Rivera"
            className={textInputClassName}
          />
          <FieldError>{personalErrors.full_name}</FieldError>
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Professional title</FieldLabel>
          <Input
            id="career-title"
            type="text"
            value={personal.title}
            onChange={(event) => updatePersonalField("title", event.target.value)}
            placeholder="e.g. Frontend Developer"
            className={textInputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className={fieldLabelClassName}>Summary</FieldLabel>
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
          id="career-summary"
          value={personal.summary}
          onChange={(event) => updatePersonalField("summary", event.target.value)}
          placeholder="Write a short summary about your strengths, specialties, and impact."
          className={textAreaClassName}
        />
        <AiDiffOverlay
          suggestion={summarySuggestion}
          isLoading={summaryAiState === "loading"}
          error={summaryError}
          onApply={handleSummaryApply}
          onRegenerate={handleSummaryRewrite}
          onCancel={() => { setSummaryAiState("idle"); setSummarySuggestion(null); }}
        />
      </div>
    </CareerSectionCard>
  )
}
