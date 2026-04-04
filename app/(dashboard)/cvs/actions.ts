'use server'

import { getRequestSession } from "@/lib/auth/server"
import { createCvData, deleteCvData, updateCvData } from "@/lib/cvs/store"
import type { CvData, CvPayload } from "@/lib/cvs/types"
import {
  getFirstCvValidationMessage,
  hasCvValidationErrors,
  normalizeCvPayload,
  validateCvPayload,
} from "@/lib/cvs/validation"
import { getProfileData } from "@/lib/profiles/store"
import { getCvTemplate } from "@/lib/templates/registry"

type CvActionResult =
  | {
      success: true
      data: CvData
    }
  | {
      success: false
      error: string
    }

type CvDeleteActionResult =
  | {
      success: true
      data: {
        id: string
      }
    }
  | {
      success: false
      error: string
    }

async function ensureCvSession() {
  const session = await getRequestSession()

  if (!session) {
    return {
      success: false,
      error: "Sign in to continue.",
    } as const
  }

  return null
}

async function validateCvReferences(cv: CvPayload) {
  const [profile, template] = await Promise.all([
    getProfileData(cv.profile_id),
    Promise.resolve(getCvTemplate(cv.template_id)),
  ])

  if (!profile) {
    return {
      success: false,
      error: "Choose a profile that still exists.",
    } as const
  }

  if (!template) {
    return {
      success: false,
      error: "Choose a valid template before saving this CV.",
    } as const
  }

  return null
}

export async function createCv(cv: CvPayload): Promise<CvActionResult> {
  const authError = await ensureCvSession()

  if (authError) {
    return authError
  }

  const normalizedCv = normalizeCvPayload(cv)
  const validationErrors = validateCvPayload(normalizedCv)

  if (hasCvValidationErrors(validationErrors)) {
    return {
      success: false,
      error: getFirstCvValidationMessage(validationErrors),
    }
  }

  const referenceError = await validateCvReferences(normalizedCv)

  if (referenceError) {
    return referenceError
  }

  const createdCv = await createCvData(normalizedCv)

  return {
    success: true,
    data: createdCv,
  }
}

export async function updateCv(id: string, cv: CvPayload): Promise<CvActionResult> {
  const authError = await ensureCvSession()

  if (authError) {
    return authError
  }

  const normalizedCv = normalizeCvPayload(cv)
  const validationErrors = validateCvPayload(normalizedCv)

  if (hasCvValidationErrors(validationErrors)) {
    return {
      success: false,
      error: getFirstCvValidationMessage(validationErrors),
    }
  }

  const referenceError = await validateCvReferences(normalizedCv)

  if (referenceError) {
    return referenceError
  }

  const updatedCv = await updateCvData(id, normalizedCv)

  if (!updatedCv) {
    return {
      success: false,
      error: "We couldn’t find that CV.",
    }
  }

  return {
    success: true,
    data: updatedCv,
  }
}

export async function deleteCv(id: string): Promise<CvDeleteActionResult> {
  const authError = await ensureCvSession()

  if (authError) {
    return authError
  }

  const deletedCv = await deleteCvData(id)

  if (!deletedCv) {
    return {
      success: false,
      error: "We couldn’t find that CV.",
    }
  }

  return {
    success: true,
    data: {
      id: deletedCv.id,
    },
  }
}
