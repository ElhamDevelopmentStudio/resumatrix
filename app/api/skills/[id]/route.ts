import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { deleteSkillData, updateSkillData } from "@/lib/career-data/store"
import { type SkillPayload } from "@/lib/career-data/types"

export const PUT = withApiSession(async (
  request: Request,
  context: RouteContext<"/api/skills/[id]">
) => {
  const { id } = await context.params
  const body = await parseJsonBody<SkillPayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the skill details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const name = readString(body.name)
  const category = readString(body.category)
  const level = readString(body.level)

  if (!name || !category) {
    return NextResponse.json(
      buildApiError("Skill name and category are required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const skill = await updateSkillData(id, { name, category, level })

  if (!skill) {
    return NextResponse.json(buildApiError("Skill not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(skill))
})

export const DELETE = withApiSession(async (
  _request: Request,
  context: RouteContext<"/api/skills/[id]">
) => {
  const { id } = await context.params
  const skill = await deleteSkillData(id)

  if (!skill) {
    return NextResponse.json(buildApiError("Skill not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: skill.id }))
})
