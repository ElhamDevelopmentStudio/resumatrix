import type { Metadata } from "next"

import { getCareerWorkspaceData } from "@/lib/career-data/store"

import { ProfileBuilder } from "../_components/profile-builder"

export const metadata: Metadata = {
  title: "New Profile",
  description: "Create a focused resume profile from your saved career data.",
}

export default async function NewProfilePage() {
  const careerData = await getCareerWorkspaceData()

  return <ProfileBuilder mode="create" careerData={careerData} profile={null} />
}
