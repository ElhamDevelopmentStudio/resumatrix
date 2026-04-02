import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString, readStringArray } from "@/lib/career-data/route-helpers"
import { deleteProjectData, updateProjectData } from "@/lib/career-data/store"
import { type ProjectPayload } from "@/lib/career-data/types"

export async function PUT(
  request: Request,
  context: RouteContext<"/api/projects/[id]">
) {
  const { id } = await context.params
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

  const project = await updateProjectData(id, {
    name,
    description,
    tech_stack,
    bullets,
    tags,
  })

  if (!project) {
    return NextResponse.json(buildApiError("Project not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(project))
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/projects/[id]">
) {
  const { id } = await context.params
  const project = await deleteProjectData(id)

  if (!project) {
    return NextResponse.json(buildApiError("Project not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: project.id }))
}
