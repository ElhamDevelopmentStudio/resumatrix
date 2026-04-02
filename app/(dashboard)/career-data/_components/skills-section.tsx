"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { skillCategoryOptions, skillLevelOptions } from "@/lib/career-data/types"
import { isBlankSkill } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

const labelClassName =
  "text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase"
const inputClassName =
  "h-12 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"

export function SkillsSection() {
  const skills = useCareerDataStore((state) => state.skills)
  const skillErrors = useCareerDataStore((state) => state.skillErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.skills)
  const addSkill = useCareerDataStore((state) => state.addSkill)
  const updateSkillField = useCareerDataStore((state) => state.updateSkillField)
  const removeSkill = useCareerDataStore((state) => state.removeSkill)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("skills")
  const activeCount = skills.filter((skill) => !isBlankSkill(skill)).length
  const summary = activeCount ? `${activeCount} skill${activeCount === 1 ? "" : "s"}` : "Add the skills you want to surface"

  return (
    <CareerSectionCard
      id="career-section-skills"
      step="Step 06"
      title="Skills"
      description="Organize your skills so future profiles can highlight the right ones faster."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("skills")}
    >
      <DynamicList
        items={skills}
        getKey={(skill) => skill.clientId}
        className="space-y-4"
        emptyState={
          <p className="text-sm font-medium text-on-surface-variant/70">
            No skills yet. Add the tools, technologies, and capabilities you want to reuse.
          </p>
        }
        renderItem={(skill) => {
          const nextErrors = skillErrors[skill.clientId] ?? {}

          return (
            <ItemCard
              title={skill.name || "New skill"}
              subtitle={skill.category || "Choose a category and optional level."}
              onRemove={() => void removeSkill(skill.clientId)}
              removeLabel={`Remove ${skill.name || "skill"}`}
            >
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <FieldLabel className={labelClassName}>Skill</FieldLabel>
                  <Input
                    type="text"
                    value={skill.name}
                    onChange={(event) => updateSkillField(skill.clientId, "name", event.target.value)}
                    aria-invalid={Boolean(nextErrors.name)}
                    placeholder="e.g. React"
                    className={inputClassName}
                  />
                  <FieldError>{nextErrors.name}</FieldError>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <FieldLabel className={labelClassName}>Category</FieldLabel>
                  <NativeSelect
                    value={skill.category}
                    onChange={(event) => updateSkillField(skill.clientId, "category", event.target.value)}
                    aria-invalid={Boolean(nextErrors.category)}
                    className="w-full"
                  >
                    <NativeSelectOption value="">Select category</NativeSelectOption>
                    {skillCategoryOptions.map((option) => (
                      <NativeSelectOption key={option} value={option}>
                        {option}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError>{nextErrors.category}</FieldError>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <FieldLabel className={labelClassName}>Level</FieldLabel>
                  <NativeSelect
                    value={skill.level}
                    onChange={(event) => updateSkillField(skill.clientId, "level", event.target.value)}
                    className="w-full"
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
        }}
      />

      <SectionAddButton label="Add skill" onClick={addSkill} />
    </CareerSectionCard>
  )
}
