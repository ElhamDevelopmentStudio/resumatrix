import type { Metadata } from "next"

import { CareerDataWorkspace } from "./_components/career-data-workspace"

export const metadata: Metadata = {
  title: "Career Data",
  description: "Manage all of your reusable resume data in one unified workspace.",
}

export default function CareerDataPage() {
  return <CareerDataWorkspace />
}
