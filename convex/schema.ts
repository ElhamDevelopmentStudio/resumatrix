import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const nullableStringListValidator = v.union(v.array(v.string()), v.null())

const profileSelectionIdsValidator = v.object({
  experiences: nullableStringListValidator,
  projects: nullableStringListValidator,
  education: nullableStringListValidator,
  skills: nullableStringListValidator,
  contacts: nullableStringListValidator,
})

export const profileConfigValidator = v.object({
  ordering: v.object({
    experiences: v.union(v.literal("recent"), v.literal("oldest")),
    projects: v.union(v.literal("manual"), v.literal("name")),
    education: v.union(v.literal("recent"), v.literal("oldest")),
  }),
  limits: v.object({
    experiences: v.union(v.number(), v.null()),
    projects: v.union(v.number(), v.null()),
  }),
  selections: profileSelectionIdsValidator,
})

const cvOverrideSectionValidator = v.union(
  v.literal("contacts"),
  v.literal("experiences"),
  v.literal("projects"),
  v.literal("education"),
  v.literal("skills")
)

const cvSelectionsValidator = v.object({
  contacts: nullableStringListValidator,
  experiences: nullableStringListValidator,
  projects: nullableStringListValidator,
  education: nullableStringListValidator,
  skills: nullableStringListValidator,
})

const cvPersonalContentOverrideValidator = v.object({
  full_name: v.optional(v.string()),
  title: v.optional(v.string()),
  summary: v.optional(v.string()),
})

const cvContactContentOverrideValidator = v.object({
  type: v.optional(v.string()),
  value: v.optional(v.string()),
})

const cvExperienceContentOverrideValidator = v.object({
  company: v.optional(v.string()),
  role: v.optional(v.string()),
  start_date: v.optional(v.string()),
  end_date: v.optional(v.string()),
  location: v.optional(v.string()),
  bullets: v.optional(v.array(v.string())),
})

const cvProjectContentOverrideValidator = v.object({
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  tech_stack: v.optional(v.array(v.string())),
  bullets: v.optional(v.array(v.string())),
})

const cvEducationContentOverrideValidator = v.object({
  institution: v.optional(v.string()),
  degree: v.optional(v.string()),
  start_date: v.optional(v.string()),
  end_date: v.optional(v.string()),
  details: v.optional(v.string()),
})

const cvSkillContentOverrideValidator = v.object({
  name: v.optional(v.string()),
  category: v.optional(v.string()),
  level: v.optional(v.string()),
})

export const cvOverridesValidator = v.object({
  hidden_sections: v.array(cvOverrideSectionValidator),
  section_order: v.array(cvOverrideSectionValidator),
  selections: cvSelectionsValidator,
  content: v.object({
    personal: cvPersonalContentOverrideValidator,
    contacts: v.record(v.string(), cvContactContentOverrideValidator),
    experiences: v.record(v.string(), cvExperienceContentOverrideValidator),
    projects: v.record(v.string(), cvProjectContentOverrideValidator),
    education: v.record(v.string(), cvEducationContentOverrideValidator),
    skills: v.record(v.string(), cvSkillContentOverrideValidator),
  }),
})

export const schema = defineSchema({
  personal: defineTable({
    singleton_key: v.string(),
    full_name: v.string(),
    title: v.string(),
    summary: v.string(),
  }).index("by_singleton_key", ["singleton_key"]),
  contacts: defineTable({
    id: v.string(),
    type: v.string(),
    value: v.string(),
  }).index("by_record_id", ["id"]),
  experiences: defineTable({
    id: v.string(),
    company: v.string(),
    role: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    location: v.string(),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  }).index("by_record_id", ["id"]),
  projects: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    tech_stack: v.array(v.string()),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  }).index("by_record_id", ["id"]),
  education: defineTable({
    id: v.string(),
    institution: v.string(),
    degree: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    details: v.string(),
  }).index("by_record_id", ["id"]),
  skills: defineTable({
    id: v.string(),
    name: v.string(),
    category: v.string(),
    level: v.string(),
  }).index("by_record_id", ["id"]),
  profiles: defineTable({
    id: v.string(),
    name: v.string(),
    include_tags: v.array(v.string()),
    exclude_tags: v.array(v.string()),
    config: profileConfigValidator,
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_record_id", ["id"])
    .index("by_updated_at", ["updated_at"]),
  cvs: defineTable({
    id: v.string(),
    name: v.string(),
    profile_id: v.string(),
    template_id: v.string(),
    region_id: v.optional(v.string()),
    overrides: cvOverridesValidator,
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_record_id", ["id"])
    .index("by_updated_at", ["updated_at"]),
  rate_limits: defineTable({
    user_id: v.string(),
    function_name: v.string(),
    call_count: v.number(),
    window_start: v.number(),
  })
    .index("by_user_function", ["user_id", "function_name"])
    .index("by_user_function_window", ["user_id", "function_name", "window_start"])
    .index("by_window", ["window_start"]),
  ai_call_logs: defineTable({
    user_id: v.string(),
    function_name: v.string(),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    region: v.optional(v.string()),
    tokens_used: v.optional(v.number()),
    success: v.boolean(),
    error_message: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_created_at", ["created_at"]),
})

export default schema
