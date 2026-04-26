"use server"
/**
 * Converts a serialized Zustand career data store state into a clean CareerWorkspaceData object.
 *
 * The Zustand store has a different shape than CareerWorkspaceData:
 * - Store uses `bullets_text` (string, newline-separated) while CareerWorkspaceData uses `bullets` (string[])
 * - Store uses `tags_text` (string, comma-separated) while CareerWorkspaceData uses `tags` (string[])
 * - Store uses `tech_stack_text` (string) while CareerWorkspaceData uses `tech_stack` (string[])
 * - Store has a `saved` field containing the properly formatted saved data
 *
 * This function handles both the `saved` format (preferred) and the draft format.
 */

import type { CareerWorkspaceData } from "@/lib/career-data/types"

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function readTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export function serializeStoreToWorkspaceData(store: Record<string, unknown>): CareerWorkspaceData {
  // Prefer the saved field which has the correct format
  const saved = store.saved
  if (saved && typeof saved === "object") {
    return extractWorkspaceData(saved as Record<string, unknown>)
  }

  // Fallback: extract from store root (draft format or direct CareerWorkspaceData)
  return extractWorkspaceData(store)
}

function extractWorkspaceData(data: Record<string, unknown>): CareerWorkspaceData {
  return {
    personal: {
      full_name: readText(data.full_name),
      title: readText(data.title),
      summary: readText(data.summary),
    },
    contacts: Array.isArray(data.contacts)
      ? (data.contacts as Record<string, unknown>[]).map((c) => ({
          id: String(c.id ?? ""),
          type: readText(c.type),
          value: readText(c.value),
        }))
      : [],
    experiences: Array.isArray(data.experiences)
      ? (data.experiences as Record<string, unknown>[]).map((e) => ({
          id: String(e.id ?? ""),
          company: readText(e.company),
          role: readText(e.role),
          start_date: readText(e.start_date),
          end_date: readText(e.end_date),
          location: readText(e.location),
          bullets: readTextArray(e.bullets),
          tags: readTextArray(e.tags),
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? (data.projects as Record<string, unknown>[]).map((p) => ({
          id: String(p.id ?? ""),
          name: readText(p.name),
          description: readText(p.description),
          tech_stack: readTextArray(p.tech_stack),
          bullets: readTextArray(p.bullets),
          tags: readTextArray(p.tags),
        }))
      : [],
    education: Array.isArray(data.education)
      ? (data.education as Record<string, unknown>[]).map((ed) => ({
          id: String(ed.id ?? ""),
          institution: readText(ed.institution),
          degree: readText(ed.degree),
          start_date: readText(ed.start_date),
          end_date: readText(ed.end_date),
          details: readText(ed.details),
        }))
      : [],
    achievements: Array.isArray(data.achievements)
      ? (data.achievements as Record<string, unknown>[]).map((achievement) => ({
          id: String(achievement.id ?? ""),
          title: readText(achievement.title),
          description: readText(achievement.description),
          link_url: readText(achievement.link_url),
          link_label: readText(achievement.link_label),
        }))
      : [],
    skills: Array.isArray(data.skills)
      ? (data.skills as Record<string, unknown>[]).map((sk) => ({
          id: String(sk.id ?? ""),
          name: readText(sk.name),
          category: readText(sk.category),
          level: readText(sk.level),
        }))
      : [],
  }
}
