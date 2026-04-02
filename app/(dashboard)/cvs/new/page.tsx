import type { Metadata } from "next"

import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { listProfilesData } from "@/lib/profiles/store"
import { listCvTemplateOptions } from "@/lib/templates/registry"

import { CvCreator } from "../_components/cv-creator"

export const metadata: Metadata = {
  title: "New CV",
  description: "Create a CV from a profile and template with a live preview.",
}

export default async function NewCvPage() {
  const [careerData, profiles] = await Promise.all([
    getCareerWorkspaceData(),
    listProfilesData(),
  ])
  const templates = listCvTemplateOptions()

  return <CvCreator profiles={profiles} careerData={careerData} templates={templates} />
}
