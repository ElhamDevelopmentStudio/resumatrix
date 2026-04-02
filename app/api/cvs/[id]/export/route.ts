import { NextResponse } from "next/server"

import { buildApiError } from "@/lib/career-data/http"
import { getCareerWorkspaceData } from "@/lib/career-data/store"
import {
  buildCvHtmlExport,
  buildCvJsonExport,
  buildCvMarkdownExport,
  getCvExportContentType,
} from "@/lib/cvs/export"
import { buildCvRenderModel } from "@/lib/cvs/engine"
import { getCvData } from "@/lib/cvs/store"
import type { CvExportFormat } from "@/lib/cvs/types"
import { getProfileData } from "@/lib/profiles/store"
import { getCvTemplate } from "@/lib/templates/registry"

type CvExportRouteProps = {
  params: Promise<{
    id: string
  }>
}

function buildFileName(value: string) {
  const nextValue = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  return nextValue || "cv"
}

export async function GET(request: Request, { params }: CvExportRouteProps) {
  const { id } = await params
  const url = new URL(request.url)
  const format = (url.searchParams.get("format") ?? "html") as CvExportFormat

  if (format === "pdf") {
    return NextResponse.redirect(new URL(`/cv-print/${id}`, request.url))
  }

  if (!["html", "json", "markdown"].includes(format)) {
    return NextResponse.json(
      buildApiError("Choose a valid export format.", "INVALID_EXPORT_FORMAT"),
      { status: 400 }
    )
  }

  const cv = await getCvData(id)

  if (!cv) {
    return NextResponse.json(
      buildApiError("We couldn’t find that CV.", "CV_NOT_FOUND"),
      { status: 404 }
    )
  }

  const [profile, careerData] = await Promise.all([
    getProfileData(cv.profile_id),
    getCareerWorkspaceData(),
  ])
  const template = getCvTemplate(cv.template_id)

  if (!profile) {
    return NextResponse.json(
      buildApiError("This CV is linked to a profile that no longer exists.", "PROFILE_NOT_FOUND"),
      { status: 404 }
    )
  }

  if (!template) {
    return NextResponse.json(
      buildApiError("This CV is linked to a template that no longer exists.", "TEMPLATE_NOT_FOUND"),
      { status: 404 }
    )
  }

  const renderModel = buildCvRenderModel(cv, profile, careerData, template)
  const fileName = `${buildFileName(cv.name)}.${format === "markdown" ? "md" : format}`

  const body =
    format === "html"
      ? buildCvHtmlExport(renderModel)
      : format === "markdown"
        ? buildCvMarkdownExport(renderModel)
        : buildCvJsonExport(renderModel)

  return new NextResponse(body, {
    headers: {
      "Content-Type": getCvExportContentType(format),
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}
