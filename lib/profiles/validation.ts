import {
  defaultProfileConfig,
  type ProfileConfig,
  type ProfilePayload,
} from "@/lib/profiles/types"

export type ProfileValidationErrors = {
  name?: string
  include_tags?: string
  exclude_tags?: string
  config?: string
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePositiveInteger(value: unknown) {
  const nextValue = typeof value === "number" ? value : Number.parseInt(normalizeText(value), 10)

  if (!Number.isFinite(nextValue) || nextValue < 1) {
    return null
  }

  return Math.floor(nextValue)
}

export function normalizeTagList(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

export function normalizeProfileConfig(value: unknown): ProfileConfig {
  const nextConfig = (value ?? {}) as Partial<ProfileConfig>
  const nextOrdering = (nextConfig.ordering ?? {}) as Partial<ProfileConfig["ordering"]>
  const nextLimits = (nextConfig.limits ?? {}) as Partial<ProfileConfig["limits"]>

  return {
    ordering: {
      experiences:
        nextOrdering.experiences === "oldest"
          ? "oldest"
          : defaultProfileConfig.ordering.experiences,
      projects:
        nextOrdering.projects === "name"
          ? "name"
          : defaultProfileConfig.ordering.projects,
      education:
        nextOrdering.education === "oldest"
          ? "oldest"
          : defaultProfileConfig.ordering.education,
    },
    limits: {
      experiences: normalizePositiveInteger(nextLimits.experiences),
      projects: normalizePositiveInteger(nextLimits.projects),
    },
  }
}

export function normalizeProfilePayload(value: unknown): ProfilePayload {
  const nextValue = (value ?? {}) as Partial<ProfilePayload>

  return {
    name: normalizeText(nextValue.name),
    include_tags: normalizeTagList(nextValue.include_tags),
    exclude_tags: normalizeTagList(nextValue.exclude_tags),
    config: normalizeProfileConfig(nextValue.config),
  }
}

export function validateProfilePayload(payload: ProfilePayload): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {}

  if (!payload.name) {
    errors.name = "Enter a profile name."
  }

  const conflictingTags = payload.include_tags.filter((tag) => payload.exclude_tags.includes(tag))

  if (conflictingTags.length) {
    const message = "A tag cannot be included and excluded at the same time."
    errors.include_tags = message
    errors.exclude_tags = message
  }

  if (
    payload.config.limits.experiences !== null &&
    payload.config.limits.experiences < 1
  ) {
    errors.config = "Experience limit must be 1 or higher."
  }

  if (payload.config.limits.projects !== null && payload.config.limits.projects < 1) {
    errors.config = "Project limit must be 1 or higher."
  }

  return errors
}

export function hasProfileValidationErrors(errors: ProfileValidationErrors) {
  return Object.values(errors).some(Boolean)
}

export function getFirstProfileValidationMessage(errors: ProfileValidationErrors) {
  return errors.name ?? errors.include_tags ?? errors.exclude_tags ?? errors.config ?? "Profile data is invalid."
}
