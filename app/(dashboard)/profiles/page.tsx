import type { Metadata } from "next"

import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { listProfilesData } from "@/lib/profiles/store"

import { ProfilesWorkspace } from "./_components/profiles-workspace"

export const metadata: Metadata = {
  title: "Profiles",
  description: "Create focused resume profiles from your reusable career data.",
}

export default async function ProfilesPage() {
  const [careerData, profiles] = await Promise.all([
    getCareerWorkspaceData(),
    listProfilesData(),
  ])

  return <ProfilesWorkspace careerData={careerData} initialProfiles={profiles} />
}
