import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

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

type CollectionKey = "contacts" | "experiences" | "projects" | "education" | "skills"

type CollectionItem<K extends CollectionKey> = CareerWorkspaceData[K][number]
type CollectionPayload<K extends CollectionKey> = Omit<CollectionItem<K>, "id">

const dataDirectory = process.env.RESUMATRIX_DATA_DIR ?? path.join(tmpdir(), "resumatrix")
const dataFile = path.join(dataDirectory, "workspace.json")

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

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true })
}

async function readWorkspace(): Promise<CareerWorkspaceData> {
  try {
    const raw = await readFile(dataFile, "utf8")
    const parsed = JSON.parse(raw) as Partial<CareerWorkspaceData>

    return {
      personal: {
        full_name: readText(parsed.personal?.full_name),
        title: readText(parsed.personal?.title),
        summary: readText(parsed.personal?.summary),
      },
      contacts: sanitizeContacts(parsed.contacts),
      experiences: sanitizeExperiences(parsed.experiences),
      projects: sanitizeProjects(parsed.projects),
      education: sanitizeEducation(parsed.education),
      skills: sanitizeSkills(parsed.skills),
    }
  } catch {
    return buildDefaultWorkspace()
  }
}

async function writeWorkspace(workspace: CareerWorkspaceData) {
  await ensureDataDirectory()
  await writeFile(dataFile, JSON.stringify(workspace, null, 2), "utf8")
}

async function listCollection<K extends CollectionKey>(key: K): Promise<CareerWorkspaceData[K]> {
  const workspace = await readWorkspace()
  return workspace[key]
}

async function createCollectionItem<K extends CollectionKey>(
  key: K,
  payload: CollectionPayload<K>
): Promise<CollectionItem<K>> {
  const workspace = await readWorkspace()
  const nextItem = {
    id: randomUUID(),
    ...payload,
  } as CollectionItem<K>

  const nextWorkspace = {
    ...workspace,
    [key]: [...workspace[key], nextItem],
  } as CareerWorkspaceData

  await writeWorkspace(nextWorkspace)

  return nextItem
}

async function updateCollectionItem<K extends CollectionKey>(
  key: K,
  id: string,
  payload: CollectionPayload<K>
): Promise<CollectionItem<K> | null> {
  const workspace = await readWorkspace()
  const itemIndex = workspace[key].findIndex((item) => item.id === id)

  if (itemIndex === -1) {
    return null
  }

  const updatedItem = {
    id,
    ...payload,
  } as CollectionItem<K>

  const nextItems = [...workspace[key]]
  nextItems[itemIndex] = updatedItem

  const nextWorkspace = {
    ...workspace,
    [key]: nextItems,
  } as CareerWorkspaceData

  await writeWorkspace(nextWorkspace)

  return updatedItem
}

async function deleteCollectionItem<K extends CollectionKey>(
  key: K,
  id: string
): Promise<CollectionItem<K> | null> {
  const workspace = await readWorkspace()
  const removedItem = workspace[key].find((item) => item.id === id) ?? null

  if (!removedItem) {
    return null
  }

  const nextWorkspace = {
    ...workspace,
    [key]: workspace[key].filter((item) => item.id !== id),
  } as CareerWorkspaceData

  await writeWorkspace(nextWorkspace)

  return removedItem
}

export async function getCareerWorkspaceData() {
  return readWorkspace()
}

export async function getPersonalData() {
  const workspace = await readWorkspace()
  return workspace.personal
}

export async function updatePersonalData(personal: PersonalData) {
  const workspace = await readWorkspace()
  const nextWorkspace = {
    ...workspace,
    personal,
  }

  await writeWorkspace(nextWorkspace)

  return nextWorkspace.personal
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
