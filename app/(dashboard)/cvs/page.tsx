import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { getCareerWorkspaceData } from "@/lib/career-data/store"
import { buildCvPreview, buildCvRenderModel } from "@/lib/cvs/engine"
import { buildCvCoverageSummary, formatCvUpdatedAt } from "@/lib/cvs/presentation"
import { listCvsData } from "@/lib/cvs/store"
import { listProfilesData } from "@/lib/profiles/store"
import { listCvTemplateOptions } from "@/lib/templates/registry"

import { CvExportLinks } from "./_components/cv-export-links"

export const metadata: Metadata = {
  title: "CVs",
  description: "Create, review, export, and manage generated CVs.",
}

export default async function CvsPage() {
  const [careerData, cvs, profiles] = await Promise.all([
    getCareerWorkspaceData(),
    listCvsData(),
    listProfilesData(),
  ])

  const templates = listCvTemplateOptions()
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))
  const templateMap = new Map(templates.map((template) => [template.id, template]))

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 xl:px-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
            CV library
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface md:text-4xl">Your CVs</h1>
          <p className="text-sm text-on-surface-variant/75 md:text-base">
            Create role-specific CVs from your saved career data, then preview, export, and refine each version.
          </p>
        </div>

        <Link href="/cvs/new" className="inline-flex rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
          Create CV
        </Link>
      </div>

      {!cvs.length ? (
        <Empty className="mt-10 rounded-sm border border-dashed border-outline-variant/70 bg-card py-20">
          <EmptyHeader>
            <EmptyTitle>No CVs yet</EmptyTitle>
            <EmptyDescription>
              Start by creating one CV from a profile and the ATS Standard template.
            </EmptyDescription>
          </EmptyHeader>
          <div className="mt-6 flex justify-center">
            <Link href="/cvs/new" className="inline-flex rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              Create your first CV
            </Link>
          </div>
        </Empty>
      ) : (
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {cvs.map((cv) => {
            const profile = profileMap.get(cv.profile_id)
            const template = templateMap.get(cv.template_id)
            const renderModel = profile && template ? buildCvRenderModel(cv, profile, careerData, template) : null
            const preview = renderModel ? buildCvPreview(renderModel) : null

            return (
              <Card key={cv.id} className="rounded-sm border border-outline-variant/60 bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-on-surface">{cv.name}</h2>
                      <Badge variant={profile && template ? "outline" : "destructive"}>
                        {profile && template ? "Ready" : "Needs attention"}
                      </Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant/75">
                      {profile ? profile.name : "Missing profile"} · {template ? template.name : "Missing template"}
                    </p>
                    <p className="text-sm text-on-surface-variant/70">Updated {formatCvUpdatedAt(cv.updated_at)}</p>
                  </div>

                  <Link href={`/cvs/${cv.id}`} className="inline-flex rounded-sm border border-outline-variant/60 px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-subtle">
                    Open editor
                  </Link>
                </div>

                <div className="mt-5 rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4">
                  {preview ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-on-surface">{buildCvCoverageSummary(preview)}</p>
                      <p className="text-sm text-on-surface-variant/75">
                        {preview.visibleSectionCount} visible section{preview.visibleSectionCount === 1 ? "" : "s"} · {preview.totalItemCount} total item{preview.totalItemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant/75">
                      This CV cannot render until its profile and template are both available again.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {profile && template ? <CvExportLinks cvId={cv.id} /> : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
