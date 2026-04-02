import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PrintAutoTrigger } from "@/components/cv-templates/print-auto-trigger"
import { TemplateRenderer } from "@/components/cv-templates/template-renderer"
import { Card } from "@/components/ui/card"
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
  const { id } = await params
  const cv = await getCvData(id)

  return {
    title: cv ? `${cv.name} | Print` : "Print CV",
    description: cv ? `Print or save ${cv.name} as a PDF.` : "Print a saved CV.",
  }
}

export default async function CvPrintPage({ params, searchParams }: CvPrintPageProps) {
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
    <main className="min-h-screen bg-surface-subtle/40 px-6 py-8 md:px-8 xl:px-12 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="print:hidden">
          <Link href={`/cvs/${cv.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to CV editor
          </Link>
        </div>

        <Card className="rounded-sm border border-outline-variant/60 bg-card p-5 shadow-sm print:hidden print:border-0 print:shadow-none">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-on-surface">Print preview</h1>
            <p className="text-sm text-on-surface-variant/75">
              This page uses the same template renderer as the live preview and export flow.
            </p>
            <PrintAutoTrigger autoPrint={autoprint === "1"} />
          </div>
        </Card>

        <TemplateRenderer templateId={template.id} model={renderModel} mode="print" />
      </div>
    </main>
  )
}
