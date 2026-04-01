import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/personal/http"
import { getPersonalData, updatePersonalData } from "@/lib/personal/store"

export async function GET() {
  const personal = await getPersonalData()
  return NextResponse.json(buildApiSuccess(personal))
}

export async function PUT(request: Request) {
  let body: Partial<{ full_name: string; title: string; summary: string }> | null = null

  try {
    body = (await request.json()) as Partial<{ full_name: string; title: string; summary: string }>
  } catch {
    return NextResponse.json(
      buildApiError("Enter your personal details before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const full_name = typeof body?.full_name === "string" ? body.full_name.trim() : ""
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const summary = typeof body?.summary === "string" ? body.summary.trim() : ""

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
