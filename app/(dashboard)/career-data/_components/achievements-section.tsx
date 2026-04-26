"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { isBlankAchievement } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { emptyStateClassName } from "./career-form-styles"
import { AchievementsItem } from "./achievements-item"
import { CareerSectionCard } from "./career-section-card"
import { SectionAddButton } from "./section-add-button"

export function AchievementsSection() {
  const achievements = useCareerDataStore((state) => state.achievements)
  const achievementErrors = useCareerDataStore((state) => state.achievementErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.achievements)
  const addAchievement = useCareerDataStore((state) => state.addAchievement)
  const updateAchievementField = useCareerDataStore((state) => state.updateAchievementField)
  const removeAchievement = useCareerDataStore((state) => state.removeAchievement)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("achievements")
  const activeCount = achievements.filter((achievement) => !isBlankAchievement(achievement)).length
  const summary = activeCount ? `${activeCount} ${activeCount === 1 ? "entry" : "entries"}` : "No entries yet"

  return (
    <CareerSectionCard
      id="career-section-achievements"
      step="06"
      title="Achievements"
      description="Awards, placements, recognitions, and optional proof links."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("achievements")}
    >
      <DynamicList
        items={achievements}
        getKey={(achievement) => achievement.clientId}
        className="space-y-3"
        emptyState={
          <div className={emptyStateClassName}>
            Add awards, rankings, certifications, or competitive programming results you may want on a CV.
          </div>
        }
        renderItem={(achievement) => (
          <AchievementsItem
            achievement={achievement}
            errors={achievementErrors[achievement.clientId] ?? {}}
            updateAchievementField={updateAchievementField}
            removeAchievement={removeAchievement}
          />
        )}
      />

      <SectionAddButton label="Add achievement" onClick={addAchievement} />
    </CareerSectionCard>
  )
}
