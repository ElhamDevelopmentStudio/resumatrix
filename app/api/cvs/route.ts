import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody } from "@/lib/career-data/route-helpers"
import { createCvData, listCvsData } from "@/lib/cvs/store"
import { type CvPayload } from "@/lib/cvs/types"
import {
  getFirstCvValidationMessage,
  hasCvValidationErrors,
  normalizeCvPayload,
  validateCvPayload,
} from "@/lib/cvs/validation"
import { getProfileData } from "@/lib/profiles/store"
import { getCvTemplate } from "@/lib/templates/registry"

export async function GET() {
  const cvs = await listCvsData()
  return NextResponse.json(buildApiSuccess(cvs))
}

export async function POST(request: Request) {
  const body = await parseJsonBody<CvPayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the CV details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const cv = normalizeCvPayload(body)
  const validationErrors = validateCvPayload(cv)

  if (hasCvValidationErrors(validationErrors)) {
    return NextResponse.json(
      buildApiError(getFirstCvValidationMessage(validationErrors), "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const [profile, template] = await Promise.all([
    getProfileData(cv.profile_id),
    Promise.resolve(getCvTemplate(cv.template_id)),
  ])

  if (!profile) {
    return NextResponse.json(
      buildApiError("Choose a profile that still exists.", "PROFILE_NOT_FOUND"),
      { status: 404 }
    )
  }

  if (!template) {
    return NextResponse.json(
      buildApiError("Choose a valid template before saving this CV.", "TEMPLATE_NOT_FOUND"),
      { status: 404 }
    )
  }

  const createdCv = await createCvData(cv)

  return NextResponse.json(buildApiSuccess(createdCv), { status: 201 })
}
