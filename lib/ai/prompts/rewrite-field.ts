import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "../../region-instructions"
import { buildCareerDataContext, buildSystemPrompt } from "./index"

export type RewriteFieldType = "bullet" | "summary" | "description" | "role" | "details"

const FIELD_LABELS: Record<RewriteFieldType, string> = {
  bullet: "a bullet list",
  summary: "the personal summary",
  description: "a project description",
  role: "a job role title",
  details: "education details",
}

const FIELD_SCHEMA: Record<RewriteFieldType, string> = {
  bullet:
    '{ "original": "string", "suggested": "string (newline-separated, one rewritten bullet per line when the input contains multiple bullets)", "reasoning": "string" }',
  summary: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  description: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  role: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  details: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
}

function getBulletLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function buildRewriteFieldUserPrompt(params: {
  fieldType: RewriteFieldType
  originalValue: string
  careerData: CareerWorkspaceData
  region: RegionStandard
  entryContext?: string
}): string {
  const { fieldType, originalValue, careerData, region, entryContext } = params
  const bulletLines = fieldType === "bullet" ? getBulletLines(originalValue) : []
  const label =
    fieldType === "bullet" && bulletLines.length <= 1 ? "a bullet point" : FIELD_LABELS[fieldType]

  const lines: string[] = [
    `Task: Rewrite ${label}`,
    "",
    `Original content:`,
    originalValue,
    "",
  ]

  if (entryContext) {
    lines.push("Entry context:")
    lines.push(entryContext)
    lines.push("")
  }

  lines.push("All career data:")
  lines.push(buildCareerDataContext(careerData))
  lines.push("")
  lines.push("Instructions:")
  lines.push(
    `Rewrite ${label} based on the career data above. Improve clarity, impact, and alignment with ${region.name} CV standards. Keep the meaning accurate.`
  )

  if (fieldType === "bullet") {
    if (bulletLines.length > 1) {
      lines.push(
        `The original content contains ${bulletLines.length} bullet points across multiple lines. Rewrite all ${bulletLines.length} bullet points, not just the first one.`
      )
      lines.push(
        "Return `suggested` as newline-separated text with exactly one rewritten bullet per line, in the same order."
      )
      lines.push("Do not turn the bullets into a paragraph, and do not add numbering, labels, or extra bullets.")
    } else {
      lines.push("Return `suggested` as a single rewritten bullet line.")
    }
  }

  lines.push("Return `original` exactly as provided.")
  lines.push("")
  lines.push(`IMPORTANT: Respond ONLY with valid JSON matching this schema: ${FIELD_SCHEMA[fieldType]}`)

  return lines.join("\n")
}

export function buildRewriteFieldSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}
