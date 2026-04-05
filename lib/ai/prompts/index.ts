import type { CareerWorkspaceData } from "@/lib/career-data/types"
import { toSystemPrompt, type RegionStandard } from "../../region-instructions"

export { type RewriteSuggestion, type LayoutSuggestion, type ProfileSuggestion } from "../types"

const BASE_SYSTEM_PROMPT = `You are a professional CV writer. You help users create polished, accurate, and compelling CV content. Be concise, specific, and truthful. Do not fabricate details not present in the provided data.`

export function buildSystemPrompt(region: RegionStandard): string {
  return [BASE_SYSTEM_PROMPT, toSystemPrompt(region)].join("\n\n")
}

export function buildCareerDataContext(careerData: CareerWorkspaceData): string {
  const lines: string[] = []

  // Personal
  lines.push("### Personal")
  if (careerData.personal.full_name || careerData.personal.title || careerData.personal.summary) {
    if (careerData.personal.full_name) lines.push(`Name: ${careerData.personal.full_name}`)
    if (careerData.personal.title) lines.push(`Title: ${careerData.personal.title}`)
    if (careerData.personal.summary) lines.push(`Summary: ${careerData.personal.summary}`)
  } else {
    lines.push("(none)")
  }

  // Contacts
  lines.push("", "### Contacts")
  if (careerData.contacts.length > 0) {
    careerData.contacts.forEach((contact) => {
      lines.push(`- ${contact.type}: ${contact.value}`)
    })
  } else {
    lines.push("(none)")
  }

  // Experiences
  lines.push("", "### Experiences")
  if (careerData.experiences.length > 0) {
    careerData.experiences.forEach((exp) => {
      lines.push(`- ${exp.role} at ${exp.company} (${exp.start_date} - ${exp.end_date})`)
      if (exp.location) lines.push(`  Location: ${exp.location}`)
      if (exp.bullets.length > 0) lines.push(`  Bullets: ${exp.bullets.join(" | ")}`)
      if (exp.tags.length > 0) lines.push(`  Tags: ${exp.tags.join(", ")}`)
    })
  } else {
    lines.push("(none)")
  }

  // Projects
  lines.push("", "### Projects")
  if (careerData.projects.length > 0) {
    careerData.projects.forEach((proj) => {
      lines.push(`- ${proj.name}`)
      if (proj.description) lines.push(`  Description: ${proj.description}`)
      if (proj.tech_stack.length > 0) lines.push(`  Tech stack: ${proj.tech_stack.join(", ")}`)
      if (proj.bullets.length > 0) lines.push(`  Bullets: ${proj.bullets.join(" | ")}`)
      if (proj.tags.length > 0) lines.push(`  Tags: ${proj.tags.join(", ")}`)
    })
  } else {
    lines.push("(none)")
  }

  // Education
  lines.push("", "### Education")
  if (careerData.education.length > 0) {
    careerData.education.forEach((edu) => {
      lines.push(`- ${edu.degree} at ${edu.institution} (${edu.start_date} - ${edu.end_date})`)
      if (edu.details) lines.push(`  Details: ${edu.details}`)
    })
  } else {
    lines.push("(none)")
  }

  // Skills
  lines.push("", "### Skills")
  if (careerData.skills.length > 0) {
    const byCategory = careerData.skills.reduce<Record<string, string[]>>((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill.name)
      return acc
    }, {})
    Object.entries(byCategory).forEach(([category, names]) => {
      lines.push(`- ${category}: ${names.join(", ")}`)
    })
  } else {
    lines.push("(none)")
  }

  return lines.join("\n")
}