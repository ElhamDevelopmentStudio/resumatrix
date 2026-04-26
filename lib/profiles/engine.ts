import type {
  CareerWorkspaceData,
  EducationData,
  ExperienceData,
  ProjectData,
} from "@/lib/career-data/types"
import type {
  ProfileData,
  ProfilePayload,
  ProfilePreview,
  ProfileSelectableSection,
} from "@/lib/profiles/types"
import { normalizeTagList } from "@/lib/profiles/validation"

type ProfileCollections = {
  matchingExperiences: ExperienceData[]
  visibleExperiences: ExperienceData[]
  matchingProjects: ProjectData[]
  visibleProjects: ProjectData[]
  education: EducationData[]
  achievements: CareerWorkspaceData["achievements"]
  skills: CareerWorkspaceData["skills"]
  contacts: CareerWorkspaceData["contacts"]
}

function compareDateValues(left: string, right: string) {
  return right.localeCompare(left)
}

export function matchesProfileTagRules(tags: string[], profile: ProfileData | ProfilePayload) {
  const itemTags = normalizeTagList(tags)
  const includeTags = normalizeTagList(profile.include_tags)
  const excludeTags = new Set(normalizeTagList(profile.exclude_tags))

  if (itemTags.some((tag) => excludeTags.has(tag))) {
    return false
  }

  if (!includeTags.length) {
    return true
  }

  return itemTags.some((tag) => includeTags.includes(tag))
}

function filterEntriesBySelection<T extends { id: string }>(
  entries: T[],
  selectedIds: string[] | null
) {
  if (selectedIds === null) {
    return entries
  }

  const selectedIdSet = new Set(selectedIds)
  return entries.filter((entry) => selectedIdSet.has(entry.id))
}

function getProfileSelection(
  profile: ProfileData | ProfilePayload,
  section: ProfileSelectableSection
) {
  return profile.config.selections[section]
}

function sortExperiences(entries: ExperienceData[], profile: ProfileData | ProfilePayload) {
  const nextEntries = [...entries]

  nextEntries.sort((left, right) => {
    if (profile.config.ordering.experiences === "oldest") {
      return left.start_date.localeCompare(right.start_date)
    }

    return compareDateValues(left.start_date, right.start_date)
  })

  return nextEntries
}

function sortProjects(entries: ProjectData[], profile: ProfileData | ProfilePayload) {
  const nextEntries = [...entries]

  if (profile.config.ordering.projects === "name") {
    nextEntries.sort((left, right) => left.name.localeCompare(right.name))
  }

  return nextEntries
}

function sortEducation(entries: EducationData[], profile: ProfileData | ProfilePayload) {
  const nextEntries = [...entries]

  nextEntries.sort((left, right) => {
    const leftValue = left.end_date || left.start_date
    const rightValue = right.end_date || right.start_date

    if (profile.config.ordering.education === "oldest") {
      return leftValue.localeCompare(rightValue)
    }

    return compareDateValues(leftValue, rightValue)
  })

  return nextEntries
}

function buildProfileCollections(
  profile: ProfileData | ProfilePayload,
  careerData: CareerWorkspaceData
): ProfileCollections {
  const matchingExperiences = sortExperiences(
    filterEntriesBySelection(
      careerData.experiences.filter((entry) => matchesProfileTagRules(entry.tags, profile)),
      getProfileSelection(profile, "experiences")
    ),
    profile
  )
  const matchingProjects = sortProjects(
    filterEntriesBySelection(
      careerData.projects.filter((entry) => matchesProfileTagRules(entry.tags, profile)),
      getProfileSelection(profile, "projects")
    ),
    profile
  )
  const visibleExperiences = profile.config.limits.experiences
    ? matchingExperiences.slice(0, profile.config.limits.experiences)
    : matchingExperiences
  const visibleProjects = profile.config.limits.projects
    ? matchingProjects.slice(0, profile.config.limits.projects)
    : matchingProjects
  const education = sortEducation(
    filterEntriesBySelection(careerData.education, getProfileSelection(profile, "education")),
    profile
  )
  const skills = filterEntriesBySelection(
    careerData.skills,
    getProfileSelection(profile, "skills")
  )
  const achievements = filterEntriesBySelection(
    careerData.achievements,
    getProfileSelection(profile, "achievements")
  )
  const contacts = filterEntriesBySelection(
    careerData.contacts,
    getProfileSelection(profile, "contacts")
  )

  return {
    matchingExperiences,
    visibleExperiences,
    matchingProjects,
    visibleProjects,
    education,
    achievements,
    skills,
    contacts,
  }
}

export function buildProfileDataset(
  profile: ProfileData | ProfilePayload,
  careerData: CareerWorkspaceData
): CareerWorkspaceData {
  const collections = buildProfileCollections(profile, careerData)

  return {
    personal: careerData.personal,
    contacts: collections.contacts,
    experiences: collections.visibleExperiences,
    projects: collections.visibleProjects,
    education: collections.education,
    achievements: collections.achievements,
    skills: collections.skills,
  }
}

export function buildProfilePreview(
  profile: ProfileData | ProfilePayload,
  careerData: CareerWorkspaceData
): ProfilePreview {
  const collections = buildProfileCollections(profile, careerData)

  return {
    matchedExperiences: collections.matchingExperiences.length,
    displayedExperiences: collections.visibleExperiences.length,
    matchedProjects: collections.matchingProjects.length,
    displayedProjects: collections.visibleProjects.length,
    educationCount: collections.education.length,
    achievementCount: collections.achievements.length,
    skillsCount: collections.skills.length,
    contactsCount: collections.contacts.length,
    totalDisplayedItems:
      collections.visibleExperiences.length +
      collections.visibleProjects.length +
      collections.education.length +
      collections.achievements.length +
      collections.skills.length +
      collections.contacts.length,
    primaryMatchCount:
      collections.matchingExperiences.length + collections.matchingProjects.length,
    hasEmptyPrimaryResults:
      careerData.experiences.length + careerData.projects.length > 0 &&
      collections.matchingExperiences.length + collections.matchingProjects.length === 0,
  }
}

export function getWorkspaceTagSuggestions(careerData: CareerWorkspaceData) {
  return Array.from(
    new Set(
      [
        ...careerData.experiences.flatMap((entry) => entry.tags),
        ...careerData.projects.flatMap((entry) => entry.tags),
      ]
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right))
}

export function profileHasActiveRules(profile: ProfileData | ProfilePayload) {
  return (
    profile.include_tags.length > 0 ||
    profile.exclude_tags.length > 0 ||
    profile.config.limits.experiences !== null ||
    profile.config.limits.projects !== null ||
    profile.config.ordering.experiences !== "recent" ||
    profile.config.ordering.projects !== "manual" ||
    profile.config.ordering.education !== "recent" ||
    Object.values(profile.config.selections).some((selection) => selection !== null)
  )
}
