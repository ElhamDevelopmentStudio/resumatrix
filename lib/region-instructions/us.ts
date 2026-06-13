import type { RegionStandard } from "./types"

export const us: RegionStandard = {
  id: "us",
  name: "United States",
  section_order: ["contacts", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone required" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: false },
    dateOfBirth: "never",
    nationality: "never",
    maritalStatus: "never",
    linkedin: "recommended",
    github: "recommended",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "both" },
  content_emphasis: {
    highlights: [
      "quantified achievements",
      "action verbs",
      "leadership",
      "impact",
    ],
    omit: [
      "personal details",
      "photo",
      "age",
      "marital status",
      "religious affiliation",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "US resumes are typically 1-2 pages",
  },
}
