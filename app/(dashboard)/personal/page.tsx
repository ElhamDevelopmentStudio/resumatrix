import type { Metadata } from "next"

import { PersonalInfoForm } from "./_components/personal-info-form"

export const metadata: Metadata = {
  title: "Personal Info",
  description: "Manage your basic resume details and contact information.",
}

export default function PersonalPage() {
  return <PersonalInfoForm />
}
