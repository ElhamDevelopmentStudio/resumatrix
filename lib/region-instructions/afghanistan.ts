import type { RegionStandard } from "./types"

export const afghanistan: RegionStandard = {
  id: "af",
  name: "Afghanistan",
  section_order: ["contacts", "personal", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Full name prominently at top, email, phone" },
    { section: "personal", required: true, note: "Father name, tribal/ethnic affiliation sometimes included" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: true, position: "top" },
    dateOfBirth: "optional",
    nationality: "required",
    maritalStatus: "optional",
    linkedin: "optional",
    github: "optional",
    portfolio: "optional",
  },
  bullet_style: { emphasis: "action_verbs" },
  content_emphasis: {
    highlights: [
      "full name with father name",
      "tribal/ethnic affiliation",
      " Dari or Pashto language",
      "Islamic calendar date (optional)",
      "photo",
    ],
    omit: [
      "religious affiliation (assumed Muslim)",
      "military service (unless relevant)",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "Afghan CVs are typically 1-2 pages; longer for academic or government positions",
  },
}
