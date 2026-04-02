import { formatDistanceToNow } from "date-fns"

import type { CvExportFormat, CvOverrideSection, CvPreview } from "@/lib/cvs/types"

const sectionLabels: Record<CvOverrideSection, string> = {
  contacts: "Contacts",
  experiences: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
}

const exportLabels: Record<CvExportFormat, string> = {
  pdf: "PDF",
  html: "HTML",
  markdown: "Markdown",
  json: "JSON",
}

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

export function buildCvCoverageSummary(preview: CvPreview) {
  return [
    formatCount(preview.experienceCount, "experience"),
    formatCount(preview.projectCount, "project"),
    formatCount(preview.skillCount, "skill"),
  ].join(" • ")
}

export function formatCvUpdatedAt(value: string) {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true })
  } catch {
    return "Recently updated"
  }
}

export function getCvSectionLabel(section: CvOverrideSection) {
  return sectionLabels[section]
}

export function getCvExportLabel(format: CvExportFormat) {
  return exportLabels[format]
}
