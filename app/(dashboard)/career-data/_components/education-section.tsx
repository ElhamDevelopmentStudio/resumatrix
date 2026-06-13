"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { isBlankEducation } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { EducationItem } from "./education-item"
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
        renderItem={(entry) => (
          <EducationItem
            entry={entry}
            errors={educationErrors[entry.clientId] ?? {}}
            updateEducationField={updateEducationField}
            removeEducation={removeEducation}
          />
        )}
      />

      <SectionAddButton label="Add education" onClick={addEducation} />
    </CareerSectionCard>
  )
}