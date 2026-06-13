import type { RegionStandard } from "./types"

export const germany: RegionStandard = {
  id: "de",
  name: "Germany",
  section_order: ["contacts", "personal", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone, address required" },
    { section: "personal", required: true, note: "Date and place of birth, nationality, marital status common" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: true, size: "35x45mm", position: "top" },
    dateOfBirth: "required",
    nationality: "required",
    maritalStatus: "optional",
    linkedin: "optional",
    github: "optional",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "both" },
  content_emphasis: {
    highlights: [
      "detailed work history",
      "German language skills",
      "academic credentials",
      "photo",
      "personal details",
    ],
    omit: [
      "religious affiliation",
      "health information",
      "photo if applying internationally",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "German CVs are typically 2-3 pages; longer for academic or senior positions",
  },
}
