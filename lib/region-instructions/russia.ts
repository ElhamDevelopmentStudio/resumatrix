import type { RegionStandard } from "./types"

export const russia: RegionStandard = {
  id: "ru",
  name: "Russia",
  section_order: ["contacts", "personal", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Full name, email, phone, address required" },
    { section: "personal", required: true, note: "Date of birth, nationality, marital status common" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: true, position: "top" },
    dateOfBirth: "required",
    nationality: "required",
    maritalStatus: "optional",
    linkedin: "optional",
    github: "optional",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "action_verbs" },
  content_emphasis: {
    highlights: [
      "photo",
      "date of birth",
      "nationality",
      "marital status",
      "military service (men)",
      "Russian language skills",
    ],
    omit: [
      "religious affiliation",
      "health information",
      "ID document numbers",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "Russian резюме (resume) are typically 1-2 pages; longer for academic positions",
  },
}
