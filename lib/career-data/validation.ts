import type { PersonalData } from "@/lib/career-data/types"
import type {
  AchievementDraft,
  ContactDraft,
  EducationDraft,
  ExperienceDraft,
  ProjectDraft,
  SkillDraft,
} from "@/lib/career-data/drafts"
import { splitCommaInput, splitMultilineInput } from "@/lib/career-data/serializers"

export type PersonalErrors = {
  full_name?: string
}

export type ContactErrorState = {
  type?: string
  value?: string
}

export type ExperienceErrorState = {
  company?: string
  role?: string
}

export type ProjectErrorState = {
  name?: string
}

export type EducationErrorState = {
  institution?: string
  degree?: string
}

export type AchievementErrorState = {
  title?: string
}

export type SkillErrorState = {
  name?: string
  category?: string
}

export type DraftErrorMap<T> = Record<string, T>

function hasText(value: string) {
  return Boolean(value.trim())
}

export function validatePersonal(personal: PersonalData): PersonalErrors {
  return {
    full_name: hasText(personal.full_name) ? undefined : "Enter your full name.",
  }
}

export function isBlankContact(contact: ContactDraft) {
  return !hasText(contact.type) && !hasText(contact.value)
}

export function validateContact(contact: ContactDraft): ContactErrorState {
  if (isBlankContact(contact)) {
    return {}
  }

  return {
    type: hasText(contact.value) && !hasText(contact.type) ? "Select a contact type." : undefined,
    value: hasText(contact.type) && !hasText(contact.value) ? "Enter a contact value." : undefined,
  }
}

export function isBlankExperience(experience: ExperienceDraft) {
  return ![
    experience.company,
    experience.role,
    experience.start_date,
    experience.end_date,
    experience.location,
    experience.bullets_text,
    experience.tags_text,
  ].some(hasText)
}

export function validateExperience(experience: ExperienceDraft): ExperienceErrorState {
  if (isBlankExperience(experience)) {
    return {}
  }

  return {
    company: hasText(experience.company) ? undefined : "Enter the company name.",
    role: hasText(experience.role) ? undefined : "Enter your role.",
  }
}

export function isBlankProject(project: ProjectDraft) {
  return ![
    project.name,
    project.description,
    project.tech_stack_text,
    project.bullets_text,
    project.tags_text,
  ].some(hasText)
}

export function validateProject(project: ProjectDraft): ProjectErrorState {
  if (isBlankProject(project)) {
    return {}
  }

  return {
    name: hasText(project.name) ? undefined : "Enter a project name.",
  }
}

export function isBlankEducation(education: EducationDraft) {
  return ![
    education.institution,
    education.degree,
    education.start_date,
    education.end_date,
    education.details,
  ].some(hasText)
}

export function validateEducation(education: EducationDraft): EducationErrorState {
  if (isBlankEducation(education)) {
    return {}
  }

  return {
    institution: hasText(education.institution) ? undefined : "Enter the school or institution.",
    degree: hasText(education.degree) ? undefined : "Enter the degree or program.",
  }
}

export function isBlankAchievement(achievement: AchievementDraft) {
  return ![
    achievement.title,
    achievement.description,
    achievement.link_url,
    achievement.link_label,
  ].some(hasText)
}

export function validateAchievement(achievement: AchievementDraft): AchievementErrorState {
  if (isBlankAchievement(achievement)) {
    return {}
  }

  return {
    title: hasText(achievement.title) ? undefined : "Enter an achievement title.",
  }
}

export function isBlankSkill(skill: SkillDraft) {
  return ![skill.name, skill.category, skill.level].some(hasText)
}

export function validateSkill(skill: SkillDraft): SkillErrorState {
  if (isBlankSkill(skill)) {
    return {}
  }

  return {
    name: hasText(skill.name) ? undefined : "Enter a skill name.",
    category: hasText(skill.category) ? undefined : "Select a skill category.",
  }
}

export function hasValidationError<T extends Record<string, string | undefined>>(errors: T) {
  return Object.values(errors).some(Boolean)
}

export function countMeaningfulLines(value: string) {
  return splitMultilineInput(value).length
}

export function countMeaningfulTags(value: string) {
  return splitCommaInput(value).length
}
