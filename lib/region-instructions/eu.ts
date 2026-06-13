import type { RegionStandard } from "./types"

export const eu: RegionStandard = {
  id: "eu",
  name: "European Union (Generic)",
  section_order: ["contacts", "personal", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone required" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: false },
    dateOfBirth: "optional",
    nationality: "optional",
    maritalStatus: "optional",
    linkedin: "recommended",
    github: "optional",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "both" },
  content_emphasis: {
    highlights: [
      "Europass-style structure",
      "language skills",
      "EU work authorization",
      "mobile across EU",
    ],
    omit: [
      "photo unless specifically requested",
      "personal interests unless relevant",
      "age",
      "marital status",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "EU CVs vary by country; typically 2-3 pages; Europass format widely accepted",
  },
}
