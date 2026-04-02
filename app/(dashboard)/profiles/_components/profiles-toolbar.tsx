"use client"

import Link from "next/link"

import { buttonVariants, Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ProfileListFilter, ProfileSortKey, ProfileViewMode } from "@/lib/profiles/types"
import { cn } from "@/lib/utils"

type ProfilesToolbarProps = {
  query: string
  filter: ProfileListFilter
  sort: ProfileSortKey
  view: ProfileViewMode
  totalCount: number
  visibleCount: number
  filterCounts: Record<ProfileListFilter, number>
  createHref: string
  onQueryChange: (value: string) => void
  onFilterChange: (value: ProfileListFilter) => void
  onSortChange: (value: ProfileSortKey) => void
  onViewChange: (value: ProfileViewMode) => void
  onClear: () => void
}

const filterOptions: Array<{ label: string; value: ProfileListFilter }> = [
  { label: "All profiles", value: "all" },
  { label: "Ready", value: "ready" },
  { label: "Needs attention", value: "needs-attention" },
  { label: "Include tags", value: "include-tags" },
  { label: "Exclude tags", value: "exclude-tags" },
]

const sortOptions: Array<{ label: string; value: ProfileSortKey }> = [
  { label: "Recently updated", value: "updated-desc" },
  { label: "Oldest updated", value: "updated-asc" },
  { label: "Name A–Z", value: "name-asc" },
  { label: "Name Z–A", value: "name-desc" },
  { label: "Most coverage", value: "coverage-desc" },
]

export function ProfilesToolbar({
  query,
  filter,
  sort,
  view,
  totalCount,
  visibleCount,
  filterCounts,
  createHref,
  onQueryChange,
  onFilterChange,
  onSortChange,
  onViewChange,
  onClear,
}: ProfilesToolbarProps) {
  const hasActiveFilters = query.trim().length > 0 || filter !== "all" || sort !== "updated-desc"

  return (
    <div className="space-y-4 rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="space-y-2">
            <label htmlFor="profile-search" className="text-sm font-medium text-on-surface">
              Search profiles
            </label>
            <Input
              id="profile-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by profile name or tag"
              className="h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20 md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-sort" className="text-sm font-medium text-on-surface">
              Sort by
            </label>
            <NativeSelect
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ProfileSortKey)}
              className="w-full [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:rounded-sm [&_[data-slot=native-select]]:border-outline-variant/70 [&_[data-slot=native-select]]:bg-background [&_[data-slot=native-select]]:px-3 [&_[data-slot=native-select]]:pr-8 [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:text-on-surface [&_[data-slot=native-select]]:focus-visible:border-primary [&_[data-slot=native-select]]:focus-visible:ring-primary/20 [&_[data-slot=native-select-icon]]:right-3 [&_[data-slot=native-select-icon]]:size-4 [&_[data-slot=native-select-icon]]:text-on-surface-variant/60"
            >
              {sortOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasActiveFilters ? (
            <Button type="button" variant="outline" onClick={onClear}>
              Clear filters
            </Button>
          ) : null}
          <Link href={createHref} className={cn(buttonVariants({ variant: "default", size: "default" }), "px-4")}>
            Create profile
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-outline-variant/60 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={cn(
                "rounded-sm border px-3 py-2 text-sm font-medium transition-colors",
                filter === option.value
                  ? "border-primary/30 bg-primary-soft text-primary"
                  : "border-outline-variant/60 bg-background text-on-surface-variant hover:border-primary/20 hover:bg-surface-subtle hover:text-on-surface"
              )}
            >
              {option.label} <span className="text-current/70">({filterCounts[option.value]})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-on-surface-variant/75">
            Showing {visibleCount} of {totalCount} profiles
          </p>

          <ToggleGroup
            value={[view]}
            onValueChange={(value) => {
              const nextView = value[0]

              if (nextView) {
                onViewChange(nextView as ProfileViewMode)
              }
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Profile view"
          >
            <ToggleGroupItem value="cards">Cards</ToggleGroupItem>
            <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}
