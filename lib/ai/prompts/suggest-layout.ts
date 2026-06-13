import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "../../region-instructions"
import { buildSystemPrompt, buildCareerDataContext } from "./index"

export function buildSuggestLayoutUserPrompt(params: {
  careerData: CareerWorkspaceData
  region: RegionStandard
  currentSectionOrder: string[]
}): string {
  const { careerData, region, currentSectionOrder } = params

  const lines: string[] = [
    "Task: Suggest an optimized section order for this CV",
    "",
    `Current section order: ${currentSectionOrder.join(" → ")}`,
    "",
    "All career data:",
    buildCareerDataContext(careerData),
    "",
    "Instructions:",
    `Based on the career data and ${region.name} standards, suggest the optimal section order. Consider what sections have the most relevant content and should appear first. Provide a reasoning for each section's position.`,
    "",
    'IMPORTANT: Respond ONLY with valid JSON matching this schema: { "section_order": ["string"], "reasoning_per_section": { "string": "string" } }',
  ]

  return lines.join("\n")
}

export function buildSuggestLayoutSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}