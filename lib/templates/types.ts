import type { ComponentType } from "react"

import type { CvRenderModel, CvTemplateMetadata } from "@/lib/cvs/types"

export type CvTemplateRenderMode = "preview" | "print"

export type CvTemplateComponentProps = {
  model: CvRenderModel
  mode?: CvTemplateRenderMode
}

export type CvTemplateDefinition = CvTemplateMetadata & {
  preview_blurb: string
  renderer: ComponentType<CvTemplateComponentProps>
}
