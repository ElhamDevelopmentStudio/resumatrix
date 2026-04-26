import {
  cvOverrideSections,
  defaultCvOverrides,
  emptyCvContentOverrides,
  emptyCvPayload,
  type CvContactContentOverride,
  type CvContentOverrides,
  type CvEducationContentOverride,
  type CvExperienceContentOverride,
  type CvAchievementContentOverride,
  type CvOverrideSection,
  type CvOverrides,
  type CvPayload,
  type CvProjectContentOverride,
  type CvSelections,
  type CvSkillContentOverride,
} from "@/lib/cvs/types"

export type CvValidationErrors = {
  name?: string
  profile_id?: string
  template_id?: string
  region_id?: string
}

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeIdList(value: unknown): string[] | null {
  if (value === null || value === undefined) {
    return null
  }

  if (!Array.isArray(value)) {
    return null
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function normalizeSectionList(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as CvOverrideSection[]
  }

  const allowed = new Set<CvOverrideSection>(cvOverrideSections)

  return Array.from(
    new Set(
      value.filter(
        (item): item is CvOverrideSection =>
          typeof item === "string" && allowed.has(item as CvOverrideSection)
      )
    )
  )
}

function normalizeSectionOrder(value: unknown) {
  const requestedSections = normalizeSectionList(value)
  const nextSections = requestedSections.filter((section) => cvOverrideSections.includes(section))

  for (const section of cvOverrideSections) {
    if (!nextSections.includes(section)) {
      nextSections.push(section)
    }
  }

  return nextSections
}

function normalizeSelections(value: unknown): CvSelections {
  if (!value || typeof value !== "object") {
    return defaultCvOverrides.selections
  }

  const nextValue = value as Partial<CvSelections>

  return {
    contacts: normalizeIdList(nextValue.contacts),
    experiences: normalizeIdList(nextValue.experiences),
    projects: normalizeIdList(nextValue.projects),
    education: normalizeIdList(nextValue.education),
    achievements: normalizeIdList(nextValue.achievements),
    skills: normalizeIdList(nextValue.skills),
  }
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeMappedEntries<T extends Record<string, unknown>>(
  value: unknown,
  normalizeEntry: (entry: unknown) => T
) {
  if (!value || typeof value !== "object") {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([id, entry]) => [id.trim(), normalizeEntry(entry)] as const)
      .filter(([id, entry]) => Boolean(id) && Object.keys(entry).length > 0)
  )
}

function normalizeContactContentOverride(value: unknown): CvContactContentOverride {
  if (!value || typeof value !== "object") {
    return {}
  }

  const nextValue = value as Partial<CvContactContentOverride>
  const nextOverride: CvContactContentOverride = {}

  if (typeof nextValue.type === "string") {
    nextOverride.type = nextValue.type.trim()
  }

  if (typeof nextValue.value === "string") {
    nextOverride.value = nextValue.value.trim()
  }

  return nextOverride
}

function normalizeExperienceContentOverride(value: unknown): CvExperienceContentOverride {
  if (!value || typeof value !== "object") {
    return {}
  }

  const nextValue = value as Partial<CvExperienceContentOverride>
  const nextOverride: CvExperienceContentOverride = {}

  if (typeof nextValue.company === "string") {
    nextOverride.company = nextValue.company.trim()
  }

  if (typeof nextValue.role === "string") {
    nextOverride.role = nextValue.role.trim()
  }

  if (typeof nextValue.start_date === "string") {
    nextOverride.start_date = nextValue.start_date.trim()
  }

  if (typeof nextValue.end_date === "string") {
    nextOverride.end_date = nextValue.end_date.trim()
  }

  if (typeof nextValue.location === "string") {
    nextOverride.location = nextValue.location.trim()
  }

  const bullets = normalizeStringList(nextValue.bullets)

  if (bullets !== undefined) {
    nextOverride.bullets = bullets
  }

  return nextOverride
}

function normalizeProjectContentOverride(value: unknown): CvProjectContentOverride {
  if (!value || typeof value !== "object") {
    return {}
  }

  const nextValue = value as Partial<CvProjectContentOverride>
  const nextOverride: CvProjectContentOverride = {}

  if (typeof nextValue.name === "string") {
    nextOverride.name = nextValue.name.trim()
  }

  if (typeof nextValue.description === "string") {
    nextOverride.description = nextValue.description.trim()
  }

  const techStack = normalizeStringList(nextValue.tech_stack)

  if (techStack !== undefined) {
    nextOverride.tech_stack = techStack
  }

  const bullets = normalizeStringList(nextValue.bullets)

  if (bullets !== undefined) {
    nextOverride.bullets = bullets
  }

  return nextOverride
}

function normalizeEducationContentOverride(value: unknown): CvEducationContentOverride {
  if (!value || typeof value !== "object") {
    return {}
  }

  const nextValue = value as Partial<CvEducationContentOverride>
  const nextOverride: CvEducationContentOverride = {}

  if (typeof nextValue.institution === "string") {
    nextOverride.institution = nextValue.institution.trim()
  }

  if (typeof nextValue.degree === "string") {
    nextOverride.degree = nextValue.degree.trim()
  }

  if (typeof nextValue.start_date === "string") {
    nextOverride.start_date = nextValue.start_date.trim()
  }

  if (typeof nextValue.end_date === "string") {
    nextOverride.end_date = nextValue.end_date.trim()
  }

  if (typeof nextValue.details === "string") {
    nextOverride.details = nextValue.details.trim()
  }

  return nextOverride
}

function normalizeSkillContentOverride(value: unknown): CvSkillContentOverride {
  if (!value || typeof value !== "object") {
    return {}
  }

  const nextValue = value as Partial<CvSkillContentOverride>
  const nextOverride: CvSkillContentOverride = {}

  if (typeof nextValue.name === "string") {
    nextOverride.name = nextValue.name.trim()
  }

  if (typeof nextValue.category === "string") {
    nextOverride.category = nextValue.category.trim()
  }

  if (typeof nextValue.level === "string") {
    nextOverride.level = nextValue.level.trim()
  }

  return nextOverride
}

function normalizeAchievementContentOverride(value: unknown): CvAchievementContentOverride {
  if (!value || typeof value !== "object") {
    return {}
  }

  const nextValue = value as Partial<CvAchievementContentOverride>
  const nextOverride: CvAchievementContentOverride = {}

  if (typeof nextValue.title === "string") {
    nextOverride.title = nextValue.title.trim()
  }

  if (typeof nextValue.description === "string") {
    nextOverride.description = nextValue.description.trim()
  }

  if (typeof nextValue.link_url === "string") {
    nextOverride.link_url = nextValue.link_url.trim()
  }

  if (typeof nextValue.link_label === "string") {
    nextOverride.link_label = nextValue.link_label.trim()
  }

  return nextOverride
}

function normalizePersonalContentOverride(value: unknown) {
  if (!value || typeof value !== "object") {
    return emptyCvContentOverrides.personal
  }

  const nextValue = value as Partial<CvContentOverrides["personal"]>
  const nextOverride: CvContentOverrides["personal"] = {}

  if (typeof nextValue.full_name === "string") {
    nextOverride.full_name = nextValue.full_name.trim()
  }

  if (typeof nextValue.title === "string") {
    nextOverride.title = nextValue.title.trim()
  }

  if (typeof nextValue.summary === "string") {
    nextOverride.summary = nextValue.summary.trim()
  }

  return nextOverride
}

function normalizeContentOverrides(value: unknown): CvContentOverrides {
  if (!value || typeof value !== "object") {
    return emptyCvContentOverrides
  }

  const nextValue = value as Partial<CvContentOverrides>

  return {
    personal: normalizePersonalContentOverride(nextValue.personal),
    contacts: normalizeMappedEntries(nextValue.contacts, normalizeContactContentOverride),
    experiences: normalizeMappedEntries(
      nextValue.experiences,
      normalizeExperienceContentOverride
    ),
    projects: normalizeMappedEntries(nextValue.projects, normalizeProjectContentOverride),
    education: normalizeMappedEntries(nextValue.education, normalizeEducationContentOverride),
    achievements: normalizeMappedEntries(
      nextValue.achievements,
      normalizeAchievementContentOverride
    ),
    skills: normalizeMappedEntries(nextValue.skills, normalizeSkillContentOverride),
  }
}

export function normalizeCvOverrides(value: unknown): CvOverrides {
  if (!value || typeof value !== "object") {
    return defaultCvOverrides
  }

  const nextValue = value as Partial<CvOverrides>

  return {
    hidden_sections: normalizeSectionList(nextValue.hidden_sections),
    section_order: normalizeSectionOrder(nextValue.section_order),
    selections: normalizeSelections(nextValue.selections),
    content: normalizeContentOverrides(nextValue.content),
  }
}

export function normalizeCvPayload(value: unknown): CvPayload {
  if (!value || typeof value !== "object") {
    return emptyCvPayload
  }

  const nextValue = value as Partial<CvPayload>

  return {
    name: readText(nextValue.name),
    profile_id: readText(nextValue.profile_id),
    template_id: readText(nextValue.template_id),
    region_id: readText(nextValue.region_id),
    overrides: normalizeCvOverrides(nextValue.overrides),
  }
}

export function validateCvPayload(payload: CvPayload): CvValidationErrors {
  const errors: CvValidationErrors = {}

  if (!payload.name) {
    errors.name = "Give this CV a name so you can find it later."
  }

  if (!payload.profile_id) {
    errors.profile_id = "Choose a profile before you create this CV."
  }

  if (!payload.template_id) {
    errors.template_id = "Choose a template before you create this CV."
  }

  return errors
}

export function hasCvValidationErrors(errors: CvValidationErrors) {
  return Boolean(errors.name || errors.profile_id || errors.template_id || errors.region_id)
}

export function getFirstCvValidationMessage(errors: CvValidationErrors) {
  return (
    errors.name ??
    errors.profile_id ??
    errors.template_id ??
    errors.region_id ??
    "Check the CV details and try again."
  )
}
