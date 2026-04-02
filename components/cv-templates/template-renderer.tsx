import type { CvRenderModel } from "@/lib/cvs/types"
import { getCvTemplate } from "@/lib/templates/registry"
import type { CvTemplateRenderMode } from "@/lib/templates/types"

type TemplateRendererProps = {
  templateId: string
  model: CvRenderModel
  mode?: CvTemplateRenderMode
}

export function TemplateRenderer({ templateId, model, mode = "preview" }: TemplateRendererProps) {
  const template = getCvTemplate(templateId)

  if (!template) {
    return null
  }

  const Renderer = template.renderer
  return <Renderer model={model} mode={mode} />
}
