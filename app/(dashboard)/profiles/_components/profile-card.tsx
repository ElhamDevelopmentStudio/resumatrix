import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  buildProfileCoverageSummary,
  buildProfileRuleSummary,
  formatProfileCount,
  getProfileScopeLabel,
  getProfileStatus,
} from "@/lib/profiles/presentation"
import type { ProfileData, ProfilePreview } from "@/lib/profiles/types"
import { cn } from "@/lib/utils"

import { ProfileActions } from "./profile-actions"

type ProfileCardProps = {
  profile: ProfileData
  preview: ProfilePreview
  view: "cards" | "grid"
  isBusy?: boolean
  onDuplicate: () => void
  onDelete: () => void
}

function TagList({
  label,
  tags,
  tone = "default",
}: {
  label: string
  tags: string[]
  tone?: "default" | "destructive"
}) {
  if (!tags.length) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-on-surface-variant/70">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={`${label}-${tag}`}
            variant="outline"
            className={cn(
              "border-outline-variant/70 bg-surface-subtle text-on-surface-variant",
              tone === "destructive" ? "border-destructive/30 bg-destructive/5 text-destructive" : undefined
            )}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function MetricTile({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-3">
      <p className="text-xs font-medium text-on-surface-variant/70">{label}</p>
      <p className="mt-1 text-lg font-semibold text-on-surface">{value}</p>
      {helper ? <p className="mt-1 text-xs text-on-surface-variant/70">{helper}</p> : null}
    </div>
  )
}

export function ProfileCard({
  profile,
  preview,
  view,
  isBusy = false,
  onDuplicate,
  onDelete,
}: ProfileCardProps) {
  const status = getProfileStatus(preview)
  const rules = buildProfileRuleSummary(profile)
  const updatedLabel = `Updated ${formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}`
  const coverageSummary = buildProfileCoverageSummary(preview)

  if (view === "grid") {
    return (
      <Card className="h-full rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
        <div className="flex h-full flex-col gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-lg font-semibold text-on-surface">{profile.name}</h3>
              <Badge variant={status.tone === "destructive" ? "destructive" : "default"}>{status.label}</Badge>
              <Badge variant="outline">{getProfileScopeLabel(profile)}</Badge>
            </div>
            <p className="text-sm text-on-surface-variant/75">{coverageSummary}</p>
            <p className="text-xs text-on-surface-variant/65">{updatedLabel}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Experience" value={String(preview.displayedExperiences)} />
            <MetricTile label="Projects" value={String(preview.displayedProjects)} />
          </div>

          {rules.length ? (
            <div className="flex flex-wrap gap-2">
              {rules.slice(0, 3).map((rule) => (
                <Badge key={rule} variant="outline" className="border-outline-variant/70 bg-surface-subtle text-on-surface-variant">
                  {rule}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant/75">No custom rules yet. This profile currently keeps everything.</p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="space-y-2">
              <TagList label="Include tags" tags={profile.include_tags.slice(0, 3)} />
              <TagList label="Exclude tags" tags={profile.exclude_tags.slice(0, 3)} tone="destructive" />
            </div>
            <ProfileActions
              editHref={`/profiles/${profile.id}`}
              isBusy={isBusy}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-xl font-semibold text-on-surface">{profile.name}</h3>
              <Badge variant={status.tone === "destructive" ? "destructive" : "default"}>{status.label}</Badge>
              <Badge variant="outline">{getProfileScopeLabel(profile)}</Badge>
            </div>
            <p className="text-sm text-on-surface-variant/75">{status.helper}</p>
            <p className="text-xs text-on-surface-variant/65">{updatedLabel}</p>
          </div>

          <ProfileActions
            editHref={`/profiles/${profile.id}`}
            isBusy={isBusy}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <MetricTile
            label="Experience"
            value={String(preview.displayedExperiences)}
            helper={`${preview.matchedExperiences} matched before limits`}
          />
          <MetricTile
            label="Projects"
            value={String(preview.displayedProjects)}
            helper={`${preview.matchedProjects} matched before limits`}
          />
          <MetricTile label="Skills" value={String(preview.skillsCount)} />
          <MetricTile label="Total visible" value={String(preview.totalDisplayedItems)} />
        </div>

        <div className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4">
          <p className="text-xs font-medium text-on-surface-variant/70">Coverage summary</p>
          <p className="mt-2 text-sm text-on-surface">{coverageSummary}</p>
          <p className="mt-1 text-xs text-on-surface-variant/70">
            Keeps {formatProfileCount(preview.totalDisplayedItems, "item")} across the current profile output.
          </p>
        </div>

        {rules.length ? (
          <div className="flex flex-wrap gap-2">
            {rules.map((rule) => (
              <Badge key={rule} variant="outline" className="border-primary/20 bg-primary-soft text-primary">
                {rule}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant/75">No include tags, exclude tags, or custom limits yet. This profile is a clean base version.</p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <TagList label="Include tags" tags={profile.include_tags} />
          <TagList label="Exclude tags" tags={profile.exclude_tags} tone="destructive" />
        </div>
      </div>
    </Card>
  )
}
