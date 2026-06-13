import type { RegionStandard } from "./types"

export const international: RegionStandard = {
  id: "international",
  name: "International (Fallback)",
  section_order: ["contacts", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone required" },
    { section: "experiences", required: true },
    { section: "education", required: false },
  ],
  formatting: {
    photo: { included: false },
    dateOfBirth: "optional",
    nationality: "optional",
    maritalStatus: "optional",
    linkedin: "optional",
    github: "optional",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "both" },
  content_emphasis: {
    highlights: [
      "clear structure",
      "quantified achievements",
      "action verbs",
      "relevance to role",
    ],
    omit: [
      "unnecessary personal details",
      "sensitive information",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "International resumes vary by region; aim for 1-2 pages of relevant content",
  },
}
