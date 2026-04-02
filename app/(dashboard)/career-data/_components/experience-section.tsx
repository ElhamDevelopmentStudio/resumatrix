"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isBlankExperience } from "@/lib/career-data/validation"
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
        renderItem={(experience) => {
          const nextErrors = experienceErrors[experience.clientId] ?? {}

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
                    aria-invalid={Boolean(nextErrors.company)}
                    placeholder="e.g. Acme Studio"
                    className={textInputClassName}
                  />
                  <FieldError>{nextErrors.company}</FieldError>
                </div>

                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Role</FieldLabel>
                  <Input
                    type="text"
                    value={experience.role}
                    onChange={(event) => updateExperienceField(experience.clientId, "role", event.target.value)}
                    aria-invalid={Boolean(nextErrors.role)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className={textInputClassName}
                  />
                  <FieldError>{nextErrors.role}</FieldError>
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
                <FieldLabel className={fieldLabelClassName}>Achievements</FieldLabel>
                <Textarea
                  value={experience.bullets_text}
                  onChange={(event) => updateExperienceField(experience.clientId, "bullets_text", event.target.value)}
                  placeholder={"Write one achievement per line.\nExample: Led the redesign of the customer dashboard."}
                  className={textAreaClassName}
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
        }}
      />

      <SectionAddButton label="Add experience" onClick={addExperience} />
    </CareerSectionCard>
  )
}
