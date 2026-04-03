import { format, isValid, parse } from "date-fns"

import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type {
  CvContentOverrides,
  CvData,
  CvOverrideSection,
  CvPayload,
  CvPreview,
  CvRenderModel,
  CvTemplateMetadata,
} from "@/lib/cvs/types"
import type { ProfileData, ProfilePayload } from "@/lib/profiles/types"
import { buildProfileDataset } from "@/lib/profiles/engine"

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

function resolveCvSectionEntries<T extends { id: string }>(
  defaultEntries: T[],
  allEntries: T[],
  selectedIds: string[] | null
) {
  if (selectedIds === null) {
    return defaultEntries
  }

  return filterEntriesBySelection(allEntries, selectedIds)
}

function formatMonthValue(value: string) {
  if (!value) {
    return ""
  }

  const parsedDate = parse(value, "yyyy-MM", new Date())

  if (!isValid(parsedDate)) {
    return value
  }

  return format(parsedDate, "MMM yyyy")
}

function formatDateRange(startDate: string, endDate: string) {
  const startLabel = formatMonthValue(startDate)
  const endLabel = endDate ? formatMonthValue(endDate) : "Present"

  if (!startLabel) {
    return endLabel
  }

  return `${startLabel} – ${endLabel}`
}

function normalizeSectionOrder(
  requestedOrder: CvOverrideSection[],
  template: CvTemplateMetadata,
  hiddenSections: CvOverrideSection[]
) {
  const hiddenSectionSet = new Set(hiddenSections)

  return requestedOrder.filter(
    (section) => template.sections.includes(section) && !hiddenSectionSet.has(section)
  )
}

function applyEntryOverrides<T extends { id: string }, TOverride extends Partial<Omit<T, "id">>>(
  entries: T[],
  overrides: Record<string, TOverride>
) {
  return entries.map((entry) => ({
    ...entry,
    ...(overrides[entry.id] ?? {}),
  }))
}

export function applyCvContentOverrides(
  dataset: CareerWorkspaceData,
  overrides: CvContentOverrides
): CareerWorkspaceData {
  return {
    personal: {
      ...dataset.personal,
      ...overrides.personal,
    },
    contacts: applyEntryOverrides(dataset.contacts, overrides.contacts),
    experiences: applyEntryOverrides(dataset.experiences, overrides.experiences),
    projects: applyEntryOverrides(dataset.projects, overrides.projects),
    education: applyEntryOverrides(dataset.education, overrides.education),
    skills: applyEntryOverrides(dataset.skills, overrides.skills),
  }
}

export function buildCvDataset(
  cv: CvData | CvPayload,
  profile: ProfileData | ProfilePayload,
  careerData: CareerWorkspaceData
): CareerWorkspaceData {
  const profileDataset = buildProfileDataset(profile, careerData)
  const contentAdjustedProfileDataset = applyCvContentOverrides(profileDataset, cv.overrides.content)
  const contentAdjustedCareerData = applyCvContentOverrides(careerData, cv.overrides.content)

  return {
    personal: contentAdjustedProfileDataset.personal,
    contacts: resolveCvSectionEntries(
      contentAdjustedProfileDataset.contacts,
      contentAdjustedCareerData.contacts,
      cv.overrides.selections.contacts
    ),
    experiences: resolveCvSectionEntries(
      contentAdjustedProfileDataset.experiences,
      contentAdjustedCareerData.experiences,
      cv.overrides.selections.experiences
    ),
    projects: resolveCvSectionEntries(
      contentAdjustedProfileDataset.projects,
      contentAdjustedCareerData.projects,
      cv.overrides.selections.projects
    ),
    education: resolveCvSectionEntries(
      contentAdjustedProfileDataset.education,
      contentAdjustedCareerData.education,
      cv.overrides.selections.education
    ),
    skills: resolveCvSectionEntries(
      contentAdjustedProfileDataset.skills,
      contentAdjustedCareerData.skills,
      cv.overrides.selections.skills
    ),
  }
}

export function buildCvRenderModel(
  cv: CvData | CvPayload,
  profile: ProfileData | ProfilePayload,
  careerData: CareerWorkspaceData,
  template: CvTemplateMetadata
): CvRenderModel {
  const dataset = buildCvDataset(cv, profile, careerData)
  const hiddenSections = cv.overrides.hidden_sections.filter((section) =>
    template.sections.includes(section)
  )
  const sectionOrder = normalizeSectionOrder(cv.overrides.section_order, template, hiddenSections)

  return {
    meta: {
      cv_id: "id" in cv ? cv.id : "preview",
      cv_name: cv.name,
      profile_id: "id" in profile ? profile.id : "preview-profile",
      profile_name: profile.name,
      template_id: template.id,
      template_slug: template.slug,
      template_name: template.name,
      updated_at: "updated_at" in cv ? cv.updated_at : new Date().toISOString(),
    },
    personal: dataset.personal,
    contacts: dataset.contacts.map((contact) => ({
      ...contact,
      label: contact.type || "Contact",
    })),
    experiences: dataset.experiences.map((experience) => ({
      ...experience,
      end_date: experience.end_date || null,
      date_label: formatDateRange(experience.start_date, experience.end_date),
    })),
    projects: dataset.projects,
    education: dataset.education.map((entry) => ({
      ...entry,
      end_date: entry.end_date || null,
      date_label: formatDateRange(entry.start_date, entry.end_date),
    })),
    skills: dataset.skills,
    section_order: sectionOrder,
    hidden_sections: hiddenSections,
  }
}

export function buildCvPreview(model: CvRenderModel): CvPreview {
  const sections = [
    model.contacts.length,
    model.experiences.length,
    model.projects.length,
    model.education.length,
    model.skills.length,
  ]

  const totalItemCount = sections.reduce((total, value) => total + value, 0)
  const hasContent = Boolean(
    totalItemCount || model.personal.full_name || model.personal.title || model.personal.summary
  )

  return {
    contactCount: model.contacts.length,
    experienceCount: model.experiences.length,
    projectCount: model.projects.length,
    educationCount: model.education.length,
    skillCount: model.skills.length,
    totalItemCount,
    visibleSectionCount: sections.filter((value) => value > 0).length,
    hasContent,
  }
}
