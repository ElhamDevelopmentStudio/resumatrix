import {
  type DataModelFromSchemaDefinition,
  type DocumentByName,
  type GenericMutationCtx,
  type GenericQueryCtx,
  type MutationBuilder,
  mutationGeneric,
  type QueryBuilder,
  queryGeneric,
} from "convex/server"
import { v } from "convex/values"

import { schema } from "./schema"

type DataModel = DataModelFromSchemaDefinition<typeof schema>
type QueryCtx = GenericQueryCtx<DataModel>
type MutationCtx = GenericMutationCtx<DataModel>
type CollectionTableName =
  | "contacts"
  | "experiences"
  | "projects"
  | "education"
  | "achievements"
  | "skills"
type CollectionDocument<Table extends CollectionTableName> = DocumentByName<DataModel, Table>
type StoredCollectionDocument<Table extends CollectionTableName> = CollectionDocument<Table> & {
  _creationTime: number
  _id: unknown
}
type PersonalDocument = DocumentByName<DataModel, "personal">
type StoredPersonalDocument = PersonalDocument & {
  _creationTime: number
  _id: unknown
}

const query = queryGeneric as QueryBuilder<DataModel, "public">
const mutation = mutationGeneric as MutationBuilder<DataModel, "public">

const workspacePersonalKey = "default"

function withoutSystemFields<T extends { _creationTime: number; _id: unknown }>(
  document: T
): Omit<T, "_creationTime" | "_id"> {
  const { _creationTime: ignoredCreationTime, _id: ignoredId, ...rest } = document
  void ignoredCreationTime
  void ignoredId
  return rest
}

async function getPersonalDocument(ctx: QueryCtx | MutationCtx): Promise<StoredPersonalDocument | null> {
  const document = await ctx.db
    .query("personal")
    .withIndex("by_singleton_key", (q) => q.eq("singleton_key", workspacePersonalKey))
    .unique()
  return document as StoredPersonalDocument | null
}

async function getDocumentById<Table extends CollectionTableName>(
  ctx: QueryCtx | MutationCtx,
  table: Table,
  id: string
): Promise<CollectionDocument<Table> | null> {
  switch (table) {
    case "contacts":
      return (await ctx.db
        .query("contacts")
        .withIndex("by_record_id", (q) => q.eq("id", id))
        .unique()) as CollectionDocument<Table> | null
    case "experiences":
      return (await ctx.db
        .query("experiences")
        .withIndex("by_record_id", (q) => q.eq("id", id))
        .unique()) as CollectionDocument<Table> | null
    case "projects":
      return (await ctx.db
        .query("projects")
        .withIndex("by_record_id", (q) => q.eq("id", id))
        .unique()) as CollectionDocument<Table> | null
    case "education":
      return (await ctx.db
        .query("education")
        .withIndex("by_record_id", (q) => q.eq("id", id))
        .unique()) as CollectionDocument<Table> | null
    case "achievements":
      return (await ctx.db
        .query("achievements")
        .withIndex("by_record_id", (q) => q.eq("id", id))
        .unique()) as CollectionDocument<Table> | null
    case "skills":
      return (await ctx.db
        .query("skills")
        .withIndex("by_record_id", (q) => q.eq("id", id))
        .unique()) as CollectionDocument<Table> | null
  }
}

async function listDocuments<Table extends CollectionTableName>(ctx: QueryCtx, table: Table) {
  const documents = (await ctx.db.query(table).collect()) as StoredCollectionDocument<Table>[]
  return documents.map((document) => withoutSystemFields(document))
}

export const getWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const [personalDocument, contacts, experiences, projects, education, achievements, skills] = await Promise.all([
      getPersonalDocument(ctx),
      listDocuments(ctx, "contacts"),
      listDocuments(ctx, "experiences"),
      listDocuments(ctx, "projects"),
      listDocuments(ctx, "education"),
      listDocuments(ctx, "achievements"),
      listDocuments(ctx, "skills"),
    ])

    return {
      personal: personalDocument
        ? {
            full_name: personalDocument.full_name,
            title: personalDocument.title,
            summary: personalDocument.summary,
          }
        : {
            full_name: "",
            title: "",
            summary: "",
          },
      contacts,
      experiences,
      projects,
      education,
      achievements,
      skills,
    }
  },
})

export const getPersonal = query({
  args: {},
  handler: async (ctx) => {
    const document = await getPersonalDocument(ctx)

    return document
      ? {
          full_name: document.full_name,
          title: document.title,
          summary: document.summary,
        }
      : {
          full_name: "",
          title: "",
          summary: "",
        }
  },
})

export const setPersonal = mutation({
  args: {
    full_name: v.string(),
    title: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getPersonalDocument(ctx)

    if (existing) {
      await ctx.db.patch(existing._id, {
        full_name: args.full_name,
        title: args.title,
        summary: args.summary,
      })
    } else {
      await ctx.db.insert("personal", {
        singleton_key: workspacePersonalKey,
        full_name: args.full_name,
        title: args.title,
        summary: args.summary,
      })
    }

    return {
      full_name: args.full_name,
      title: args.title,
      summary: args.summary,
    }
  },
})

export const listContacts = query({
  args: {},
  handler: async (ctx) => listDocuments(ctx, "contacts"),
})

export const createContact = mutation({
  args: {
    id: v.string(),
    type: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("contacts", args)
    return args
  },
})

export const updateContact = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      type: v.string(),
      value: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "contacts", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, args.payload)

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
    }
  },
})

export const deleteContact = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "contacts", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})

export const listExperiences = query({
  args: {},
  handler: async (ctx) => listDocuments(ctx, "experiences"),
})

export const createExperience = mutation({
  args: {
    id: v.string(),
    company: v.string(),
    role: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    location: v.string(),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("experiences", args)
    return args
  },
})

export const updateExperience = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      company: v.string(),
      role: v.string(),
      start_date: v.string(),
      end_date: v.string(),
      location: v.string(),
      bullets: v.array(v.string()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "experiences", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, args.payload)

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
    }
  },
})

export const deleteExperience = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "experiences", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})

export const listProjects = query({
  args: {},
  handler: async (ctx) => listDocuments(ctx, "projects"),
})

export const createProject = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.string(),
    tech_stack: v.array(v.string()),
    bullets: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("projects", args)
    return args
  },
})

export const updateProject = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      name: v.string(),
      description: v.string(),
      tech_stack: v.array(v.string()),
      bullets: v.array(v.string()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "projects", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, args.payload)

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
    }
  },
})

export const deleteProject = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "projects", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})

export const listEducation = query({
  args: {},
  handler: async (ctx) => listDocuments(ctx, "education"),
})

export const createEducation = mutation({
  args: {
    id: v.string(),
    institution: v.string(),
    degree: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("education", args)
    return args
  },
})

export const updateEducation = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      institution: v.string(),
      degree: v.string(),
      start_date: v.string(),
      end_date: v.string(),
      details: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "education", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, args.payload)

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
    }
  },
})

export const deleteEducation = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "education", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})

export const listAchievements = query({
  args: {},
  handler: async (ctx) => listDocuments(ctx, "achievements"),
})

export const createAchievement = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    description: v.string(),
    link_url: v.string(),
    link_label: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("achievements", args)
    return args
  },
})

export const updateAchievement = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      title: v.string(),
      description: v.string(),
      link_url: v.string(),
      link_label: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "achievements", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, args.payload)

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
    }
  },
})

export const deleteAchievement = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "achievements", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})

export const listSkills = query({
  args: {},
  handler: async (ctx) => listDocuments(ctx, "skills"),
})

export const createSkill = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    category: v.string(),
    level: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("skills", args)
    return args
  },
})

export const updateSkill = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      name: v.string(),
      category: v.string(),
      level: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "skills", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, args.payload)

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
    }
  },
})

export const deleteSkill = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, "skills", args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})
