import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody } from "@/lib/career-data/route-helpers"
import { createProfileData, listProfilesData } from "@/lib/profiles/store"
import { type ProfilePayload } from "@/lib/profiles/types"
import {
  getFirstProfileValidationMessage,
  hasProfileValidationErrors,
  normalizeProfilePayload,
  validateProfilePayload,
} from "@/lib/profiles/validation"

export async function GET() {
  const profiles = await listProfilesData()
  return NextResponse.json(buildApiSuccess(profiles))
}

export async function POST(request: Request) {
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

  const createdProfile = await createProfileData(profile)

  return NextResponse.json(buildApiSuccess(createdProfile), { status: 201 })
}
