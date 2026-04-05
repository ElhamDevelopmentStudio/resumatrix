import type { RegionStandard } from "./types"

export const canada: RegionStandard = {
  id: "ca",
  name: "Canada",
  section_order: ["contacts", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone required; French/English bilingualism valued" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: false },
    dateOfBirth: "never",
    nationality: "optional",
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
      "bilingual capabilities",
      "Canadian work experience",
    ],
    omit: [
      "personal details",
      "photo",
      "age",
      "marital status",
      "religious affiliation",
      "公民身份信息",
    ],
  },
  length_expectations: {
    pages: "flexible",
    reason: "Canadian resumes are typically 1-2 pages; 3 pages accepted for senior roles",
  },
}
