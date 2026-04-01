import { NextResponse } from "next/server"

import { buildApiError, buildApiSuccess } from "@/lib/personal/http"
import { deleteContactData, updateContactData } from "@/lib/personal/store"

export async function PUT(
  request: Request,
  context: RouteContext<"/api/contacts/[id]">
) {
  const { id } = await context.params
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
