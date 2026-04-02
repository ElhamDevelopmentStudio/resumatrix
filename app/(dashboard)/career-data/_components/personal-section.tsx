"use client"

import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { CareerSectionCard } from "./career-section-card"

const labelClassName =
  "text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase"
const inputClassName =
  "h-12 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"
const textareaClassName =
  "min-h-36 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 py-3 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"

export function PersonalSection() {
  const personal = useCareerDataStore((state) => state.personal)
  const personalErrors = useCareerDataStore((state) => state.personalErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.personal)
  const updatePersonalField = useCareerDataStore((state) => state.updatePersonalField)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("personal")
  const summary = personal.full_name ? personal.full_name : "Add your name, title, and summary"

  return (
    <CareerSectionCard
      id="career-section-personal"
      step="Step 01"
      title="Personal info"
      description="Set the core identity that every resume will build on."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("personal")}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel className={labelClassName}>Full name</FieldLabel>
          <Input
            id="career-full-name"
            type="text"
            value={personal.full_name}
            onChange={(event) => updatePersonalField("full_name", event.target.value)}
            aria-invalid={Boolean(personalErrors.full_name)}
            placeholder="e.g. Alex Rivera"
            className={inputClassName}
          />
          <FieldError>{personalErrors.full_name}</FieldError>
        </div>

        <div className="space-y-2">
          <FieldLabel className={labelClassName}>Professional title</FieldLabel>
          <Input
            id="career-title"
            type="text"
            value={personal.title}
            onChange={(event) => updatePersonalField("title", event.target.value)}
            placeholder="e.g. Frontend Developer"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel className={labelClassName}>Summary</FieldLabel>
        <Textarea
          id="career-summary"
          value={personal.summary}
          onChange={(event) => updatePersonalField("summary", event.target.value)}
          placeholder="Write a short summary that explains your strengths, specialties, and impact."
          className={textareaClassName}
        />
      </div>
    </CareerSectionCard>
  )
}
