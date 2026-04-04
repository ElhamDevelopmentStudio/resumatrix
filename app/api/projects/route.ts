import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString, readStringArray } from "@/lib/career-data/route-helpers"
import { createProjectData, listProjects } from "@/lib/career-data/store"
import { type ProjectPayload } from "@/lib/career-data/types"

export const GET = withApiSession(async () => {
  const projects = await listProjects()
  return NextResponse.json(buildApiSuccess(projects))
})

export const POST = withApiSession(async (request: Request) => {
  const body = await parseJsonBody<ProjectPayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the project details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const name = readString(body.name)
  const description = readString(body.description)
  const tech_stack = readStringArray(body.tech_stack)
  const bullets = readStringArray(body.bullets)
  const tags = readStringArray(body.tags)

  if (!name) {
    return NextResponse.json(
      buildApiError("Project name is required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const project = await createProjectData({
    name,
    description,
    tech_stack,
    bullets,
    tags,
  })

  return NextResponse.json(buildApiSuccess(project), { status: 201 })
})
