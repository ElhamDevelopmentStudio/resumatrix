"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { isBlankExperience } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { ExperienceItem } from "./experience-item"
import { SectionAddButton } from "./section-add-button"

export function ExperienceSection() {
  const experiences = useCareerDataStore((state) => state.experiences)
  const experienceErrors = useCareerDataStore((state) => state.experienceErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.experiences)
  const addExperience = useCareerDataStore((state) => state.addExperience)
  const updateExperienceField = useCareerDataStore((state) => state.updateExperienceField)
  const removeExperience = useCareerDataStore((state) => state.removeExperience)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("experiences")
  const activeCount = experiences.filter((experience) => !isBlankExperience(experience)).length
  const summary = activeCount ? `${activeCount} ${activeCount === 1 ? "entry" : "entries"}` : "No entries yet"

  return (
    <CareerSectionCard
      id="career-section-experience"
      step="03"
      title="Experience"
      description="Roles, dates, achievements, and reusable tags."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("experiences")}
    >
      <DynamicList
        items={experiences}
        getKey={(experience) => experience.clientId}
        className="space-y-3"
        emptyState={
          <div className={emptyStateClassName}>
            Add at least one role so your later resume versions have real work history to build from.
          </div>
        }
        renderItem={(experience) => (
          <ExperienceItem
            experience={experience}
            errors={experienceErrors[experience.clientId] ?? {}}
            updateExperienceField={updateExperienceField}
            removeExperience={removeExperience}
          />
        )}
      />

      <SectionAddButton label="Add experience" onClick={addExperience} />
    </CareerSectionCard>
  )
}