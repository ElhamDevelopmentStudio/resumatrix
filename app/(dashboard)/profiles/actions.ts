'use server'

import { getRequestSession } from "@/lib/auth/server"
import {
  createProfileData,
  deleteProfileData,
  updateProfileData,
} from "@/lib/profiles/store"
import type { ProfileData, ProfilePayload } from "@/lib/profiles/types"
import {
  getFirstProfileValidationMessage,
  hasProfileValidationErrors,
  normalizeProfilePayload,
  validateProfilePayload,
} from "@/lib/profiles/validation"

type ProfileActionResult =
  | {
      success: true
      data: ProfileData
    }
  | {
      success: false
      error: string
    }

type ProfileDeleteActionResult =
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

async function ensureProfileSession() {
  const session = await getRequestSession()

  if (!session) {
    return {
      success: false,
      error: "Sign in to continue.",
    } as const
  }

  return null
}

export async function createProfile(profile: ProfilePayload): Promise<ProfileActionResult> {
  const authError = await ensureProfileSession()

  if (authError) {
    return authError
  }

  const normalizedProfile = normalizeProfilePayload(profile)
  const validationErrors = validateProfilePayload(normalizedProfile)

  if (hasProfileValidationErrors(validationErrors)) {
    return {
      success: false,
      error: getFirstProfileValidationMessage(validationErrors),
    }
  }

  const createdProfile = await createProfileData(normalizedProfile)

  return {
    success: true,
    data: createdProfile,
  }
}

export async function updateProfile(
  id: string,
  profile: ProfilePayload
): Promise<ProfileActionResult> {
  const authError = await ensureProfileSession()

  if (authError) {
    return authError
  }

  const normalizedProfile = normalizeProfilePayload(profile)
  const validationErrors = validateProfilePayload(normalizedProfile)

  if (hasProfileValidationErrors(validationErrors)) {
    return {
      success: false,
      error: getFirstProfileValidationMessage(validationErrors),
    }
  }

  const updatedProfile = await updateProfileData(id, normalizedProfile)

  if (!updatedProfile) {
    return {
      success: false,
      error: "Profile not found.",
    }
  }

  return {
    success: true,
    data: updatedProfile,
  }
}

export async function deleteProfile(id: string): Promise<ProfileDeleteActionResult> {
  const authError = await ensureProfileSession()

  if (authError) {
    return authError
  }

  const deletedProfile = await deleteProfileData(id)

  if (!deletedProfile) {
    return {
      success: false,
      error: "Profile not found.",
    }
  }

  return {
    success: true,
    data: {
      id: deletedProfile.id,
    },
  }
}
