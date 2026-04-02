"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { skillCategoryOptions, skillLevelOptions } from "@/lib/career-data/types"
import { isBlankSkill } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
  fieldLabelClassName,
  selectClassName,
  textInputClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

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
  const summary = activeCount ? `${activeCount} ${activeCount === 1 ? "entry" : "entries"}` : "No entries yet"

  return (
    <CareerSectionCard
      id="career-section-skills"
      step="06"
      title="Skills"
      description="Skills, categories, and optional levels for later filtering."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("skills")}
    >
      <DynamicList
        items={skills}
        getKey={(skill) => skill.clientId}
        className="space-y-3"
        emptyState={
          <div className={emptyStateClassName}>
            Add the tools, technologies, and capabilities you may want to highlight later.
          </div>
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Skill</FieldLabel>
                  <Input
                    type="text"
                    value={skill.name}
                    onChange={(event) => updateSkillField(skill.clientId, "name", event.target.value)}
                    aria-invalid={Boolean(nextErrors.name)}
                    placeholder="e.g. React"
                    className={textInputClassName}
                  />
                  <FieldError>{nextErrors.name}</FieldError>
                </div>

                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Category</FieldLabel>
                  <NativeSelect
                    value={skill.category}
                    onChange={(event) => updateSkillField(skill.clientId, "category", event.target.value)}
                    aria-invalid={Boolean(nextErrors.category)}
                    className={selectClassName}
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

                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Level</FieldLabel>
                  <NativeSelect
                    value={skill.level}
                    onChange={(event) => updateSkillField(skill.clientId, "level", event.target.value)}
                    className={selectClassName}
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
