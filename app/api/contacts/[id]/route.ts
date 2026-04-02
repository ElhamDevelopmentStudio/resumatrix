import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/career-data/http"
import { parseJsonBody, readString } from "@/lib/career-data/route-helpers"
import { deleteContactData, updateContactData } from "@/lib/career-data/store"
import { type ContactPayload } from "@/lib/career-data/types"

export async function PUT(
  request: Request,
  context: RouteContext<"/api/contacts/[id]">
) {
  const { id } = await context.params
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

  const contact = await updateContactData(id, { type, value })

  if (!contact) {
    return NextResponse.json(buildApiError("Contact not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess(contact))
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/contacts/[id]">
) {
  const { id } = await context.params
  const contact = await deleteContactData(id)

  if (!contact) {
    return NextResponse.json(buildApiError("Contact not found.", "NOT_FOUND"), {
      status: 404,
    })
  }

  return NextResponse.json(buildApiSuccess({ id: contact.id }))
}
