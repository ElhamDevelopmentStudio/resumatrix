import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { profileHasActiveRules } from "@/lib/profiles/engine"
import type { ProfileData, ProfilePreview, ProfileViewMode } from "@/lib/profiles/types"
import { cn } from "@/lib/utils"

type ProfileCardProps = {
  profile: ProfileData
  preview: ProfilePreview
  view: ProfileViewMode
  isBusy?: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

function TagList({ label, tags, tone = "default" }: { label: string; tags: string[]; tone?: "default" | "destructive" }) {
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

function ConfigSummary({ profile }: { profile: ProfileData }) {
  const items = [
    profile.config.limits.experiences
      ? `Keep ${formatCount(profile.config.limits.experiences, "experience")}`
      : null,
    profile.config.limits.projects
      ? `Keep ${formatCount(profile.config.limits.projects, "project")}`
      : null,
    profile.config.ordering.experiences !== "recent"
      ? "Experience: oldest first"
      : null,
    profile.config.ordering.projects !== "manual" ? "Projects: name A–Z" : null,
    profile.config.ordering.education !== "recent" ? "Education: oldest first" : null,
  ].filter((item): item is string => Boolean(item))

  if (!items.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="border-primary/20 bg-primary-soft text-primary">
          {item}
        </Badge>
      ))}
    </div>
  )
}

function ActionButtons({
  isBusy = false,
  onDelete,
  onDuplicate,
  onEdit,
}: Pick<ProfileCardProps, "isBusy" | "onDelete" | "onDuplicate" | "onEdit">) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onEdit} disabled={isBusy}>
        Edit
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDuplicate} disabled={isBusy}>
        Duplicate
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={isBusy}>
        Delete
      </Button>
    </div>
  )
}

function buildUpdatedLabel(updatedAt: string) {
  return `Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`
}

function CompactMetrics({ preview }: { preview: ProfilePreview }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant/75">
      <span>{formatCount(preview.displayedExperiences, "experience")}</span>
      <span>•</span>
      <span>{formatCount(preview.displayedProjects, "project")}</span>
      <span>•</span>
      <span>{formatCount(preview.skillsCount, "skill")}</span>
    </div>
  )
}

export function ProfileCard({
  profile,
  preview,
  view,
  isBusy = false,
  onEdit,
  onDuplicate,
  onDelete,
}: ProfileCardProps) {
  const isFiltered = profileHasActiveRules(profile)
  const updatedLabel = buildUpdatedLabel(profile.updated_at)
  const statusLabel = isFiltered ? "Filtered" : "Keep all"

  if (view === "list") {
    return (
      <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] xl:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-lg font-semibold text-on-surface">{profile.name}</h3>
              <Badge variant={isFiltered ? "default" : "outline"}>{statusLabel}</Badge>
              {preview.hasEmptyPrimaryResults ? (
                <Badge variant="destructive">No matches</Badge>
              ) : null}
            </div>
            <p className="text-sm text-on-surface-variant/75">{updatedLabel}</p>
            <CompactMetrics preview={preview} />
          </div>

          <div className="space-y-3">
            <TagList label="Include" tags={profile.include_tags.slice(0, 4)} />
            <TagList label="Exclude" tags={profile.exclude_tags.slice(0, 4)} tone="destructive" />
          </div>

          <ActionButtons isBusy={isBusy} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      </Card>
    )
  }

  if (view === "grid") {
    return (
      <Card className="h-full rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
        <div className="flex h-full flex-col gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-lg font-semibold text-on-surface">{profile.name}</h3>
              <Badge variant={isFiltered ? "default" : "outline"}>{statusLabel}</Badge>
            </div>
            <p className="text-sm text-on-surface-variant/75">{updatedLabel}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Experience" value={String(preview.displayedExperiences)} />
            <MetricTile label="Projects" value={String(preview.displayedProjects)} />
          </div>

          <ConfigSummary profile={profile} />
          <TagList label="Include tags" tags={profile.include_tags.slice(0, 3)} />
          <TagList label="Exclude tags" tags={profile.exclude_tags.slice(0, 3)} tone="destructive" />

          <div className="mt-auto">
            <ActionButtons isBusy={isBusy} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-xl font-semibold text-on-surface">{profile.name}</h3>
              <Badge variant={isFiltered ? "default" : "outline"}>{statusLabel}</Badge>
              {preview.hasEmptyPrimaryResults ? (
                <Badge variant="destructive">No primary matches</Badge>
              ) : null}
            </div>
            <p className="text-sm text-on-surface-variant/75">{updatedLabel}</p>
          </div>

          <ActionButtons isBusy={isBusy} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <MetricTile
            label="Experience"
            value={String(preview.displayedExperiences)}
            helper={`${preview.matchedExperiences} matched`}
          />
          <MetricTile
            label="Projects"
            value={String(preview.displayedProjects)}
            helper={`${preview.matchedProjects} matched`}
          />
          <MetricTile label="Skills" value={String(preview.skillsCount)} />
          <MetricTile label="Total items" value={String(preview.totalDisplayedItems)} />
        </div>

        <ConfigSummary profile={profile} />

        <div className="grid gap-4 lg:grid-cols-2">
          <TagList label="Include tags" tags={profile.include_tags} />
          <TagList label="Exclude tags" tags={profile.exclude_tags} tone="destructive" />
        </div>
      </div>
    </Card>
  )
}
