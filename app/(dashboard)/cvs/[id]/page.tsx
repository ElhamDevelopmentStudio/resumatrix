import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { getCvData } from "@/lib/cvs/store"
import { listProfilesData } from "@/lib/profiles/store"
import { listCvTemplateOptions } from "@/lib/templates/registry"

import { CvEditor } from "../_components/cv-editor"

type CvEditorPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: CvEditorPageProps): Promise<Metadata> {
  const { id } = await params
  const cv = await getCvData(id)

  return {
    title: cv ? `${cv.name} | CVs` : "CV | CVs",
    description: cv
      ? `Edit ${cv.name}, preview it live, and export it in multiple formats.`
      : "Edit a saved CV.",
  }
}

export default async function CvEditorPage({ params }: CvEditorPageProps) {
  const { id } = await params
  const [cv, careerData, profiles] = await Promise.all([
    getCvData(id),
    getCareerWorkspaceData(),
    listProfilesData(),
  ])
  const templates = listCvTemplateOptions()

  if (!cv) {
    notFound()
  }

  return <CvEditor cv={cv} profiles={profiles} careerData={careerData} templates={templates} />
}
