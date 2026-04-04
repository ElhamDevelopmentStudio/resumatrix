import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PrintAutoTrigger } from "@/components/cv-templates/print-auto-trigger"
import { TemplateRenderer } from "@/components/cv-templates/template-renderer"
import { getRequestSession, requireRequestSession } from "@/lib/auth/server"
import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { buildCvRenderModel } from "@/lib/cvs/engine"
import { getCvData } from "@/lib/cvs/store"
import { getProfileData } from "@/lib/profiles/store"
import { getCvTemplate } from "@/lib/templates/registry"

type CvPrintPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    autoprint?: string
  }>
}

export async function generateMetadata({ params }: CvPrintPageProps): Promise<Metadata> {
  const session = await getRequestSession()

  if (!session) {
    return {
      title: {
        absolute: "Print CV",
      },
      description: "Print a saved CV.",
    }
  }

  const { id } = await params
  const cv = await getCvData(id)

  return {
    title: {
      absolute: cv ? `${cv.name} | Print` : "Print CV",
    },
    description: cv ? `Print or save ${cv.name} as a PDF.` : "Print a saved CV.",
  }
}

export default async function CvPrintPage({ params, searchParams }: CvPrintPageProps) {
  await requireRequestSession()

  const [{ id }, { autoprint }] = await Promise.all([params, searchParams])
  const cv = await getCvData(id)

  if (!cv) {
    notFound()
  }

  const [profile, careerData] = await Promise.all([
    getProfileData(cv.profile_id),
    getCareerWorkspaceData(),
  ])
  const template = getCvTemplate(cv.template_id)

  if (!profile || !template) {
    notFound()
  }

  const renderModel = buildCvRenderModel(cv, profile, careerData, template)

  return (
    <main className="min-h-screen bg-white">
      <PrintAutoTrigger autoPrint={autoprint === "1"} />
      <TemplateRenderer templateId={template.id} model={renderModel} mode="print" />
    </main>
  )
}
