import { NextResponse } from "next/server"

import { withApiSession } from "@/lib/auth/server"
import { buildApiSuccess } from "@/lib/career-data/http"
import { listCvTemplates } from "@/lib/templates/registry"

export const GET = withApiSession(async () => {
  return NextResponse.json(buildApiSuccess(listCvTemplates()))
})
