import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString, readStringArray } from "@/lib/career-data/route-helpers"
import { deleteExperienceData, updateExperienceData } from "@/lib/career-data/store"
import { type ExperiencePayload } from "@/lib/career-data/types"

export async function PUT(
  request: Request,
  context: RouteContext<"/api/experiences/[id]">
) {
  const { id } = await context.params
  const body = await parseJsonBody<ExperiencePayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the experience details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const company = readString(body.company)
  const role = readString(body.role)
  const start_date = readString(body.start_date)
  const end_date = readString(body.end_date)
  const location = readString(body.location)
  const bullets = readStringArray(body.bullets)
  const tags = readStringArray(body.tags)

  if (!company || !role) {
    return NextResponse.json(
      buildApiError("Company and role are required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const experience = await updateExperienceData(id, {
    company,
    role,
    start_date,
    end_date,
    location,
    bullets,
    tags,
  })

  if (!experience) {
    return NextResponse.json(buildApiError("Experience not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(experience))
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/experiences/[id]">
) {
  const { id } = await context.params
  const experience = await deleteExperienceData(id)

  if (!experience) {
    return NextResponse.json(buildApiError("Experience not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: experience.id }))
}
