import {
  joinCommaInput,
  joinMultilineInput,
  splitCommaInput,
  splitMultilineInput,
} from "@/lib/career-data/serializers"
import type {
  ContactData,
  ContactPayload,
  EducationData,
  EducationPayload,
  ExperienceData,
  ExperiencePayload,
  ProjectData,
  ProjectPayload,
  SkillData,
  SkillPayload,
} from "@/lib/career-data/types"

function buildClientId() {
  return globalThis.crypto?.randomUUID?.() ?? `draft-${Math.random().toString(16).slice(2)}`
}

export type ContactDraft = {
  clientId: string
  id: string | null
  type: string
  value: string
}

export type ExperienceDraft = {
  clientId: string
  id: string | null
  company: string
  role: string
  start_date: string
  end_date: string
  location: string
  bullets_text: string
  tags_text: string
}

export type ProjectDraft = {
  clientId: string
  id: string | null
  name: string
  description: string
  tech_stack_text: string
  bullets_text: string
  tags_text: string
}

export type EducationDraft = {
  clientId: string
  id: string | null
  institution: string
  degree: string
  start_date: string
  end_date: string
  details: string
}

export type SkillDraft = {
  clientId: string
  id: string | null
  name: string
  category: string
  level: string
}

export function buildBlankContact(): ContactDraft {
  return {
    clientId: buildClientId(),
    id: null,
    type: "",
    value: "",
  }
}

export function buildBlankExperience(): ExperienceDraft {
  return {
    clientId: buildClientId(),
    id: null,
    company: "",
    role: "",
    start_date: "",
    end_date: "",
    location: "",
    bullets_text: "",
    tags_text: "",
  }
}

export function buildBlankProject(): ProjectDraft {
  return {
    clientId: buildClientId(),
    id: null,
    name: "",
    description: "",
    tech_stack_text: "",
    bullets_text: "",
    tags_text: "",
  }
}

export function buildBlankEducation(): EducationDraft {
  return {
    clientId: buildClientId(),
    id: null,
    institution: "",
    degree: "",
    start_date: "",
    end_date: "",
    details: "",
  }
}

export function buildBlankSkill(): SkillDraft {
  return {
    clientId: buildClientId(),
    id: null,
    name: "",
    category: "",
    level: "",
  }
}

export function toContactDraft(contact: ContactData): ContactDraft {
  return {
    clientId: contact.id,
    id: contact.id,
    type: contact.type,
    value: contact.value,
  }
}

export function toContactPayload(contact: ContactDraft): ContactPayload {
  return {
    type: contact.type.trim(),
    value: contact.value.trim(),
  }
}

export function toExperienceDraft(experience: ExperienceData): ExperienceDraft {
  return {
    clientId: experience.id,
    id: experience.id,
    company: experience.company,
    role: experience.role,
    start_date: experience.start_date,
    end_date: experience.end_date,
    location: experience.location,
    bullets_text: joinMultilineInput(experience.bullets),
    tags_text: joinCommaInput(experience.tags),
  }
}

export function toExperiencePayload(experience: ExperienceDraft): ExperiencePayload {
  return {
    company: experience.company.trim(),
    role: experience.role.trim(),
    start_date: experience.start_date.trim(),
    end_date: experience.end_date.trim(),
    location: experience.location.trim(),
    bullets: splitMultilineInput(experience.bullets_text),
    tags: splitCommaInput(experience.tags_text),
  }
}

export function toProjectDraft(project: ProjectData): ProjectDraft {
  return {
    clientId: project.id,
    id: project.id,
    name: project.name,
    description: project.description,
    tech_stack_text: joinCommaInput(project.tech_stack),
    bullets_text: joinMultilineInput(project.bullets),
    tags_text: joinCommaInput(project.tags),
  }
}

export function toProjectPayload(project: ProjectDraft): ProjectPayload {
  return {
    name: project.name.trim(),
    description: project.description.trim(),
    tech_stack: splitCommaInput(project.tech_stack_text),
    bullets: splitMultilineInput(project.bullets_text),
    tags: splitCommaInput(project.tags_text),
  }
}

export function toEducationDraft(education: EducationData): EducationDraft {
  return {
    clientId: education.id,
    id: education.id,
    institution: education.institution,
    degree: education.degree,
    start_date: education.start_date,
    end_date: education.end_date,
    details: education.details,
  }
}

export function toEducationPayload(education: EducationDraft): EducationPayload {
  return {
    institution: education.institution.trim(),
    degree: education.degree.trim(),
    start_date: education.start_date.trim(),
    end_date: education.end_date.trim(),
    details: education.details.trim(),
  }
}

export function toSkillDraft(skill: SkillData): SkillDraft {
  return {
    clientId: skill.id,
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
  }
}

export function toSkillPayload(skill: SkillDraft): SkillPayload {
  return {
    name: skill.name.trim(),
    category: skill.category.trim(),
    level: skill.level.trim(),
  }
}
