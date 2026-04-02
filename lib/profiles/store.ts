import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import {
  type ProfileData,
  type ProfilePayload,
} from "@/lib/profiles/types"
import {
  normalizeProfileConfig,
  normalizeProfilePayload,
  normalizeTagList,
} from "@/lib/profiles/validation"

const dataDirectory = process.env.RESUMATRIX_DATA_DIR ?? path.join(tmpdir(), "resumatrix")
const dataFile = path.join(dataDirectory, "profiles.json")

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

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true })
}

async function readProfiles(): Promise<ProfileData[]> {
  try {
    const raw = await readFile(dataFile, "utf8")
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((entry) => sanitizeProfile(entry))
      .filter((entry): entry is ProfileData => Boolean(entry))
  } catch {
    return []
  }
}

async function writeProfiles(profiles: ProfileData[]) {
  await ensureDataDirectory()
  await writeFile(dataFile, JSON.stringify(profiles, null, 2), "utf8")
}

export async function listProfilesData() {
  const profiles = await readProfiles()
  return profiles.sort((left, right) => right.updated_at.localeCompare(left.updated_at))
}

export async function createProfileData(payload: ProfilePayload) {
  const normalizedPayload = normalizeProfilePayload(payload)
  const profiles = await readProfiles()
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

  await writeProfiles([nextProfile, ...profiles])

  return nextProfile
}

export async function updateProfileData(id: string, payload: ProfilePayload) {
  const normalizedPayload = normalizeProfilePayload(payload)
  const profiles = await readProfiles()
  const profileIndex = profiles.findIndex((profile) => profile.id === id)

  if (profileIndex === -1) {
    return null
  }

  const currentProfile = profiles[profileIndex]
  const updatedProfile: ProfileData = {
    ...currentProfile,
    name: normalizedPayload.name,
    include_tags: normalizedPayload.include_tags,
    exclude_tags: normalizedPayload.exclude_tags,
    config: normalizedPayload.config,
    updated_at: new Date().toISOString(),
  }

  const nextProfiles = [...profiles]
  nextProfiles[profileIndex] = updatedProfile

  await writeProfiles(nextProfiles)

  return updatedProfile
}

export async function deleteProfileData(id: string) {
  const profiles = await readProfiles()
  const removedProfile = profiles.find((profile) => profile.id === id) ?? null

  if (!removedProfile) {
    return null
  }

  await writeProfiles(profiles.filter((profile) => profile.id !== id))

  return removedProfile
}
