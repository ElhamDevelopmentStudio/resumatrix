export type PersonalData = {
  full_name: string
  title: string
  summary: string
}

export type ContactData = {
  id: string
  type: string
  value: string
}

export type ExperienceData = {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string
  location: string
  bullets: string[]
  tags: string[]
}

export type ProjectData = {
  id: string
  name: string
  description: string
  tech_stack: string[]
  bullets: string[]
  tags: string[]
}

export type EducationData = {
  id: string
  institution: string
  degree: string
  start_date: string
  end_date: string
  details: string
}

export type SkillData = {
  id: string
  name: string
  category: string
  level: string
}

export type ContactPayload = Omit<ContactData, "id">
export type ExperiencePayload = Omit<ExperienceData, "id">
export type ProjectPayload = Omit<ProjectData, "id">
export type EducationPayload = Omit<EducationData, "id">
export type SkillPayload = Omit<SkillData, "id">

export type CareerWorkspaceData = {
  personal: PersonalData
  contacts: ContactData[]
  experiences: ExperienceData[]
  projects: ProjectData[]
  education: EducationData[]
  skills: SkillData[]
}

export type ApiError = {
  message: string
  code: string
}

export type ApiSuccess<T> = {
  success: true
  data: T
  error: null
}

export type ApiFailure = {
  success: false
  data: null
  error: ApiError
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export const emptyPersonalData: PersonalData = {
  full_name: "",
  title: "",
  summary: "",
}

export const contactTypeOptions = [
  "Email",
  "Phone",
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "X / Twitter",
] as const

export const skillCategoryOptions = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Mobile",
  "DevOps",
  "Data",
  "Design",
  "Tools",
] as const

export const skillLevelOptions = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const

export type SectionKey =
  | "personal"
  | "contacts"
  | "experiences"
  | "projects"
  | "education"
  | "skills"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export type SectionMeta = {
  status: SaveStatus
  lastSavedAt: number | null
  errorMessage: string | null
}
