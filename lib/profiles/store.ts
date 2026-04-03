import "server-only"

import { randomUUID } from "node:crypto"

import { unstable_noStore as noStore } from "next/cache"

import { createConvexClient } from "@/lib/convex/client"
import { convexFunctionReferences } from "@/lib/convex/function-references"
import {
  type ProfileData,
  type ProfilePayload,
} from "@/lib/profiles/types"
import {
  normalizeProfileConfig,
  normalizeProfilePayload,
  normalizeTagList,
} from "@/lib/profiles/validation"

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function sanitizeDate(value: unknown, fallback: string) {
  const nextValue = readText(value)
  return nextValue || fallback
}

function sanitizeProfile(value: unknown): ProfileData | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const nextValue = value as Partial<ProfileData>
  const name = readText(nextValue.name)

  if (typeof nextValue.id !== "string" || !name) {
    return null
  }

  const fallbackDate = new Date().toISOString()

  return {
    id: nextValue.id,
    name,
    include_tags: normalizeTagList(nextValue.include_tags),
    exclude_tags: normalizeTagList(nextValue.exclude_tags),
    config: normalizeProfileConfig(nextValue.config),
    created_at: sanitizeDate(nextValue.created_at, fallbackDate),
    updated_at: sanitizeDate(nextValue.updated_at, fallbackDate),
  }
}

function sanitizeProfiles(value: unknown): ProfileData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => sanitizeProfile(entry))
    .filter((entry): entry is ProfileData => Boolean(entry))
}

function getConvexClient() {
  return createConvexClient()
}

export async function listProfilesData() {
  noStore()
  const profiles = await getConvexClient().query(convexFunctionReferences.profiles.list, {})
  return sanitizeProfiles(profiles)
}

export async function createProfileData(payload: ProfilePayload) {
  const normalizedPayload = normalizeProfilePayload(payload)
  const timestamp = new Date().toISOString()

  const nextProfile: ProfileData = {
    id: randomUUID(),
    name: normalizedPayload.name,
    include_tags: normalizedPayload.include_tags,
    exclude_tags: normalizedPayload.exclude_tags,
    config: normalizedPayload.config,
    created_at: timestamp,
    updated_at: timestamp,
  }

  const createdProfile = await getConvexClient().mutation(
    convexFunctionReferences.profiles.create,
    nextProfile
  )

  return sanitizeProfile(createdProfile) ?? nextProfile
}

export async function updateProfileData(id: string, payload: ProfilePayload) {
  const normalizedPayload = normalizeProfilePayload(payload)
  const updatedProfile = await getConvexClient().mutation(convexFunctionReferences.profiles.update, {
    id,
    payload: normalizedPayload,
    updated_at: new Date().toISOString(),
  })

  return sanitizeProfile(updatedProfile)
}

export async function deleteProfileData(id: string) {
  const removedProfile = await getConvexClient().mutation(convexFunctionReferences.profiles.remove, {
    id,
  })

  return sanitizeProfile(removedProfile)
}

export async function getProfileData(id: string) {
  noStore()
  const profile = await getConvexClient().query(convexFunctionReferences.profiles.get, { id })
  return sanitizeProfile(profile)
}
