import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { createEducationData, listEducationEntries } from "@/lib/career-data/store"
import { type EducationPayload } from "@/lib/career-data/types"

export const GET = withApiSession(async () => {
  const education = await listEducationEntries()
  return NextResponse.json(buildApiSuccess(education))
})

export const POST = withApiSession(async (request: Request) => {
  const body = await parseJsonBody<EducationPayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the education details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const institution = readString(body.institution)
  const degree = readString(body.degree)
  const start_date = readString(body.start_date)
  const end_date = readString(body.end_date)
  const details = readString(body.details)

  if (!institution || !degree) {
    return NextResponse.json(
      buildApiError("Institution and degree are required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const education = await createEducationData({
    institution,
    degree,
    start_date,
    end_date,
    details,
  })

  return NextResponse.json(buildApiSuccess(education), { status: 201 })
})
