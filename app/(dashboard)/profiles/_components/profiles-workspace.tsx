"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircleIcon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { buttonVariants, Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { createProfile, deleteProfile } from "@/lib/profiles/api"
import { buildProfilePreview, getWorkspaceTagSuggestions } from "@/lib/profiles/engine"
import type {
  ProfileData,
  ProfileListFilter,
  ProfileSortKey,
  ProfileViewMode,
  ProfileWorkspaceProps,
} from "@/lib/profiles/types"
import { cn } from "@/lib/utils"

import { ProfileCard } from "./profile-card"
import { ProfilesListTable } from "./profiles-list-table"
import { ProfilesToolbar } from "./profiles-toolbar"

type MutationState = {
  profileId: string | null
  action: "duplicate" | "delete" | null
}

function matchesSearch(profile: ProfileData, query: string) {
  if (!query.trim()) {
    return true
  }

  const normalizedQuery = query.trim().toLowerCase()
  const haystack = [profile.name, ...profile.include_tags, ...profile.exclude_tags].join(" ").toLowerCase()

  return haystack.includes(normalizedQuery)
}

export function ProfilesWorkspace({ careerData, initialProfiles }: ProfileWorkspaceProps) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<ProfileListFilter>("all")
  const [sort, setSort] = useState<ProfileSortKey>("updated-desc")
  const [view, setView] = useState<ProfileViewMode>("cards")
  const [deleteTarget, setDeleteTarget] = useState<ProfileData | null>(null)
  const [mutationState, setMutationState] = useState<MutationState>({
    profileId: null,
    action: null,
  })
  const [pageError, setPageError] = useState<string | null>(null)

  const tagSuggestions = useMemo(() => getWorkspaceTagSuggestions(careerData), [careerData])
  const previewMap = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, buildProfilePreview(profile, careerData)])),
    [careerData, profiles]
  )

  const filteredProfiles = useMemo(() => {
    const searchedProfiles = profiles.filter((profile) => matchesSearch(profile, query))

    const visibleProfiles = searchedProfiles.filter((profile) => {
      const preview = previewMap.get(profile.id)

      switch (filter) {
        case "ready":
          return preview ? !preview.hasEmptyPrimaryResults : false
        case "needs-attention":
          return Boolean(preview?.hasEmptyPrimaryResults)
        case "include-tags":
          return profile.include_tags.length > 0
        case "exclude-tags":
          return profile.exclude_tags.length > 0
        default:
          return true
      }
    })

    return visibleProfiles.sort((left, right) => {
      if (sort === "name-asc") {
        return left.name.localeCompare(right.name)
      }

      if (sort === "name-desc") {
        return right.name.localeCompare(left.name)
      }

      if (sort === "updated-asc") {
        return left.updated_at.localeCompare(right.updated_at)
      }

      if (sort === "coverage-desc") {
        const leftScore = previewMap.get(left.id)?.primaryMatchCount ?? 0
        const rightScore = previewMap.get(right.id)?.primaryMatchCount ?? 0

        if (rightScore !== leftScore) {
          return rightScore - leftScore
        }
      }

      return right.updated_at.localeCompare(left.updated_at)
    })
  }, [filter, previewMap, profiles, query, sort])

  const needsAttentionCount = profiles.filter((profile) => previewMap.get(profile.id)?.hasEmptyPrimaryResults).length
  const readyCount = profiles.length - needsAttentionCount
  const filterCounts: Record<ProfileListFilter, number> = {
    all: profiles.length,
    ready: readyCount,
    "needs-attention": needsAttentionCount,
    "include-tags": profiles.filter((profile) => profile.include_tags.length > 0).length,
    "exclude-tags": profiles.filter((profile) => profile.exclude_tags.length > 0).length,
  }

  const handleDuplicate = async (profile: ProfileData) => {
    setMutationState({ profileId: profile.id, action: "duplicate" })
    setPageError(null)

    try {
      const duplicatedProfile = await createProfile({
        name: `${profile.name} Copy`,
        include_tags: profile.include_tags,
        exclude_tags: profile.exclude_tags,
        config: profile.config,
      })
      setProfiles((currentProfiles) => [duplicatedProfile, ...currentProfiles])
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "We couldn’t duplicate that profile.")
    } finally {
      setMutationState({ profileId: null, action: null })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setMutationState({ profileId: deleteTarget.id, action: "delete" })
    setPageError(null)

    try {
      await deleteProfile(deleteTarget.id)
      setProfiles((currentProfiles) => currentProfiles.filter((profile) => profile.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "We couldn’t delete that profile.")
    } finally {
      setMutationState({ profileId: null, action: null })
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8 xl:px-12">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm md:p-8">
          <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
            Profiles
          </Badge>

          <div className="mt-4 space-y-3">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              Build role-specific resume versions without duplicating your data
            </h1>
            <p className="max-w-3xl text-sm text-on-surface-variant/75 md:text-base">
              Create focused profiles for different roles, keep the content that matters, and flag any profile that no longer matches your saved experience or projects.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/profiles/new" className={cn(buttonVariants({ variant: "default", size: "default" }), "px-4")}>
              Create profile
            </Link>
            <Link href="/career-data" className={cn(buttonVariants({ variant: "outline", size: "default" }), "px-4")}>
              Open career data
            </Link>
          </div>
        </div>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-headline text-lg font-semibold text-on-surface">How profiles work</h2>
              <p className="text-sm text-on-surface-variant/75">
                Profiles never copy your data. They only decide what to keep, remove, or reorder.
              </p>
            </div>

            <div className="space-y-3">
              {[
                ["1", "Start with a clear role", "Name the profile after the role you’re targeting."],
                ["2", "Use tags to focus it", "Include the work you want to highlight and exclude what feels off-target."],
                ["3", "Check the preview", "If a profile needs attention, its rules no longer match your saved content."],
              ].map(([step, title, description]) => (
                <div key={step} className="flex gap-3 rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-xs font-semibold text-primary">
                    {step}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-on-surface">{title}</p>
                    <p className="text-xs text-on-surface-variant/75">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-on-surface-variant/70">
              Available tag suggestions: {tagSuggestions.length}. Tags come from your experience and project entries.
            </p>
          </div>
        </Card>
      </section>

      {tagSuggestions.length === 0 ? (
        <Alert className="mt-6 border-outline-variant/60 bg-surface-subtle/50">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 text-primary" />
          <AlertTitle>No saved tags yet</AlertTitle>
          <AlertDescription>
            You can still create a general profile now, but tags become much more useful after you add them to your experience and project entries in Career Data.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-on-surface-variant/70">Total profiles</p>
          <p className="mt-2 text-3xl font-semibold text-on-surface">{profiles.length}</p>
          <p className="mt-2 text-sm text-on-surface-variant/75">All saved profile variants in your workspace.</p>
        </Card>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-on-surface-variant/70">Ready to use</p>
          <p className="mt-2 text-3xl font-semibold text-on-surface">{readyCount}</p>
          <p className="mt-2 text-sm text-on-surface-variant/75">Profiles that currently match at least one experience or project entry.</p>
        </Card>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-on-surface-variant/70">Needs attention</p>
          <p className="mt-2 text-3xl font-semibold text-on-surface">{needsAttentionCount}</p>
          <p className="mt-2 text-sm text-on-surface-variant/75">Profiles whose current rules no longer match your primary content.</p>
        </Card>
      </section>

      {pageError ? (
        <Alert variant="destructive" className="mt-6 border-destructive/20 bg-destructive/5">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-6 space-y-6">
        <ProfilesToolbar
          query={query}
          filter={filter}
          sort={sort}
          view={view}
          totalCount={profiles.length}
          visibleCount={filteredProfiles.length}
          filterCounts={filterCounts}
          createHref="/profiles/new"
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onViewChange={setView}
          onClear={() => {
            setQuery("")
            setFilter("all")
            setSort("updated-desc")
          }}
        />

        {filteredProfiles.length ? (
          view === "list" ? (
            <ProfilesListTable
              profiles={filteredProfiles}
              previewMap={previewMap}
              busyProfileId={mutationState.profileId}
              onDuplicate={(profile) => void handleDuplicate(profile)}
              onDelete={setDeleteTarget}
            />
          ) : (
            <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4 xl:grid-cols-2"}>
              {filteredProfiles.map((profile) => {
                const preview = previewMap.get(profile.id)

                if (!preview) {
                  return null
                }

                return (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    preview={preview}
                    view={view === "grid" ? "grid" : "cards"}
                    isBusy={mutationState.profileId === profile.id}
                    onDuplicate={() => void handleDuplicate(profile)}
                    onDelete={() => setDeleteTarget(profile)}
                  />
                )
              })}
            </div>
          )
        ) : profiles.length ? (
          <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-8 text-on-surface-variant/40" />
            <EmptyHeader>
              <EmptyTitle>No profiles match your current filters</EmptyTitle>
              <EmptyDescription>
                Try a different search term, switch filters, or clear everything to get back to the full list.
              </EmptyDescription>
            </EmptyHeader>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setFilter("all")
                  setSort("updated-desc")
                }}
              >
                Clear filters
              </Button>
            </div>
          </Empty>
        ) : (
          <div className="space-y-6 rounded-sm border border-dashed border-outline-variant/70 bg-card p-6 md:p-8">
            <Empty className="border-0 bg-transparent py-0 shadow-none">
              <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-8 text-on-surface-variant/40" />
              <EmptyHeader>
                <EmptyTitle>No profiles yet</EmptyTitle>
                <EmptyDescription>
                  Start with one role-focused profile, then reuse it as a clean base for future resume versions.
                </EmptyDescription>
              </EmptyHeader>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/profiles/new" className={cn(buttonVariants({ variant: "default", size: "default" }), "px-4")}>
                  Create your first profile
                </Link>
                <Link href="/career-data" className={cn(buttonVariants({ variant: "outline", size: "default" }), "px-4")}>
                  Review career data
                </Link>
              </div>
            </Empty>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["Pick a target role", "Use a name that matches the job you want this resume to support."],
                ["Choose the right tags", "Include the work you want to emphasize and exclude anything distracting."],
                ["Check the live coverage", "Make sure the profile still matches real experience and project entries."],
              ].map(([title, description], index) => (
                <Card key={title} className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
                  <p className="text-xs font-medium text-primary">Step {index + 1}</p>
                  <p className="mt-2 text-sm font-medium text-on-surface">{title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant/75">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete profile?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently delete ${deleteTarget.name}. This can’t be undone.`
                : "This profile will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutationState.action === "delete"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={mutationState.action === "delete"}
              className="gap-2"
            >
              {mutationState.action === "delete" ? <Spinner className="size-4" /> : null}
              Delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
