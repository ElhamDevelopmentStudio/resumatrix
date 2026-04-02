import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { getPersonalData, updatePersonalData } from "@/lib/career-data/store"
import { type PersonalData } from "@/lib/career-data/types"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"

export async function GET() {
  const personal = await getPersonalData()
  return NextResponse.json(buildApiSuccess(personal))
}

export async function PUT(request: Request) {
  const body = await parseJsonBody<PersonalData>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter your personal details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const full_name = readString(body.full_name)
  const title = readString(body.title)
  const summary = readString(body.summary)

  if (!full_name) {
    return NextResponse.json(buildApiError("Full name is required.", "VALIDATION_ERROR"), {
      status: 400,
    })
  }

  const personal = await updatePersonalData({
    full_name,
    title,
    summary,
  })

  return NextResponse.json(buildApiSuccess(personal))
}
