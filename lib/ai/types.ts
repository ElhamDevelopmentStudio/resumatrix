export type AIProvider = "minimax" | "groq" | "nvidia"

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

export interface AIResponseMeta {
  provider: AIProvider
  providerLabel: string
  model: string
  baseUrl: string
  tokensUsed?: number
}

export interface AIErrorDetails extends AIResponseMeta {
  statusCode?: number
  code?: string
  retryable?: boolean
}

export type AIResponse<T> =
  | { ok: true; data: T; meta: AIResponseMeta }
  | { ok: false; error: string; details: AIErrorDetails }
