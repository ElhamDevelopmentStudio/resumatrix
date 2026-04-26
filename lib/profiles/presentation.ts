import { profileHasActiveRules } from "@/lib/profiles/engine"
import type { ProfileData, ProfilePreview } from "@/lib/profiles/types"

export function formatProfileCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

export function buildProfileCoverageSummary(preview: ProfilePreview) {
  return [
    formatProfileCount(preview.displayedExperiences, "experience"),
    formatProfileCount(preview.displayedProjects, "project"),
    formatProfileCount(preview.achievementCount, "achievement"),
    formatProfileCount(preview.skillsCount, "skill"),
  ].join(" • ")
}

export function buildProfileRuleSummary(profile: ProfileData) {
  const items = [
    profile.include_tags.length ? `${profile.include_tags.length} include tag${profile.include_tags.length === 1 ? "" : "s"}` : null,
    profile.exclude_tags.length ? `${profile.exclude_tags.length} exclude tag${profile.exclude_tags.length === 1 ? "" : "s"}` : null,
    profile.config.limits.experiences ? `keep ${formatProfileCount(profile.config.limits.experiences, "experience")}` : null,
    profile.config.limits.projects ? `keep ${formatProfileCount(profile.config.limits.projects, "project")}` : null,
    profile.config.ordering.experiences === "oldest" ? "oldest experience first" : null,
    profile.config.ordering.projects === "name" ? "projects sorted A–Z" : null,
    profile.config.ordering.education === "oldest" ? "oldest education first" : null,
    profile.config.selections.experiences !== null
      ? `${profile.config.selections.experiences.length} chosen experience${profile.config.selections.experiences.length === 1 ? "" : "s"}`
      : null,
    profile.config.selections.projects !== null
      ? `${profile.config.selections.projects.length} chosen project${profile.config.selections.projects.length === 1 ? "" : "s"}`
      : null,
    profile.config.selections.education !== null
      ? `${profile.config.selections.education.length} chosen education item${profile.config.selections.education.length === 1 ? "" : "s"}`
      : null,
    profile.config.selections.achievements !== null
      ? `${profile.config.selections.achievements.length} chosen achievement${profile.config.selections.achievements.length === 1 ? "" : "s"}`
      : null,
    profile.config.selections.skills !== null
      ? `${profile.config.selections.skills.length} chosen skill${profile.config.selections.skills.length === 1 ? "" : "s"}`
      : null,
    profile.config.selections.contacts !== null
      ? `${profile.config.selections.contacts.length} chosen contact${profile.config.selections.contacts.length === 1 ? "" : "s"}`
      : null,
  ].filter((item): item is string => Boolean(item))

  return items
}

export function getProfileStatus(preview: ProfilePreview) {
  if (preview.hasEmptyPrimaryResults) {
    return {
      label: "Needs attention",
      tone: "destructive" as const,
      helper: "No experience or project entries match the current rules.",
    }
  }

  return {
    label: "Ready to use",
    tone: "default" as const,
    helper: "This profile currently matches content from your workspace.",
  }
}

export function getProfileScopeLabel(profile: ProfileData) {
  return profileHasActiveRules(profile) ? "Filtered" : "Keeps all"
}
