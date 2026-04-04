import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { deleteEducationData, updateEducationData } from "@/lib/career-data/store"
import { type EducationPayload } from "@/lib/career-data/types"

export const PUT = withApiSession(async (
  request: Request,
  context: RouteContext<"/api/education/[id]">
) => {
  const { id } = await context.params
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

  const education = await updateEducationData(id, {
    institution,
    degree,
    start_date,
    end_date,
    details,
  })

  if (!education) {
    return NextResponse.json(buildApiError("Education entry not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(education))
})

export const DELETE = withApiSession(async (
  _request: Request,
  context: RouteContext<"/api/education/[id]">
) => {
  const { id } = await context.params
  const education = await deleteEducationData(id)

  if (!education) {
    return NextResponse.json(buildApiError("Education entry not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: education.id }))
})
