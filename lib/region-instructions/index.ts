import type {
  SectionKey,
  SectionOrder,
  SectionRequirement,
  FormattingRules,
  BulletStyle,
  ContentEmphasis,
  LengthRules,
  RegionStandard,
} from "./types"

export type {
  SectionKey,
  SectionOrder,
  SectionRequirement,
  FormattingRules,
  BulletStyle,
  ContentEmphasis,
  LengthRules,
  RegionStandard,
}

import { us } from "./us"
import { canada } from "./canada"
import { uk } from "./uk"
import { eu } from "./eu"
import { germany } from "./germany"
import { france } from "./france"
import { afghanistan } from "./afghanistan"
import { russia } from "./russia"
import { australia } from "./australia"
import { international } from "./international"

const regions: Record<string, RegionStandard> = {
  us,
  ca: canada,
  uk,
  eu,
  de: germany,
  fr: france,
  af: afghanistan,
  ru: russia,
  au: australia,
  international,
}

const regionIds = Object.keys(regions)

export function getRegionStandard(id: string): RegionStandard {
  return regions[id] ?? international
}

export function getAllRegionIds(): string[] {
  return regionIds
}

export function toSystemPrompt(region: RegionStandard): string {
  const sectionOrderStr = region.section_order.join(" → ")

  const formatPhoto = (photo?: FormattingRules["photo"]) => {
    if (!photo || !photo.included) return "Do not include"
    const parts = []
    if (photo.size) parts.push(`size: ${photo.size}`)
    if (photo.position) parts.push(`position: ${photo.position}`)
    return parts.length > 0 ? `Included (${parts.join(", ")})` : "Included"
  }

  const bulletEmphasisLabels: Record<BulletStyle["emphasis"], string> = {
    action_verbs: "Action verbs",
    metrics: "Metrics and numbers",
    both: "Action verbs and metrics",
    none: "No special emphasis",
  }

  const lines: string[] = [
    `You are a professional CV writer specializing in ${region.name} standards.`,
    "",
    "## Section Order",
    `Use this section order: ${sectionOrderStr}`,
    "",
    "## Formatting Rules",
  ]

  if (region.formatting.photo) {
    lines.push(`- Photo: ${formatPhoto(region.formatting.photo)}`)
  }
  if (region.formatting.dateOfBirth) {
    lines.push(`- Date of birth: ${region.formatting.dateOfBirth}`)
  }
  if (region.formatting.nationality) {
    lines.push(`- Nationality: ${region.formatting.nationality}`)
  }
  if (region.formatting.maritalStatus) {
    lines.push(`- Marital status: ${region.formatting.maritalStatus}`)
  }
  if (region.formatting.linkedin) {
    lines.push(`- LinkedIn: ${region.formatting.linkedin}`)
  }
  if (region.formatting.github) {
    lines.push(`- GitHub: ${region.formatting.github}`)
  }
  if (region.formatting.portfolio) {
    lines.push(`- Portfolio: ${region.formatting.portfolio}`)
  }

  lines.push("", "## Bullet Style")
  lines.push(`- Emphasis: ${bulletEmphasisLabels[region.bullet_style.emphasis]}`)
  if (region.bullet_style.prefix) {
    lines.push(`- Prefix: ${region.bullet_style.prefix}`)
  }
  if (region.bullet_style.maxLength) {
    lines.push(`- Max length: ${region.bullet_style.maxLength} characters`)
  }

  lines.push("", "## Content Emphasis")
  if (region.content_emphasis.highlights.length > 0) {
    lines.push(
      "- Highlight: " + region.content_emphasis.highlights.join(", ")
    )
  }
  if (region.content_emphasis.omit.length > 0) {
    lines.push("- Omit: " + region.content_emphasis.omit.join(", "))
  }

  lines.push("", "## Length")
  const pagesStr =
    region.length_expectations.pages === "flexible"
      ? "Flexible"
      : `${region.length_expectations.pages} page${region.length_expectations.pages > 1 ? "s" : ""}`
  lines.push(`- Pages: ${pagesStr}`)
  if (region.length_expectations.reason) {
    lines.push(`- Note: ${region.length_expectations.reason}`)
  }

  return lines.join("\n")
}
