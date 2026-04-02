"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isBlankEducation } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

const labelClassName =
  "text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase"
const inputClassName =
  "h-12 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"
const textareaClassName =
  "min-h-28 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 py-3 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"

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
  const summary = activeCount ? `${activeCount} education entr${activeCount === 1 ? "y" : "ies"}` : "Add schools, courses, or certifications"

  return (
    <CareerSectionCard
      id="career-section-education"
      step="Step 05"
      title="Education"
      description="Keep formal education, certifications, and supporting details together."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("education")}
    >
      <DynamicList
        items={education}
        getKey={(entry) => entry.clientId}
        className="space-y-4"
        emptyState={
          <p className="text-sm font-medium text-on-surface-variant/70">
            No education entries yet. Add a degree, certification, or bootcamp when it helps your story.
          </p>
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
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Institution</FieldLabel>
                  <Input
                    type="text"
                    value={entry.institution}
                    onChange={(event) => updateEducationField(entry.clientId, "institution", event.target.value)}
                    aria-invalid={Boolean(nextErrors.institution)}
                    placeholder="e.g. State University"
                    className={inputClassName}
                  />
                  <FieldError>{nextErrors.institution}</FieldError>
                </div>

                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Degree or program</FieldLabel>
                  <Input
                    type="text"
                    value={entry.degree}
                    onChange={(event) => updateEducationField(entry.clientId, "degree", event.target.value)}
                    aria-invalid={Boolean(nextErrors.degree)}
                    placeholder="e.g. B.S. in Computer Science"
                    className={inputClassName}
                  />
                  <FieldError>{nextErrors.degree}</FieldError>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Start date</FieldLabel>
                  <Input
                    type="month"
                    value={entry.start_date}
                    onChange={(event) => updateEducationField(entry.clientId, "start_date", event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>End date</FieldLabel>
                  <Input
                    type="month"
                    value={entry.end_date}
                    onChange={(event) => updateEducationField(entry.clientId, "end_date", event.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Details</FieldLabel>
                <Textarea
                  value={entry.details}
                  onChange={(event) => updateEducationField(entry.clientId, "details", event.target.value)}
                  placeholder="Add honors, relevant coursework, thesis notes, or certification details if they help."
                  className={textareaClassName}
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
