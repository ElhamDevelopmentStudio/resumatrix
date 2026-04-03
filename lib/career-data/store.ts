import "server-only"

import { randomUUID } from "node:crypto"

import { unstable_noStore as noStore } from "next/cache"

import {
  emptyPersonalData,
  type CareerWorkspaceData,
  type ContactData,
  type ContactPayload,
  type EducationData,
  type EducationPayload,
  type ExperienceData,
  type ExperiencePayload,
  type PersonalData,
  type ProjectData,
  type ProjectPayload,
  type SkillData,
  type SkillPayload,
} from "@/lib/career-data/types"
import { createConvexClient } from "@/lib/convex/client"
import { convexFunctionReferences } from "@/lib/convex/function-references"

type CollectionKey = "contacts" | "experiences" | "projects" | "education" | "skills"

type CollectionItem<K extends CollectionKey> = CareerWorkspaceData[K][number]
type CollectionPayload<K extends CollectionKey> = Omit<CollectionItem<K>, "id">

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function readTextArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function buildDefaultWorkspace(): CareerWorkspaceData {
  return {
    personal: { ...emptyPersonalData },
    contacts: [],
    experiences: [],
    projects: [],
    education: [],
    skills: [],
  }
}

function sanitizePersonal(value: unknown): PersonalData {
  if (!value || typeof value !== "object") {
    return { ...emptyPersonalData }
  }

  const nextValue = value as Partial<PersonalData>

  return {
    full_name: readText(nextValue.full_name),
    title: readText(nextValue.title),
    summary: readText(nextValue.summary),
  }
}

function sanitizeContacts(value: unknown): ContactData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (contact): contact is ContactData =>
        typeof contact?.id === "string" &&
        typeof contact?.type === "string" &&
        typeof contact?.value === "string"
    )
    .map((contact) => ({
      id: contact.id,
      type: readText(contact.type),
      value: readText(contact.value),
    }))
}

function sanitizeExperiences(value: unknown): ExperienceData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (experience): experience is ExperienceData =>
        typeof experience?.id === "string" &&
        typeof experience?.company === "string" &&
        typeof experience?.role === "string"
    )
    .map((experience) => ({
      id: experience.id,
      company: readText(experience.company),
      role: readText(experience.role),
      start_date: readText(experience.start_date),
      end_date: readText(experience.end_date),
      location: readText(experience.location),
      bullets: readTextArray(experience.bullets),
      tags: readTextArray(experience.tags),
    }))
}

function sanitizeProjects(value: unknown): ProjectData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (project): project is ProjectData =>
        typeof project?.id === "string" && typeof project?.name === "string"
    )
    .map((project) => ({
      id: project.id,
      name: readText(project.name),
      description: readText(project.description),
      tech_stack: readTextArray(project.tech_stack),
      bullets: readTextArray(project.bullets),
      tags: readTextArray(project.tags),
    }))
}

function sanitizeEducation(value: unknown): EducationData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (education): education is EducationData =>
        typeof education?.id === "string" &&
        typeof education?.institution === "string" &&
        typeof education?.degree === "string"
    )
    .map((education) => ({
      id: education.id,
      institution: readText(education.institution),
      degree: readText(education.degree),
      start_date: readText(education.start_date),
      end_date: readText(education.end_date),
      details: readText(education.details),
    }))
}

function sanitizeSkills(value: unknown): SkillData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (skill): skill is SkillData =>
        typeof skill?.id === "string" && typeof skill?.name === "string"
    )
    .map((skill) => ({
      id: skill.id,
      name: readText(skill.name),
      category: readText(skill.category),
      level: readText(skill.level),
    }))
}

function sanitizeWorkspace(value: unknown): CareerWorkspaceData {
  if (!value || typeof value !== "object") {
    return buildDefaultWorkspace()
  }

  const nextValue = value as Partial<CareerWorkspaceData>

  return {
    personal: sanitizePersonal(nextValue.personal),
    contacts: sanitizeContacts(nextValue.contacts),
    experiences: sanitizeExperiences(nextValue.experiences),
    projects: sanitizeProjects(nextValue.projects),
    education: sanitizeEducation(nextValue.education),
    skills: sanitizeSkills(nextValue.skills),
  }
}

function getConvexClient() {
  return createConvexClient()
}

async function listCollection<K extends CollectionKey>(key: K): Promise<CareerWorkspaceData[K]> {
  noStore()
  const client = getConvexClient()

  switch (key) {
    case "contacts":
      return sanitizeContacts(
        await client.query(convexFunctionReferences.careerData.listContacts, {})
      ) as CareerWorkspaceData[K]
    case "experiences":
      return sanitizeExperiences(
        await client.query(convexFunctionReferences.careerData.listExperiences, {})
      ) as CareerWorkspaceData[K]
    case "projects":
      return sanitizeProjects(
        await client.query(convexFunctionReferences.careerData.listProjects, {})
      ) as CareerWorkspaceData[K]
    case "education":
      return sanitizeEducation(
        await client.query(convexFunctionReferences.careerData.listEducation, {})
      ) as CareerWorkspaceData[K]
    case "skills":
      return sanitizeSkills(
        await client.query(convexFunctionReferences.careerData.listSkills, {})
      ) as CareerWorkspaceData[K]
    default:
      return [] as CareerWorkspaceData[K]
  }
}

async function createCollectionItem<K extends CollectionKey>(
  key: K,
  payload: CollectionPayload<K>
): Promise<CollectionItem<K>> {
  const client = getConvexClient()

  switch (key) {
    case "contacts": {
      const nextItem: ContactData = {
        id: randomUUID(),
        type: readText((payload as unknown as ContactPayload).type),
        value: readText((payload as unknown as ContactPayload).value),
      }

      return sanitizeContacts([
        await client.mutation(convexFunctionReferences.careerData.createContact, nextItem),
      ])[0] as CollectionItem<K>
    }
    case "experiences": {
      const nextItem: ExperienceData = {
        id: randomUUID(),
        company: readText((payload as unknown as ExperiencePayload).company),
        role: readText((payload as unknown as ExperiencePayload).role),
        start_date: readText((payload as unknown as ExperiencePayload).start_date),
        end_date: readText((payload as unknown as ExperiencePayload).end_date),
        location: readText((payload as unknown as ExperiencePayload).location),
        bullets: readTextArray((payload as unknown as ExperiencePayload).bullets),
        tags: readTextArray((payload as unknown as ExperiencePayload).tags),
      }

      return sanitizeExperiences([
        await client.mutation(convexFunctionReferences.careerData.createExperience, nextItem),
      ])[0] as CollectionItem<K>
    }
    case "projects": {
      const nextItem: ProjectData = {
        id: randomUUID(),
        name: readText((payload as unknown as ProjectPayload).name),
        description: readText((payload as unknown as ProjectPayload).description),
        tech_stack: readTextArray((payload as unknown as ProjectPayload).tech_stack),
        bullets: readTextArray((payload as unknown as ProjectPayload).bullets),
        tags: readTextArray((payload as unknown as ProjectPayload).tags),
      }

      return sanitizeProjects([
        await client.mutation(convexFunctionReferences.careerData.createProject, nextItem),
      ])[0] as CollectionItem<K>
    }
    case "education": {
      const nextItem: EducationData = {
        id: randomUUID(),
        institution: readText((payload as unknown as EducationPayload).institution),
        degree: readText((payload as unknown as EducationPayload).degree),
        start_date: readText((payload as unknown as EducationPayload).start_date),
        end_date: readText((payload as unknown as EducationPayload).end_date),
        details: readText((payload as unknown as EducationPayload).details),
      }

      return sanitizeEducation([
        await client.mutation(convexFunctionReferences.careerData.createEducation, nextItem),
      ])[0] as CollectionItem<K>
    }
    case "skills": {
      const nextItem: SkillData = {
        id: randomUUID(),
        name: readText((payload as unknown as SkillPayload).name),
        category: readText((payload as unknown as SkillPayload).category),
        level: readText((payload as unknown as SkillPayload).level),
      }

      return sanitizeSkills([
        await client.mutation(convexFunctionReferences.careerData.createSkill, nextItem),
      ])[0] as CollectionItem<K>
    }
    default:
      throw new Error(`Unsupported collection: ${key}`)
  }
}

async function updateCollectionItem<K extends CollectionKey>(
  key: K,
  id: string,
  payload: CollectionPayload<K>
): Promise<CollectionItem<K> | null> {
  const client = getConvexClient()

  switch (key) {
    case "contacts": {
      const nextPayload: ContactPayload = {
        type: readText((payload as unknown as ContactPayload).type),
        value: readText((payload as unknown as ContactPayload).value),
      }
      const contact = await client.mutation(convexFunctionReferences.careerData.updateContact, {
        id,
        payload: nextPayload,
      })
      return sanitizeContacts(contact ? [contact] : [])[0] as CollectionItem<K> | null
    }
    case "experiences": {
      const nextPayload: ExperiencePayload = {
        company: readText((payload as unknown as ExperiencePayload).company),
        role: readText((payload as unknown as ExperiencePayload).role),
        start_date: readText((payload as unknown as ExperiencePayload).start_date),
        end_date: readText((payload as unknown as ExperiencePayload).end_date),
        location: readText((payload as unknown as ExperiencePayload).location),
        bullets: readTextArray((payload as unknown as ExperiencePayload).bullets),
        tags: readTextArray((payload as unknown as ExperiencePayload).tags),
      }
      const experience = await client.mutation(convexFunctionReferences.careerData.updateExperience, {
        id,
        payload: nextPayload,
      })
      return sanitizeExperiences(experience ? [experience] : [])[0] as CollectionItem<K> | null
    }
    case "projects": {
      const nextPayload: ProjectPayload = {
        name: readText((payload as unknown as ProjectPayload).name),
        description: readText((payload as unknown as ProjectPayload).description),
        tech_stack: readTextArray((payload as unknown as ProjectPayload).tech_stack),
        bullets: readTextArray((payload as unknown as ProjectPayload).bullets),
        tags: readTextArray((payload as unknown as ProjectPayload).tags),
      }
      const project = await client.mutation(convexFunctionReferences.careerData.updateProject, {
        id,
        payload: nextPayload,
      })
      return sanitizeProjects(project ? [project] : [])[0] as CollectionItem<K> | null
    }
    case "education": {
      const nextPayload: EducationPayload = {
        institution: readText((payload as unknown as EducationPayload).institution),
        degree: readText((payload as unknown as EducationPayload).degree),
        start_date: readText((payload as unknown as EducationPayload).start_date),
        end_date: readText((payload as unknown as EducationPayload).end_date),
        details: readText((payload as unknown as EducationPayload).details),
      }
      const education = await client.mutation(convexFunctionReferences.careerData.updateEducation, {
        id,
        payload: nextPayload,
      })
      return sanitizeEducation(education ? [education] : [])[0] as CollectionItem<K> | null
    }
    case "skills": {
      const nextPayload: SkillPayload = {
        name: readText((payload as unknown as SkillPayload).name),
        category: readText((payload as unknown as SkillPayload).category),
        level: readText((payload as unknown as SkillPayload).level),
      }
      const skill = await client.mutation(convexFunctionReferences.careerData.updateSkill, {
        id,
        payload: nextPayload,
      })
      return sanitizeSkills(skill ? [skill] : [])[0] as CollectionItem<K> | null
    }
    default:
      return null
  }
}

async function deleteCollectionItem<K extends CollectionKey>(
  key: K,
  id: string
): Promise<CollectionItem<K> | null> {
  const client = getConvexClient()

  switch (key) {
    case "contacts": {
      const contact = await client.mutation(convexFunctionReferences.careerData.deleteContact, { id })
      return sanitizeContacts(contact ? [contact] : [])[0] as CollectionItem<K> | null
    }
    case "experiences": {
      const experience = await client.mutation(convexFunctionReferences.careerData.deleteExperience, {
        id,
      })
      return sanitizeExperiences(experience ? [experience] : [])[0] as CollectionItem<K> | null
    }
    case "projects": {
      const project = await client.mutation(convexFunctionReferences.careerData.deleteProject, { id })
      return sanitizeProjects(project ? [project] : [])[0] as CollectionItem<K> | null
    }
    case "education": {
      const education = await client.mutation(convexFunctionReferences.careerData.deleteEducation, { id })
      return sanitizeEducation(education ? [education] : [])[0] as CollectionItem<K> | null
    }
    case "skills": {
      const skill = await client.mutation(convexFunctionReferences.careerData.deleteSkill, { id })
      return sanitizeSkills(skill ? [skill] : [])[0] as CollectionItem<K> | null
    }
    default:
      return null
  }
}

export async function getCareerWorkspaceData() {
  noStore()
  const workspace = await getConvexClient().query(convexFunctionReferences.careerData.getWorkspace, {})
  return sanitizeWorkspace(workspace)
}

export async function getPersonalData() {
  noStore()
  const personal = await getConvexClient().query(convexFunctionReferences.careerData.getPersonal, {})
  return sanitizePersonal(personal)
}

export async function updatePersonalData(personal: PersonalData) {
  const nextPersonal = sanitizePersonal(personal)
  const savedPersonal = await getConvexClient().mutation(
    convexFunctionReferences.careerData.setPersonal,
    nextPersonal
  )

  return sanitizePersonal(savedPersonal)
}

export function listContacts() {
  return listCollection("contacts")
}

export function createContactData(payload: ContactPayload) {
  return createCollectionItem("contacts", payload)
}

export function updateContactData(id: string, payload: ContactPayload) {
  return updateCollectionItem("contacts", id, payload)
}

export function deleteContactData(id: string) {
  return deleteCollectionItem("contacts", id)
}

export function listExperiences() {
  return listCollection("experiences")
}

export function createExperienceData(payload: ExperiencePayload) {
  return createCollectionItem("experiences", payload)
}

export function updateExperienceData(id: string, payload: ExperiencePayload) {
  return updateCollectionItem("experiences", id, payload)
}

export function deleteExperienceData(id: string) {
  return deleteCollectionItem("experiences", id)
}

export function listProjects() {
  return listCollection("projects")
}

export function createProjectData(payload: ProjectPayload) {
  return createCollectionItem("projects", payload)
}

export function updateProjectData(id: string, payload: ProjectPayload) {
  return updateCollectionItem("projects", id, payload)
}

export function deleteProjectData(id: string) {
  return deleteCollectionItem("projects", id)
}

export function listEducationEntries() {
  return listCollection("education")
}

export function createEducationData(payload: EducationPayload) {
  return createCollectionItem("education", payload)
}

export function updateEducationData(id: string, payload: EducationPayload) {
  return updateCollectionItem("education", id, payload)
}

export function deleteEducationData(id: string) {
  return deleteCollectionItem("education", id)
}

export function listSkills() {
  return listCollection("skills")
}

export function createSkillData(payload: SkillPayload) {
  return createCollectionItem("skills", payload)
}

export function updateSkillData(id: string, payload: SkillPayload) {
  return updateCollectionItem("skills", id, payload)
}

export function deleteSkillData(id: string) {
  return deleteCollectionItem("skills", id)
}
