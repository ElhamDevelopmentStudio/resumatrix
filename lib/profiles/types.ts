import type { CareerWorkspaceData } from "@/lib/career-data/types"

export type ExperienceOrdering = "recent" | "oldest"
export type ProjectOrdering = "manual" | "name"
export type EducationOrdering = "recent" | "oldest"

export type ProfileConfig = {
  ordering: {
    experiences: ExperienceOrdering
    projects: ProjectOrdering
    education: EducationOrdering
  }
  limits: {
    experiences: number | null
    projects: number | null
  }
}

export type ProfileData = {
  id: string
  name: string
  include_tags: string[]
  exclude_tags: string[]
  config: ProfileConfig
  created_at: string
  updated_at: string
}

export type ProfilePayload = Omit<ProfileData, "id" | "created_at" | "updated_at">

export type ProfilePreview = {
  matchedExperiences: number
  displayedExperiences: number
  matchedProjects: number
  displayedProjects: number
  educationCount: number
  skillsCount: number
  contactsCount: number
  totalDisplayedItems: number
  primaryMatchCount: number
  hasEmptyPrimaryResults: boolean
}

export type ProfileListFilter =
  | "all"
  | "ready"
  | "needs-attention"
  | "include-tags"
  | "exclude-tags"

export type ProfileSortKey =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "name-desc"
  | "coverage-desc"

export type ProfileViewMode = "cards" | "grid" | "list"
export type ProfileBuilderMode = "create" | "edit"

export const defaultProfileConfig: ProfileConfig = {
  ordering: {
    experiences: "recent",
    projects: "manual",
    education: "recent",
  },
  limits: {
    experiences: null,
    projects: null,
  },
}

export const emptyProfilePayload: ProfilePayload = {
  name: "",
  include_tags: [],
  exclude_tags: [],
  config: defaultProfileConfig,
}

export const experienceOrderingOptions: Array<{
  label: string
  value: ExperienceOrdering
}> = [
  { label: "Newest first", value: "recent" },
  { label: "Oldest first", value: "oldest" },
]

export const projectOrderingOptions: Array<{
  label: string
  value: ProjectOrdering
}> = [
  { label: "Saved order", value: "manual" },
  { label: "Name A–Z", value: "name" },
]

export const educationOrderingOptions: Array<{
  label: string
  value: EducationOrdering
}> = [
  { label: "Newest first", value: "recent" },
  { label: "Oldest first", value: "oldest" },
]

export type ProfilePreviewMap = Map<string, ProfilePreview>

export type ProfileWorkspaceProps = {
  careerData: CareerWorkspaceData
  initialProfiles: ProfileData[]
}
