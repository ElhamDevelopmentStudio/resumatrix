import {
  cvOverrideSections,
  defaultCvOverrides,
  emptyCvPayload,
  type CvOverrideSection,
  type CvOverrides,
  type CvPayload,
  type CvSelections,
} from "@/lib/cvs/types"

export type CvValidationErrors = {
  name?: string
  profile_id?: string
  template_id?: string
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
    skills: normalizeIdList(nextValue.skills),
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
  return Boolean(errors.name || errors.profile_id || errors.template_id)
}

export function getFirstCvValidationMessage(errors: CvValidationErrors) {
  return (
    errors.name ??
    errors.profile_id ??
    errors.template_id ??
    "Check the CV details and try again."
  )
}
