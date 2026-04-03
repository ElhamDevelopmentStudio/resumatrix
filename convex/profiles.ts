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
type ProfileDocument = DocumentByName<DataModel, "profiles">

const query = queryGeneric as QueryBuilder<DataModel, "public">
const mutation = mutationGeneric as MutationBuilder<DataModel, "public">

function sortByUpdatedAt<T extends { updated_at: string }>(items: T[]) {
  return [...items].sort((left, right) => right.updated_at.localeCompare(left.updated_at))
}

function withoutSystemFields<T extends { _creationTime: number; _id: unknown }>(
  document: T
): Omit<T, "_creationTime" | "_id"> {
  const { _creationTime: ignoredCreationTime, _id: ignoredId, ...rest } = document
  void ignoredCreationTime
  void ignoredId
  return rest
}

async function getDocumentById(ctx: QueryCtx | MutationCtx, id: string): Promise<ProfileDocument | null> {
  const documents = await ctx.db.query("profiles").collect()
  return documents.find((document) => document.id === id) ?? null
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("profiles").collect()
    return sortByUpdatedAt(documents.map((document) => withoutSystemFields(document)))
  },
})

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await getDocumentById(ctx, args.id)
    return document ? withoutSystemFields(document) : null
  },
})

export const create = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    include_tags: v.array(v.string()),
    exclude_tags: v.array(v.string()),
    config: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("profiles", args)
    return args
  },
})

export const update = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      name: v.string(),
      include_tags: v.array(v.string()),
      exclude_tags: v.array(v.string()),
      config: v.any(),
    }),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, args.id)

    if (!existing) {
      return null
    }

    await ctx.db.patch(existing._id, {
      ...args.payload,
      updated_at: args.updated_at,
    })

    return {
      ...withoutSystemFields(existing),
      ...args.payload,
      updated_at: args.updated_at,
    }
  },
})

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getDocumentById(ctx, args.id)

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return withoutSystemFields(existing)
  },
})
