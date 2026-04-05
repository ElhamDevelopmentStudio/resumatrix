export interface RewriteSuggestion {
  original: string
  suggested: string
  reasoning: string
}

export interface LayoutSuggestion {
  section_order: string[]
  reasoning_per_section: Record<string, string>
}

export interface ProfileSuggestion {
  name: string
  include_tags: string[]
  exclude_tags: string[]
  ordering: {
    experiences: "recent" | "oldest"
    projects: "manual" | "name"
    education: "recent" | "oldest"
  }
  limits: {
    experiences: number | null
    projects: number | null
  }
}

export type AIResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }