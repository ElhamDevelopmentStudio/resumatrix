import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { createAchievementData, listAchievements } from "@/lib/career-data/store"
import { type AchievementPayload } from "@/lib/career-data/types"

export const GET = withApiSession(async () => {
  const achievements = await listAchievements()
  return NextResponse.json(buildApiSuccess(achievements))
})

export const POST = withApiSession(async (request: Request) => {
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

  const achievement = await createAchievementData({
    title,
    description,
    link_url,
    link_label,
  })

  return NextResponse.json(buildApiSuccess(achievement), { status: 201 })
})
