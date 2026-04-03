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
  }).index("by_id", ["id"]),
  experiences: defineTable({
    id: v.string(),
    company: v.string(),
    role: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    location: v.string(),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  }).index("by_id", ["id"]),
  projects: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    tech_stack: v.array(v.string()),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  }).index("by_id", ["id"]),
  education: defineTable({
    id: v.string(),
    institution: v.string(),
    degree: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    details: v.string(),
  }).index("by_id", ["id"]),
  skills: defineTable({
    id: v.string(),
    name: v.string(),
    category: v.string(),
    level: v.string(),
  }).index("by_id", ["id"]),
  profiles: defineTable({
    id: v.string(),
    name: v.string(),
    include_tags: v.array(v.string()),
    exclude_tags: v.array(v.string()),
    config: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_id", ["id"]),
  cvs: defineTable({
    id: v.string(),
    name: v.string(),
    profile_id: v.string(),
    template_id: v.string(),
    overrides: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_id", ["id"]),
})

export default schema
