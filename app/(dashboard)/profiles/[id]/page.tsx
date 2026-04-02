import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { getProfileData } from "@/lib/profiles/store"

import { ProfileBuilder } from "../_components/profile-builder"

type ProfileEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: ProfileEditPageProps): Promise<Metadata> {
  const { id } = await params
  const profile = await getProfileData(id)

  return {
    title: profile ? `${profile.name} | Profiles` : "Profile | Profiles",
    description: profile
      ? `Edit the ${profile.name} profile and refine what it keeps from your career data.`
      : "Edit a saved resume profile.",
  }
}

export default async function ProfileEditPage({ params }: ProfileEditPageProps) {
  const { id } = await params
  const [careerData, profile] = await Promise.all([
    getCareerWorkspaceData(),
    getProfileData(id),
  ])

  if (!profile) {
    notFound()
  }

  return <ProfileBuilder mode="edit" careerData={careerData} profile={profile} />
}
