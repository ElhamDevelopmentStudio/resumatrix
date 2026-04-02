import { Card } from "@/components/ui/card"
import { TemplateRenderer } from "@/components/cv-templates/template-renderer"
import { buildCvCoverageSummary } from "@/lib/cvs/presentation"
import type { CvPreview, CvRenderModel } from "@/lib/cvs/types"

type CvPreviewPanelProps = {
  title: string
  description: string
  templateId: string
  model: CvRenderModel
  preview: CvPreview
}

export function CvPreviewPanel({
  title,
  description,
  templateId,
  model,
  preview,
}: CvPreviewPanelProps) {
  return (
    <Card className="overflow-hidden rounded-sm border border-outline-variant/60 bg-card shadow-sm">
      <div className="border-b border-outline-variant/60 px-5 py-4">
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant/75">{description}</p>
        <p className="mt-3 text-xs font-medium tracking-[0.16em] text-on-surface-variant/60 uppercase">
          {buildCvCoverageSummary(preview)}
        </p>
      </div>
      <div className="max-h-[75vh] overflow-auto bg-surface-subtle/40 p-4 md:p-6">
        <TemplateRenderer templateId={templateId} model={model} mode="preview" />
      </div>
    </Card>
  )
}
