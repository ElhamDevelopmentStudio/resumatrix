"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { isBlankSkill } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { SkillsItem } from "./skills-item"
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
      step="07"
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
        renderItem={(skill) => (
          <SkillsItem
            skill={skill}
            errors={skillErrors[skill.clientId] ?? {}}
            updateSkillField={updateSkillField}
            removeSkill={removeSkill}
          />
        )}
      />

      <SectionAddButton label="Add skill" onClick={addSkill} />
    </CareerSectionCard>
  )
}
