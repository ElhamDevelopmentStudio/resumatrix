import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { createContactData, listContacts } from "@/lib/career-data/store"
import { type ContactPayload } from "@/lib/career-data/types"

export async function GET() {
  const contacts = await listContacts()
  return NextResponse.json(buildApiSuccess(contacts))
}

export async function POST(request: Request) {
  const body = await parseJsonBody<ContactPayload>(request)

  if (!body) {
    return NextResponse.json(
      buildApiError("Enter a contact type and value before saving.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const type = readString(body.type)
  const value = readString(body.value)

  if (!type || !value) {
    return NextResponse.json(
      buildApiError("Contact type and value are required.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const contact = await createContactData({ type, value })

  return NextResponse.json(buildApiSuccess(contact), { status: 201 })
}
