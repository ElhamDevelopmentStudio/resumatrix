"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isBlankEducation } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
  fieldLabelClassName,
  textAreaClassName,
  textInputClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

export function EducationSection() {
  const education = useCareerDataStore((state) => state.education)
  const educationErrors = useCareerDataStore((state) => state.educationErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.education)
  const addEducation = useCareerDataStore((state) => state.addEducation)
  const updateEducationField = useCareerDataStore((state) => state.updateEducationField)
  const removeEducation = useCareerDataStore((state) => state.removeEducation)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("education")
  const activeCount = education.filter((entry) => !isBlankEducation(entry)).length
  const summary = activeCount ? `${activeCount} ${activeCount === 1 ? "entry" : "entries"}` : "No entries yet"

  return (
    <CareerSectionCard
      id="career-section-education"
      step="05"
      title="Education"
      description="Degrees, certifications, and useful supporting details."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("education")}
    >
      <DynamicList
        items={education}
        getKey={(entry) => entry.clientId}
        className="space-y-3"
        emptyState={
          <div className={emptyStateClassName}>
            Add a degree, certification, or training program when it strengthens your story.
          </div>
        }
        renderItem={(entry) => {
          const nextErrors = educationErrors[entry.clientId] ?? {}

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
                    aria-invalid={Boolean(nextErrors.institution)}
                    placeholder="e.g. State University"
                    className={textInputClassName}
                  />
                  <FieldError>{nextErrors.institution}</FieldError>
                </div>

                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Degree or program</FieldLabel>
                  <Input
                    type="text"
                    value={entry.degree}
                    onChange={(event) => updateEducationField(entry.clientId, "degree", event.target.value)}
                    aria-invalid={Boolean(nextErrors.degree)}
                    placeholder="e.g. B.S. in Computer Science"
                    className={textInputClassName}
                  />
                  <FieldError>{nextErrors.degree}</FieldError>
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
                <FieldLabel className={fieldLabelClassName}>Details</FieldLabel>
                <Textarea
                  value={entry.details}
                  onChange={(event) => updateEducationField(entry.clientId, "details", event.target.value)}
                  placeholder="Add honors, coursework, thesis notes, or certification details if they help."
                  className={textAreaClassName}
                />
              </div>
            </ItemCard>
          )
        }}
      />

      <SectionAddButton label="Add education" onClick={addEducation} />
    </CareerSectionCard>
  )
}
