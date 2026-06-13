import type { RegionStandard } from "./types"

export const australia: RegionStandard = {
  id: "au",
  name: "Australia",
  section_order: ["contacts", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone, location (city/state) required" },
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
      "concise presentation",
      "Australian work experience",
      "quantified achievements",
      "working rights (visa status)",
    ],
    omit: [
      "photo",
      "age",
      "marital status",
      "health information",
      "religious affiliation",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "Australian resumes are typically 2-3 pages; 1 page for junior roles",
  },
}
