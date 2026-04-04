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
type CvDocument = DocumentByName<DataModel, "cvs">

const query = queryGeneric as QueryBuilder<DataModel, "public">
const mutation = mutationGeneric as MutationBuilder<DataModel, "public">

function withoutSystemFields<T extends { _creationTime: number; _id: unknown }>(
  document: T
): Omit<T, "_creationTime" | "_id"> {
  const { _creationTime: ignoredCreationTime, _id: ignoredId, ...rest } = document
  void ignoredCreationTime
  void ignoredId
  return rest
}

async function getDocumentById(ctx: QueryCtx | MutationCtx, id: string): Promise<CvDocument | null> {
  return await ctx.db
    .query("cvs")
    .withIndex("by_record_id", (q) => q.eq("id", id))
    .unique()
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("cvs").withIndex("by_updated_at").order("desc").collect()
    return documents.map((document) => withoutSystemFields(document))
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
    profile_id: v.string(),
    template_id: v.string(),
    overrides: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("cvs", args)
    return args
  },
})

export const update = mutation({
  args: {
    id: v.string(),
    payload: v.object({
      name: v.string(),
      profile_id: v.string(),
      template_id: v.string(),
      overrides: v.any(),
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
