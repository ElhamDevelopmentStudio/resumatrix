"use client"

import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { fieldLabelClassName, textAreaClassName, textInputClassName } from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"

export function PersonalSection() {
  const personal = useCareerDataStore((state) => state.personal)
  const personalErrors = useCareerDataStore((state) => state.personalErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.personal)
  const updatePersonalField = useCareerDataStore((state) => state.updatePersonalField)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("personal")
  const summary = personal.full_name ? personal.full_name : "Name and summary"

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
        <FieldLabel className={fieldLabelClassName}>Summary</FieldLabel>
        <Textarea
          id="career-summary"
          value={personal.summary}
          onChange={(event) => updatePersonalField("summary", event.target.value)}
          placeholder="Write a short summary about your strengths, specialties, and impact."
          className={textAreaClassName}
        />
      </div>
    </CareerSectionCard>
  )
}
