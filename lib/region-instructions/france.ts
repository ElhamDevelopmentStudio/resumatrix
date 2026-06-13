import type { RegionStandard } from "./types"

export const france: RegionStandard = {
  id: "fr",
  name: "France",
  section_order: ["contacts", "personal", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone, address required" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: true, position: "top" },
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
      "photo (traditionally included)",
      "age or birthdate",
      "birthplace",
      "French language proficiency",
      "nationality",
    ],
    omit: [
      "religious affiliation",
      "health information",
      "marital status (increasingly optional)",
    ],
  },
  length_expectations: {
    pages: 1,
    reason: "French CVs (CV) are typically 1 page; 2 pages accepted for senior or academic roles",
  },
}
