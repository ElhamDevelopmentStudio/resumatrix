import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { deleteAchievementData, updateAchievementData } from "@/lib/career-data/store"
import { type AchievementPayload } from "@/lib/career-data/types"

export const PUT = withApiSession(async (
  request: Request,
  context: RouteContext<"/api/achievements/[id]">
) => {
  const { id } = await context.params
  const body = await parseJsonBody<AchievementPayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter the achievement details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const title = readString(body.title)
  const description = readString(body.description)
  const link_url = readString(body.link_url)
  const link_label = readString(body.link_label)

  if (!title) {
    return NextResponse.json(
      buildApiError("Achievement title is required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const achievement = await updateAchievementData(id, {
    title,
    description,
    link_url,
    link_label,
  })

  if (!achievement) {
    return NextResponse.json(buildApiError("Achievement not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(achievement))
})

export const DELETE = withApiSession(async (
  _request: Request,
  context: RouteContext<"/api/achievements/[id]">
) => {
  const { id } = await context.params
  const achievement = await deleteAchievementData(id)

  if (!achievement) {
    return NextResponse.json(buildApiError("Achievement not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: achievement.id }))
})
