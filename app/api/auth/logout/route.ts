import { NextResponse } from "next/server"

import { clearRequestSession } from "@/lib/auth/server"
import { buildApiSuccess } from "@/lib/career-data/http"

export async function POST() {
  await clearRequestSession()

  return NextResponse.json(
    buildApiSuccess({
      success: true,
    })
  )
}
