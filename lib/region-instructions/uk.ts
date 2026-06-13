import type { RegionStandard } from "./types"

export const uk: RegionStandard = {
  id: "uk",
  name: "United Kingdom",
  section_order: [
    "personal",
    "contacts",
    "experiences",
    "education",
    "skills",
    "projects",
  ],
  required_sections: [
    { section: "personal", required: true, note: "Personal statement at top (2-3 sentences)" },
    { section: "contacts", required: true, note: "Name, email, phone required" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: false },
    dateOfBirth: "never",
    nationality: "optional",
    maritalStatus: "never",
    linkedin: "recommended",
    github: "optional",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "both" },
  content_emphasis: {
    highlights: [
      "personal statement",
      "career progression",
      "relevant achievements",
      "British spelling and terminology",
    ],
    omit: [
      "photo",
      "age",
      "marital status",
      "religious affiliation",
      "National Insurance number",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "UK CVs are typically 2 pages A4; 1 page for junior roles",
  },
}
