import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "../../region-instructions"
import { buildSystemPrompt, buildCareerDataContext } from "./index"

export function buildGenerateProfileUserPrompt(params: {
  userPrompt: string
  careerData: CareerWorkspaceData
  region: RegionStandard
}): string {
  const { userPrompt, careerData, region } = params

  const lines: string[] = [
    "Task: Generate CV profile settings from natural language request",
    "",
    "User request:",
    userPrompt,
    "",
    "All career data:",
    buildCareerDataContext(careerData),
    "",
    "Instructions:",
    `Interpret the user's request to determine which tags to include/exclude, how to order sections, and any content limits. Consider ${region.name} CV standards.`,
    "",
    'IMPORTANT: Respond ONLY with valid JSON matching this schema: { "name": "string", "include_tags": ["string"], "exclude_tags": ["string"], "ordering": { "experiences": "recent" | "oldest", "projects": "manual" | "name", "education": "recent" | "oldest" }, "limits": { "experiences": number | null, "projects": number | null } }',
  ]

  return lines.join("\n")
}

export function buildGenerateProfileSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}