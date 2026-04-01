import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/personal/http"
import { createContactData, listContacts } from "@/lib/personal/store"

export async function GET() {
  const contacts = await listContacts()
  return NextResponse.json(buildApiSuccess(contacts))
}

export async function POST(request: Request) {
  let body: Partial<{ type: string; value: string }> | null = null

  try {
    body = (await request.json()) as Partial<{ type: string; value: string }>
  } catch {
    return NextResponse.json(
      buildApiError("Enter a contact type and value before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const type = typeof body?.type === "string" ? body.type.trim() : ""
  const value = typeof body?.value === "string" ? body.value.trim() : ""

  if (!type || !value) {
    return NextResponse.json(
      buildApiError("Contact type and value are required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const contact = await createContactData({
    type,
    value,
  })

  return NextResponse.json(buildApiSuccess(contact), { status: 201 })
}
