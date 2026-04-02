import type {
  ContactData,
  EducationData,
  ExperienceData,
  PersonalData,
  ProjectData,
  SkillData,
} from "@/lib/career-data/types"

export type CvOverrideSection =
  | "contacts"
  | "experiences"
  | "projects"
  | "education"
  | "skills"

export type CvExportFormat = "pdf" | "html" | "json" | "markdown"

export type CvSelections = {
  contacts: string[] | null
  experiences: string[] | null
  projects: string[] | null
  education: string[] | null
  skills: string[] | null
}

export type CvOverrides = {
  hidden_sections: CvOverrideSection[]
  section_order: CvOverrideSection[]
  selections: CvSelections
}

export type CvData = {
  id: string
  name: string
  profile_id: string
  template_id: string
  overrides: CvOverrides
  created_at: string
  updated_at: string
}

export type CvPayload = Omit<CvData, "id" | "created_at" | "updated_at">

export type CvTemplateMetadata = {
  id: string
  slug: string
  name: string
  description: string
  layout_type: "single-column"
  sections: CvOverrideSection[]
  export_formats: CvExportFormat[]
}

export type CvRenderContact = ContactData & {
  label: string
}

export type CvRenderExperience = Omit<ExperienceData, "end_date"> & {
  end_date: string | null
  date_label: string
}

export type CvRenderProject = ProjectData

export type CvRenderEducation = Omit<EducationData, "end_date"> & {
  end_date: string | null
  date_label: string
}

export type CvRenderSkill = SkillData

export type CvRenderModel = {
  meta: {
    cv_id: string
    cv_name: string
    profile_id: string
    profile_name: string
    template_id: string
    template_slug: string
    template_name: string
    updated_at: string
  }
  personal: PersonalData
  contacts: CvRenderContact[]
  experiences: CvRenderExperience[]
  projects: CvRenderProject[]
  education: CvRenderEducation[]
  skills: CvRenderSkill[]
  section_order: CvOverrideSection[]
  hidden_sections: CvOverrideSection[]
}

export type CvPreview = {
  contactCount: number
  experienceCount: number
  projectCount: number
  educationCount: number
  skillCount: number
  totalItemCount: number
  visibleSectionCount: number
  hasContent: boolean
}

export const cvOverrideSections: CvOverrideSection[] = [
  "contacts",
  "experiences",
  "projects",
  "education",
  "skills",
]

export const defaultCvOverrides: CvOverrides = {
  hidden_sections: [],
  section_order: [...cvOverrideSections],
  selections: {
    contacts: null,
    experiences: null,
    projects: null,
    education: null,
    skills: null,
  },
}

export const emptyCvPayload: CvPayload = {
  name: "",
  profile_id: "",
  template_id: "",
  overrides: defaultCvOverrides,
}

export const cvExportFormatOptions: Array<{
  label: string
  value: CvExportFormat
}> = [
  { label: "PDF", value: "pdf" },
  { label: "HTML", value: "html" },
  { label: "Markdown", value: "markdown" },
  { label: "JSON", value: "json" },
]
