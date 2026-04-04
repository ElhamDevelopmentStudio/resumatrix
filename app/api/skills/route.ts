import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { createSkillData, listSkills } from "@/lib/career-data/store"
import { type SkillPayload } from "@/lib/career-data/types"

export const GET = withApiSession(async () => {
  const skills = await listSkills()
  return NextResponse.json(buildApiSuccess(skills))
})

export const POST = withApiSession(async (request: Request) => {
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

  const skill = await createSkillData({ name, category, level })

  return NextResponse.json(buildApiSuccess(skill), { status: 201 })
})
