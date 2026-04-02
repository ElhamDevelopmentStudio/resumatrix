import type { Metadata } from "next"

import { CareerDataWorkspace } from "./_components/career-data-workspace"

export const metadata: Metadata = {
  title: "Career Data",
  description: "Fill out your reusable resume data in a calmer section-by-section workspace.",
}

export default function CareerDataPage() {
  return <CareerDataWorkspace />
}
