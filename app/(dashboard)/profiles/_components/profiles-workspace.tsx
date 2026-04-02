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
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { createProfile, deleteProfile, updateProfile } from "@/lib/profiles/api"
import {
  buildProfilePreview,
  getWorkspaceTagSuggestions,
  profileHasActiveRules,
} from "@/lib/profiles/engine"
import type {
  ProfileData,
  ProfileListFilter,
  ProfileSortKey,
  ProfileViewMode,
  ProfileWorkspaceProps,
  ProfilePayload,
} from "@/lib/profiles/types"

import { ProfileCard } from "./profile-card"
import { ProfileFormDialog } from "./profile-form-dialog"
import { ProfilesToolbar } from "./profiles-toolbar"

type DialogMode = "create" | "edit"

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("create")
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProfileData | null>(null)
  const [isDialogSubmitting, setIsDialogSubmitting] = useState(false)
  const [mutationState, setMutationState] = useState<MutationState>({
    profileId: null,
    action: null,
  })
  const [pageError, setPageError] = useState<string | null>(null)

  const tagSuggestions = useMemo(() => getWorkspaceTagSuggestions(careerData), [careerData])
  const previewMap = useMemo(
    () =>
      new Map(profiles.map((profile) => [profile.id, buildProfilePreview(profile, careerData)])),
    [careerData, profiles]
  )

  const filteredProfiles = useMemo(() => {
    const nextProfiles = profiles.filter((profile) => matchesSearch(profile, query))

    const visibleProfiles = nextProfiles.filter((profile) => {
      const preview = previewMap.get(profile.id)

      switch (filter) {
        case "with-rules":
          return profileHasActiveRules(profile)
        case "include-tags":
          return profile.include_tags.length > 0
        case "exclude-tags":
          return profile.exclude_tags.length > 0
        case "empty-results":
          return Boolean(preview?.hasEmptyPrimaryResults)
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

  const profilesWithRules = profiles.filter((profile) => profileHasActiveRules(profile)).length
  const emptyProfiles = profiles.filter((profile) => previewMap.get(profile.id)?.hasEmptyPrimaryResults).length

  const openCreateDialog = () => {
    setDialogMode("create")
    setSelectedProfile(null)
    setDialogOpen(true)
    setPageError(null)
  }

  const openEditDialog = (profile: ProfileData) => {
    setDialogMode("edit")
    setSelectedProfile(profile)
    setDialogOpen(true)
    setPageError(null)
  }

  const handleDialogSubmit = async (payload: ProfilePayload) => {
    setIsDialogSubmitting(true)
    setPageError(null)

    try {
      if (dialogMode === "create") {
        const createdProfile = await createProfile(payload)
        setProfiles((currentProfiles) => [createdProfile, ...currentProfiles])
        return
      }

      if (!selectedProfile) {
        return
      }

      const updatedProfile = await updateProfile(selectedProfile.id, payload)
      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => (profile.id === updatedProfile.id ? updatedProfile : profile))
      )
      setSelectedProfile(updatedProfile)
    } finally {
      setIsDialogSubmitting(false)
    }
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
      setProfiles((currentProfiles) =>
        currentProfiles.filter((profile) => profile.id !== deleteTarget.id)
      )
      setDeleteTarget(null)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "We couldn’t delete that profile.")
    } finally {
      setMutationState({ profileId: null, action: null })
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8 xl:px-12">
      <section className="mb-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
              Profiles
            </Badge>
            <div className="space-y-2">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                Build targeted resume profiles from your saved career data
              </h1>
              <p className="text-sm text-on-surface-variant/75 md:text-base">
                Create reusable filters, preview what each profile keeps, and organize them the way you work best.
              </p>
            </div>
          </div>

          <Button type="button" onClick={openCreateDialog}>
            Create profile
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-on-surface-variant/70">Total profiles</p>
            <p className="mt-2 text-3xl font-semibold text-on-surface">{profiles.length}</p>
            <p className="mt-2 text-sm text-on-surface-variant/75">All saved profile variants.</p>
          </Card>

          <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-on-surface-variant/70">Profiles with rules</p>
            <p className="mt-2 text-3xl font-semibold text-on-surface">{profilesWithRules}</p>
            <p className="mt-2 text-sm text-on-surface-variant/75">Profiles using tags, limits, or custom ordering.</p>
          </Card>

          <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-on-surface-variant/70">Reusable tags</p>
            <p className="mt-2 text-3xl font-semibold text-on-surface">{tagSuggestions.length}</p>
            <p className="mt-2 text-sm text-on-surface-variant/75">Tags available from experience and project entries.</p>
          </Card>
        </div>
      </section>

      {pageError ? (
        <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/5">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <ProfilesToolbar
          query={query}
          filter={filter}
          sort={sort}
          view={view}
          totalCount={profiles.length}
          visibleCount={filteredProfiles.length}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onViewChange={setView}
          onClear={() => {
            setQuery("")
            setFilter("all")
            setSort("updated-desc")
          }}
          onCreate={openCreateDialog}
        />

        {filteredProfiles.length ? (
          <div
            className={
              view === "grid"
                ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                : view === "cards"
                  ? "grid gap-4 xl:grid-cols-2"
                  : "space-y-4"
            }
          >
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                preview={previewMap.get(profile.id) ?? buildProfilePreview(profile, careerData)}
                view={view}
                isBusy={mutationState.profileId === profile.id}
                onEdit={() => openEditDialog(profile)}
                onDuplicate={() => void handleDuplicate(profile)}
                onDelete={() => setDeleteTarget(profile)}
              />
            ))}
          </div>
        ) : profiles.length ? (
          <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-8 text-on-surface-variant/40" />
            <EmptyHeader>
              <EmptyTitle>No profiles match your current filters</EmptyTitle>
              <EmptyDescription>
                Try a different search term, change the filters, or clear them to see everything again.
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
          <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-8 text-on-surface-variant/40" />
            <EmptyHeader>
              <EmptyTitle>No profiles yet</EmptyTitle>
              <EmptyDescription>
                Start with a profile for the kind of role you want, then use tags to shape what it keeps.
              </EmptyDescription>
            </EmptyHeader>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={openCreateDialog}>
                Create your first profile
              </Button>
              <Link
                href="/career-data"
                className="inline-flex h-9 items-center justify-center rounded-sm border border-outline-variant/70 px-4 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-subtle hover:text-on-surface"
              >
                Open career data
              </Link>
            </div>
          </Empty>
        )}
      </div>

      <ProfileFormDialog
        open={dialogOpen}
        mode={dialogMode}
        profile={selectedProfile}
        careerData={careerData}
        tagSuggestions={tagSuggestions}
        isSubmitting={isDialogSubmitting}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) {
            setSelectedProfile(null)
          }
        }}
        onSubmit={handleDialogSubmit}
      />

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

      {emptyProfiles > 0 ? (
        <p className="mt-6 text-sm text-on-surface-variant/70">
          {emptyProfiles} profile{emptyProfiles === 1 ? " currently has" : "s currently have"} no matching experience or project entries.
        </p>
      ) : null}
    </main>
  )
}
