import { NextResponse } from "next/server"

import { buildApiSuccess } from "@/lib/career-data/http"
import { listCvTemplates } from "@/lib/templates/registry"

export async function GET() {
  return NextResponse.json(buildApiSuccess(listCvTemplates()))
}
