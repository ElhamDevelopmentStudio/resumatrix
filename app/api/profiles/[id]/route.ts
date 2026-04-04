import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody } from "@/lib/career-data/route-helpers"
import { deleteProfileData, updateProfileData } from "@/lib/profiles/store"
import { type ProfilePayload } from "@/lib/profiles/types"
import {
  getFirstProfileValidationMessage,
  hasProfileValidationErrors,
  normalizeProfilePayload,
  validateProfilePayload,
} from "@/lib/profiles/validation"

export const PUT = withApiSession(async (
  request: Request,
  context: RouteContext<"/api/profiles/[id]">
) => {
  const { id } = await context.params
  const body = await parseJsonBody<ProfilePayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the profile details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const profile = normalizeProfilePayload(body)
  const validationErrors = validateProfilePayload(profile)

  if (hasProfileValidationErrors(validationErrors)) {
    return NextResponse.json(
      buildApiError(getFirstProfileValidationMessage(validationErrors), "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const updatedProfile = await updateProfileData(id, profile)

  if (!updatedProfile) {
    return NextResponse.json(buildApiError("Profile not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(updatedProfile))
})

export const DELETE = withApiSession(async (
  _request: Request,
  context: RouteContext<"/api/profiles/[id]">
) => {
  const { id } = await context.params
  const deletedProfile = await deleteProfileData(id)

  if (!deletedProfile) {
    return NextResponse.json(buildApiError("Profile not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: deletedProfile.id }))
})
