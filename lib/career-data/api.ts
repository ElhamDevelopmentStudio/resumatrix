import type {
  AchievementData,
  AchievementPayload,
  ApiResponse,
  CareerWorkspaceData,
  ContactData,
  ContactPayload,
  EducationData,
  EducationPayload,
  ExperienceData,
  ExperiencePayload,
  PersonalData,
  ProjectData,
  ProjectPayload,
  SkillData,
  SkillPayload,
} from "@/lib/career-data/types"

async function requestData<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : null),
      ...init?.headers,
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message ?? "We couldn’t save your changes right now.")
  }

  return payload.data
}

export function fetchPersonal() {
  return requestData<PersonalData>("/api/personal", { cache: "no-store" })
}

export function updatePersonal(personal: PersonalData) {
  return requestData<PersonalData>("/api/personal", {
    method: "PUT",
    body: JSON.stringify(personal),
  })
}

export function fetchContacts() {
  return requestData<ContactData[]>("/api/contacts", { cache: "no-store" })
}

export function createContact(contact: ContactPayload) {
  return requestData<ContactData>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(contact),
  })
}

export function updateContact(id: string, contact: ContactPayload) {
  return requestData<ContactData>(`/api/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(contact),
  })
}

export function deleteContact(id: string) {
  return requestData<{ id: string }>(`/api/contacts/${id}`, {
    method: "DELETE",
  })
}

export function fetchExperiences() {
  return requestData<ExperienceData[]>("/api/experiences", { cache: "no-store" })
}

export function createExperience(experience: ExperiencePayload) {
  return requestData<ExperienceData>("/api/experiences", {
    method: "POST",
    body: JSON.stringify(experience),
  })
}

export function updateExperience(id: string, experience: ExperiencePayload) {
  return requestData<ExperienceData>(`/api/experiences/${id}`, {
    method: "PUT",
    body: JSON.stringify(experience),
  })
}

export function deleteExperience(id: string) {
  return requestData<{ id: string }>(`/api/experiences/${id}`, {
    method: "DELETE",
  })
}

export function fetchProjects() {
  return requestData<ProjectData[]>("/api/projects", { cache: "no-store" })
}

export function createProject(project: ProjectPayload) {
  return requestData<ProjectData>("/api/projects", {
    method: "POST",
    body: JSON.stringify(project),
  })
}

export function updateProject(id: string, project: ProjectPayload) {
  return requestData<ProjectData>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(project),
  })
}

export function deleteProject(id: string) {
  return requestData<{ id: string }>(`/api/projects/${id}`, {
    method: "DELETE",
  })
}

export function fetchEducation() {
  return requestData<EducationData[]>("/api/education", { cache: "no-store" })
}

export function createEducation(education: EducationPayload) {
  return requestData<EducationData>("/api/education", {
    method: "POST",
    body: JSON.stringify(education),
  })
}

export function updateEducation(id: string, education: EducationPayload) {
  return requestData<EducationData>(`/api/education/${id}`, {
    method: "PUT",
    body: JSON.stringify(education),
  })
}

export function deleteEducation(id: string) {
  return requestData<{ id: string }>(`/api/education/${id}`, {
    method: "DELETE",
  })
}

export function fetchAchievements() {
  return requestData<AchievementData[]>("/api/achievements", { cache: "no-store" })
}

export function createAchievement(achievement: AchievementPayload) {
  return requestData<AchievementData>("/api/achievements", {
    method: "POST",
    body: JSON.stringify(achievement),
  })
}

export function updateAchievement(id: string, achievement: AchievementPayload) {
  return requestData<AchievementData>(`/api/achievements/${id}`, {
    method: "PUT",
    body: JSON.stringify(achievement),
  })
}

export function deleteAchievement(id: string) {
  return requestData<{ id: string }>(`/api/achievements/${id}`, {
    method: "DELETE",
  })
}

export function fetchSkills() {
  return requestData<SkillData[]>("/api/skills", { cache: "no-store" })
}

export function createSkill(skill: SkillPayload) {
  return requestData<SkillData>("/api/skills", {
    method: "POST",
    body: JSON.stringify(skill),
  })
}

export function updateSkill(id: string, skill: SkillPayload) {
  return requestData<SkillData>(`/api/skills/${id}`, {
    method: "PUT",
    body: JSON.stringify(skill),
  })
}

export function deleteSkill(id: string) {
  return requestData<{ id: string }>(`/api/skills/${id}`, {
    method: "DELETE",
  })
}

export async function fetchCareerWorkspace(): Promise<CareerWorkspaceData> {
  const [personal, contacts, experiences, projects, education, achievements, skills] = await Promise.all([
    fetchPersonal(),
    fetchContacts(),
    fetchExperiences(),
    fetchProjects(),
    fetchEducation(),
    fetchAchievements(),
    fetchSkills(),
  ])

  return {
    personal,
    contacts,
    experiences,
    projects,
    education,
    achievements,
    skills,
  }
}
