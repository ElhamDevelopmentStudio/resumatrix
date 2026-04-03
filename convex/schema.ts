import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

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
  }),
  experiences: defineTable({
    id: v.string(),
    company: v.string(),
    role: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    location: v.string(),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  }),
  projects: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    tech_stack: v.array(v.string()),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  }),
  education: defineTable({
    id: v.string(),
    institution: v.string(),
    degree: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    details: v.string(),
  }),
  skills: defineTable({
    id: v.string(),
    name: v.string(),
    category: v.string(),
    level: v.string(),
  }),
  profiles: defineTable({
    id: v.string(),
    name: v.string(),
    include_tags: v.array(v.string()),
    exclude_tags: v.array(v.string()),
    config: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  }),
  cvs: defineTable({
    id: v.string(),
    name: v.string(),
    profile_id: v.string(),
    template_id: v.string(),
    overrides: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  }),
})

export default schema
