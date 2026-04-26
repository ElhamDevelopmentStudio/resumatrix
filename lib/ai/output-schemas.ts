import type { LayoutSuggestion, ProfileSuggestion, RewriteSuggestion } from "./types"

type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; issues: string[] }

export type JsonSchema = {
  [key: string]: unknown
}

export interface StructuredOutputSchema<T> {
  name: string
  schema: JsonSchema
  validate: (value: unknown) => ValidationResult<T>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isNullableInteger(value: unknown) {
  return value === null || (typeof value === "number" && Number.isInteger(value))
}

function collectUnknownKeys(record: Record<string, unknown>, allowedKeys: string[]) {
  return Object.keys(record).filter((key) => !allowedKeys.includes(key))
}

export const rewriteSuggestionSchema: StructuredOutputSchema<RewriteSuggestion> = {
  name: "rewrite_suggestion",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      original: {
        type: "string",
        description: "The original text that was rewritten. This may contain newline-separated bullet points.",
      },
      suggested: {
        type: "string",
        description:
          "The improved version of the text. When rewriting bullet lists, keep one bullet per line.",
      },
      reasoning: {
        type: "string",
        description: "A short explanation of why the rewrite is stronger.",
      },
    },
    required: ["original", "suggested", "reasoning"],
  },
  validate: (value) => {
    const issues: string[] = []

    if (!isRecord(value)) {
      return { valid: false, issues: ["Expected a JSON object."] }
    }

    const unknownKeys = collectUnknownKeys(value, ["original", "suggested", "reasoning"])
    if (unknownKeys.length) {
      issues.push(`Unexpected keys: ${unknownKeys.join(", ")}.`)
    }

    if (typeof value.original !== "string") {
      issues.push('"original" must be a string.')
    }

    if (typeof value.suggested !== "string") {
      issues.push('"suggested" must be a string.')
    }

    if (typeof value.reasoning !== "string") {
      issues.push('"reasoning" must be a string.')
    }

    return issues.length ? { valid: false, issues } : { valid: true, value: value as unknown as RewriteSuggestion }
  },
}

export const layoutSuggestionSchema: StructuredOutputSchema<LayoutSuggestion> = {
  name: "layout_suggestion",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      section_order: {
        type: "array",
        items: {
          type: "string",
          enum: ["contacts", "experiences", "projects", "education", "achievements", "skills"],
        },
      },
      reasoning_per_section: {
        type: "object",
        additionalProperties: false,
        properties: {
          contacts: { type: "string" },
          experiences: { type: "string" },
          projects: { type: "string" },
          education: { type: "string" },
          achievements: { type: "string" },
          skills: { type: "string" },
        },
        required: ["contacts", "experiences", "projects", "education", "achievements", "skills"],
      },
    },
    required: ["section_order", "reasoning_per_section"],
  },
  validate: (value) => {
    const issues: string[] = []

    if (!isRecord(value)) {
      return { valid: false, issues: ["Expected a JSON object."] }
    }

    const unknownKeys = collectUnknownKeys(value, ["section_order", "reasoning_per_section"])
    if (unknownKeys.length) {
      issues.push(`Unexpected keys: ${unknownKeys.join(", ")}.`)
    }

    if (!isStringArray(value.section_order)) {
      issues.push('"section_order" must be an array of strings.')
    }

    if (!isRecord(value.reasoning_per_section)) {
      issues.push('"reasoning_per_section" must be an object.')
    } else {
      const allowedReasoningKeys = ["contacts", "experiences", "projects", "education", "achievements", "skills"]
      const reasoningUnknownKeys = collectUnknownKeys(value.reasoning_per_section, allowedReasoningKeys)

      if (reasoningUnknownKeys.length) {
        issues.push(`Unexpected reasoning keys: ${reasoningUnknownKeys.join(", ")}.`)
      }

      for (const key of allowedReasoningKeys) {
        if (typeof value.reasoning_per_section[key] !== "string") {
          issues.push(`"reasoning_per_section.${key}" must be a string.`)
        }
      }
    }

    return issues.length ? { valid: false, issues } : { valid: true, value: value as unknown as LayoutSuggestion }
  },
}

export const profileSuggestionSchema: StructuredOutputSchema<ProfileSuggestion> = {
  name: "profile_suggestion",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      include_tags: {
        type: "array",
        items: { type: "string" },
      },
      exclude_tags: {
        type: "array",
        items: { type: "string" },
      },
      ordering: {
        type: "object",
        additionalProperties: false,
        properties: {
          experiences: { type: "string", enum: ["recent", "oldest"] },
          projects: { type: "string", enum: ["manual", "name"] },
          education: { type: "string", enum: ["recent", "oldest"] },
        },
        required: ["experiences", "projects", "education"],
      },
      limits: {
        type: "object",
        additionalProperties: false,
        properties: {
          experiences: { type: ["integer", "null"] },
          projects: { type: ["integer", "null"] },
        },
        required: ["experiences", "projects"],
      },
    },
    required: ["name", "include_tags", "exclude_tags", "ordering", "limits"],
  },
  validate: (value) => {
    const issues: string[] = []

    if (!isRecord(value)) {
      return { valid: false, issues: ["Expected a JSON object."] }
    }

    const unknownKeys = collectUnknownKeys(value, ["name", "include_tags", "exclude_tags", "ordering", "limits"])
    if (unknownKeys.length) {
      issues.push(`Unexpected keys: ${unknownKeys.join(", ")}.`)
    }

    if (typeof value.name !== "string") {
      issues.push('"name" must be a string.')
    }

    if (!isStringArray(value.include_tags)) {
      issues.push('"include_tags" must be an array of strings.')
    }

    if (!isStringArray(value.exclude_tags)) {
      issues.push('"exclude_tags" must be an array of strings.')
    }

    if (!isRecord(value.ordering)) {
      issues.push('"ordering" must be an object.')
    } else {
      const orderingUnknownKeys = collectUnknownKeys(value.ordering, ["experiences", "projects", "education"])
      if (orderingUnknownKeys.length) {
        issues.push(`Unexpected ordering keys: ${orderingUnknownKeys.join(", ")}.`)
      }

      if (value.ordering.experiences !== "recent" && value.ordering.experiences !== "oldest") {
        issues.push('"ordering.experiences" must be "recent" or "oldest".')
      }

      if (value.ordering.projects !== "manual" && value.ordering.projects !== "name") {
        issues.push('"ordering.projects" must be "manual" or "name".')
      }

      if (value.ordering.education !== "recent" && value.ordering.education !== "oldest") {
        issues.push('"ordering.education" must be "recent" or "oldest".')
      }
    }

    if (!isRecord(value.limits)) {
      issues.push('"limits" must be an object.')
    } else {
      const limitsUnknownKeys = collectUnknownKeys(value.limits, ["experiences", "projects"])
      if (limitsUnknownKeys.length) {
        issues.push(`Unexpected limits keys: ${limitsUnknownKeys.join(", ")}.`)
      }

      if (!isNullableInteger(value.limits.experiences)) {
        issues.push('"limits.experiences" must be an integer or null.')
      }

      if (!isNullableInteger(value.limits.projects)) {
        issues.push('"limits.projects" must be an integer or null.')
      }
    }

    return issues.length ? { valid: false, issues } : { valid: true, value: value as unknown as ProfileSuggestion }
  },
}
