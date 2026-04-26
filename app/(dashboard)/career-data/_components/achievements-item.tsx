"use client"

import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AchievementDraft } from "@/lib/career-data/drafts"
import type { AchievementErrorState } from "@/lib/career-data/validation"

import { fieldLabelClassName, textAreaClassName, textInputClassName } from "./career-form-styles"
import { ItemCard } from "./item-card"

type AchievementsItemProps = {
  achievement: AchievementDraft
  errors: AchievementErrorState
  updateAchievementField: (
    clientId: string,
    field: keyof AchievementDraft,
    value: string
  ) => void
  removeAchievement: (clientId: string) => Promise<void>
}

export function AchievementsItem({
  achievement,
  errors,
  updateAchievementField,
  removeAchievement,
}: AchievementsItemProps) {
  return (
    <ItemCard
      title={achievement.title || "New achievement"}
      subtitle={achievement.description || "Add a title, description, and optional link."}
      onRemove={() => void removeAchievement(achievement.clientId)}
      removeLabel={`Remove ${achievement.title || "achievement"}`}
    >
      <div className="space-y-2">
        <FieldLabel className={fieldLabelClassName}>Title</FieldLabel>
        <Input
          type="text"
          value={achievement.title}
          onChange={(event) =>
            updateAchievementField(achievement.clientId, "title", event.target.value)
          }
          aria-invalid={Boolean(errors.title)}
          placeholder="e.g. ICPC World Finalist"
          className={textInputClassName}
        />
        <FieldError>{errors.title}</FieldError>
      </div>

      <div className="space-y-2">
        <FieldLabel className={fieldLabelClassName}>Description</FieldLabel>
        <Textarea
          value={achievement.description}
          onChange={(event) =>
            updateAchievementField(achievement.clientId, "description", event.target.value)
          }
          placeholder="e.g. Qualified among the top global competitive programming teams in Baku, Azerbaijan."
          className={textAreaClassName}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)]">
        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Link</FieldLabel>
          <Input
            type="url"
            value={achievement.link_url}
            onChange={(event) =>
              updateAchievementField(achievement.clientId, "link_url", event.target.value)
            }
            placeholder="https://example.com"
            className={textInputClassName}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel className={fieldLabelClassName}>Link label</FieldLabel>
          <Input
            type="text"
            value={achievement.link_label}
            onChange={(event) =>
              updateAchievementField(achievement.clientId, "link_label", event.target.value)
            }
            placeholder="Contest page"
            className={textInputClassName}
          />
        </div>
      </div>
    </ItemCard>
  )
}
