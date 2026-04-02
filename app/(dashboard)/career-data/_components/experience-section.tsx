"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isBlankExperience } from "@/lib/career-data/validation"
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
  const summary = activeCount ? `${activeCount} experience entr${activeCount === 1 ? "y" : "ies"}` : "Add your most relevant roles"

  return (
    <CareerSectionCard
      id="career-section-experience"
      step="Step 03"
      title="Experience"
      description="Capture each role with the impact, dates, and tags you will reuse later."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("experiences")}
    >
      <DynamicList
        items={experiences}
        getKey={(experience) => experience.clientId}
        className="space-y-4"
        emptyState={
          <p className="text-sm font-medium text-on-surface-variant/70">
            No experience entries yet. Add at least one role to power future resume variants.
          </p>
        }
        renderItem={(experience) => {
          const nextErrors = experienceErrors[experience.clientId] ?? {}

          return (
            <ItemCard
              title={experience.company || "New experience"}
              subtitle={experience.role || "Add the company, role, dates, and key achievements."}
              onRemove={() => void removeExperience(experience.clientId)}
              removeLabel={`Remove ${experience.company || "experience"}`}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Company</FieldLabel>
                  <Input
                    type="text"
                    value={experience.company}
                    onChange={(event) => updateExperienceField(experience.clientId, "company", event.target.value)}
                    aria-invalid={Boolean(nextErrors.company)}
                    placeholder="e.g. Acme Studio"
                    className={inputClassName}
                  />
                  <FieldError>{nextErrors.company}</FieldError>
                </div>

                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Role</FieldLabel>
                  <Input
                    type="text"
                    value={experience.role}
                    onChange={(event) => updateExperienceField(experience.clientId, "role", event.target.value)}
                    aria-invalid={Boolean(nextErrors.role)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className={inputClassName}
                  />
                  <FieldError>{nextErrors.role}</FieldError>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Start date</FieldLabel>
                  <Input
                    type="month"
                    value={experience.start_date}
                    onChange={(event) => updateExperienceField(experience.clientId, "start_date", event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>End date</FieldLabel>
                  <Input
                    type="month"
                    value={experience.end_date}
                    onChange={(event) => updateExperienceField(experience.clientId, "end_date", event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel className={labelClassName}>Location</FieldLabel>
                  <Input
                    type="text"
                    value={experience.location}
                    onChange={(event) => updateExperienceField(experience.clientId, "location", event.target.value)}
                    placeholder="e.g. Remote"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Achievements</FieldLabel>
                <Textarea
                  value={experience.bullets_text}
                  onChange={(event) => updateExperienceField(experience.clientId, "bullets_text", event.target.value)}
                  placeholder={"Write one achievement per line.\nExample: Led the redesign of the customer dashboard."}
                  className={textareaClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Tags</FieldLabel>
                <Input
                  type="text"
                  value={experience.tags_text}
                  onChange={(event) => updateExperienceField(experience.clientId, "tags_text", event.target.value)}
                  placeholder="e.g. react, performance, leadership"
                  className={inputClassName}
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
