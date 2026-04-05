import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "../../region-instructions"
import type { RewriteSuggestion } from "../types"
import { buildSystemPrompt, buildCareerDataContext } from "./index"

export type RewriteFieldType = "bullet" | "summary" | "description" | "role" | "details"

const FIELD_LABELS: Record<RewriteFieldType, string> = {
  bullet: "a bullet point",
  summary: "the personal summary",
  description: "a project description",
  role: "a job role title",
  details: "education details",
}

const FIELD_SCHEMA: Record<RewriteFieldType, string> = {
  bullet: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  summary: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  description: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  role: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
  details: '{ "original": "string", "suggested": "string", "reasoning": "string" }',
}

export function buildRewriteFieldUserPrompt(params: {
  fieldType: RewriteFieldType
  originalValue: string
  careerData: CareerWorkspaceData
  region: RegionStandard
  entryContext?: string
}): string {
  const { fieldType, originalValue, careerData, region, entryContext } = params
  const label = FIELD_LABELS[fieldType]

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
  lines.push(`Rewrite ${label} based on the career data above. Improve clarity, impact, and alignment with ${region.name} CV standards. Keep the meaning accurate.`)
  lines.push("")
  lines.push(`IMPORTANT: Respond ONLY with valid JSON matching this schema: ${FIELD_SCHEMA[fieldType]}`)

  return lines.join("\n")
}

export function buildRewriteFieldSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}