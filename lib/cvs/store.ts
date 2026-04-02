import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { type CvData, type CvPayload } from "@/lib/cvs/types"
import { normalizeCvOverrides, normalizeCvPayload } from "@/lib/cvs/validation"

const dataDirectory = process.env.RESUMATRIX_DATA_DIR ?? path.join(tmpdir(), "resumatrix")
const dataFile = path.join(dataDirectory, "cvs.json")

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function sanitizeDate(value: unknown, fallback: string) {
  const nextValue = readText(value)
  return nextValue || fallback
}

function sanitizeCv(value: unknown): CvData | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const nextValue = value as Partial<CvData>
  const name = readText(nextValue.name)
  const profileId = readText(nextValue.profile_id)
  const templateId = readText(nextValue.template_id)

  if (typeof nextValue.id !== "string" || !name || !profileId || !templateId) {
    return null
  }

  const fallbackDate = new Date().toISOString()

  return {
    id: nextValue.id,
    name,
    profile_id: profileId,
    template_id: templateId,
    overrides: normalizeCvOverrides(nextValue.overrides),
    created_at: sanitizeDate(nextValue.created_at, fallbackDate),
    updated_at: sanitizeDate(nextValue.updated_at, fallbackDate),
  }
}

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true })
}

async function readCvs(): Promise<CvData[]> {
  try {
    const raw = await readFile(dataFile, "utf8")
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((entry) => sanitizeCv(entry))
      .filter((entry): entry is CvData => Boolean(entry))
  } catch {
    return []
  }
}

async function writeCvs(cvs: CvData[]) {
  await ensureDataDirectory()
  await writeFile(dataFile, JSON.stringify(cvs, null, 2), "utf8")
}

export async function listCvsData() {
  const cvs = await readCvs()
  return cvs.sort((left, right) => right.updated_at.localeCompare(left.updated_at))
}

export async function createCvData(payload: CvPayload) {
  const normalizedPayload = normalizeCvPayload(payload)
  const cvs = await readCvs()
  const timestamp = new Date().toISOString()

  const nextCv: CvData = {
    id: randomUUID(),
    name: normalizedPayload.name,
    profile_id: normalizedPayload.profile_id,
    template_id: normalizedPayload.template_id,
    overrides: normalizedPayload.overrides,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await writeCvs([nextCv, ...cvs])

  return nextCv
}

export async function updateCvData(id: string, payload: CvPayload) {
  const normalizedPayload = normalizeCvPayload(payload)
  const cvs = await readCvs()
  const cvIndex = cvs.findIndex((cv) => cv.id === id)

  if (cvIndex === -1) {
    return null
  }

  const currentCv = cvs[cvIndex]
  const updatedCv: CvData = {
    ...currentCv,
    name: normalizedPayload.name,
    profile_id: normalizedPayload.profile_id,
    template_id: normalizedPayload.template_id,
    overrides: normalizedPayload.overrides,
    updated_at: new Date().toISOString(),
  }

  const nextCvs = [...cvs]
  nextCvs[cvIndex] = updatedCv

  await writeCvs(nextCvs)

  return updatedCv
}

export async function deleteCvData(id: string) {
  const cvs = await readCvs()
  const removedCv = cvs.find((cv) => cv.id === id) ?? null

  if (!removedCv) {
    return null
  }

  await writeCvs(cvs.filter((cv) => cv.id !== id))

  return removedCv
}

export async function getCvData(id: string) {
  const cvs = await readCvs()
  return cvs.find((cv) => cv.id === id) ?? null
}
