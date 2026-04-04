import type { Metadata } from "next"

import { getCareerWorkspaceData } from "@/lib/career-data/store"
import type { CareerWorkspaceData } from "@/lib/career-data/types"

import { CareerDataWorkspace } from "./_components/career-data-workspace"

export const metadata: Metadata = {
  title: "Career Data",
  description: "Fill out your reusable resume data in a calmer section-by-section workspace.",
}

export default async function CareerDataPage() {
  let initialWorkspace: CareerWorkspaceData | undefined

  try {
    initialWorkspace = await getCareerWorkspaceData()
  } catch {
    initialWorkspace = undefined
  }

  return <CareerDataWorkspace initialWorkspace={initialWorkspace} />
}
