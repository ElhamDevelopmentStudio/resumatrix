import "server-only"

import { randomUUID } from "node:crypto"

import { unstable_noStore as noStore } from "next/cache"

import { createConvexClient } from "@/lib/convex/client"
import { convexFunctionReferences } from "@/lib/convex/function-references"
import { type CvData, type CvPayload } from "@/lib/cvs/types"
import { normalizeCvOverrides, normalizeCvPayload } from "@/lib/cvs/validation"

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

function sanitizeCvs(value: unknown): CvData[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => sanitizeCv(entry))
    .filter((entry): entry is CvData => Boolean(entry))
}

function getConvexClient() {
  return createConvexClient()
}

export async function listCvsData() {
  noStore()
  const cvs = await getConvexClient().query(convexFunctionReferences.cvs.list, {})
  return sanitizeCvs(cvs)
}

export async function createCvData(payload: CvPayload) {
  const normalizedPayload = normalizeCvPayload(payload)
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

  const createdCv = await getConvexClient().mutation(convexFunctionReferences.cvs.create, nextCv)

  return sanitizeCv(createdCv) ?? nextCv
}

export async function updateCvData(id: string, payload: CvPayload) {
  const normalizedPayload = normalizeCvPayload(payload)
  const updatedCv = await getConvexClient().mutation(convexFunctionReferences.cvs.update, {
    id,
    payload: normalizedPayload,
    updated_at: new Date().toISOString(),
  })

  return sanitizeCv(updatedCv)
}

export async function deleteCvData(id: string) {
  const removedCv = await getConvexClient().mutation(convexFunctionReferences.cvs.remove, { id })
  return sanitizeCv(removedCv)
}

export async function getCvData(id: string) {
  noStore()
  const cv = await getConvexClient().query(convexFunctionReferences.cvs.get, { id })
  return sanitizeCv(cv)
}
