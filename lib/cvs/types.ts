import type {
  ContactData,
  EducationData,
  ExperienceData,
  AchievementData,
  PersonalData,
  ProjectData,
  SkillData,
} from "@/lib/career-data/types"

export type CvOverrideSection =
  | "contacts"
  | "experiences"
  | "projects"
  | "education"
  | "achievements"
  | "skills"

export type CvExportFormat = "pdf" | "html" | "json" | "markdown"

export type CvSelections = {
  contacts: string[] | null
  experiences: string[] | null
  projects: string[] | null
  education: string[] | null
  achievements: string[] | null
  skills: string[] | null
}

export type CvPersonalContentOverride = Partial<PersonalData>
export type CvContactContentOverride = Partial<Pick<ContactData, "type" | "value">>
export type CvExperienceContentOverride = Partial<
  Pick<ExperienceData, "company" | "role" | "start_date" | "end_date" | "location" | "bullets">
>
export type CvProjectContentOverride = Partial<
  Pick<ProjectData, "name" | "description" | "tech_stack" | "bullets">
>
export type CvEducationContentOverride = Partial<
  Pick<EducationData, "institution" | "degree" | "start_date" | "end_date" | "details">
>
export type CvAchievementContentOverride = Partial<
  Pick<AchievementData, "title" | "description" | "link_url" | "link_label">
>
export type CvSkillContentOverride = Partial<Pick<SkillData, "name" | "category" | "level">>

export type CvContentOverrides = {
  personal: CvPersonalContentOverride
  contacts: Record<string, CvContactContentOverride>
  experiences: Record<string, CvExperienceContentOverride>
  projects: Record<string, CvProjectContentOverride>
  education: Record<string, CvEducationContentOverride>
  achievements: Record<string, CvAchievementContentOverride>
  skills: Record<string, CvSkillContentOverride>
}

export type CvOverrides = {
  hidden_sections: CvOverrideSection[]
  section_order: CvOverrideSection[]
  selections: CvSelections
  content: CvContentOverrides
}

export type CvData = {
  id: string
  name: string
  profile_id: string
  template_id: string
  region_id: string
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
export type CvRenderAchievement = AchievementData

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
  achievements: CvRenderAchievement[]
  skills: CvRenderSkill[]
  section_order: CvOverrideSection[]
  hidden_sections: CvOverrideSection[]
}

export type CvPreview = {
  contactCount: number
  experienceCount: number
  projectCount: number
  educationCount: number
  achievementCount: number
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
  "achievements",
  "skills",
]

export const emptyCvContentOverrides: CvContentOverrides = {
  personal: {},
  contacts: {},
  experiences: {},
  projects: {},
  education: {},
  achievements: {},
  skills: {},
}

export const defaultCvOverrides: CvOverrides = {
  hidden_sections: [],
  section_order: [...cvOverrideSections],
  selections: {
    contacts: null,
    experiences: null,
    projects: null,
    education: null,
    achievements: null,
    skills: null,
  },
  content: emptyCvContentOverrides,
}

export const emptyCvPayload: CvPayload = {
  name: "",
  profile_id: "",
  template_id: "",
  region_id: "",
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
