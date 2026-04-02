import {
  AtsStandardTemplate,
  buildAtsStandardHtml,
} from "@/components/cv-templates/ats-standard-template"
import {
  buildSplitHeaderHtml,
  SplitHeaderTemplate,
} from "@/components/cv-templates/split-header-template"
import type { CvTemplateMetadata } from "@/lib/cvs/types"
import type { CvTemplateDefinition } from "@/lib/templates/types"

export type CvTemplateOption = Omit<CvTemplateDefinition, "renderer" | "html_builder">

const templates: CvTemplateDefinition[] = [
  {
    id: "ats-standard",
    slug: "ats-standard",
    name: "ATS Standard",
    description: "Clean single-column layout with reliable spacing for preview, print, and exports.",
    layout_type: "single-column",
    sections: ["contacts", "experiences", "projects", "education", "skills"],
    export_formats: ["pdf", "html", "markdown", "json"],
    preview_blurb: "Best starting point when you want a simple CV that stays readable everywhere.",
    renderer: AtsStandardTemplate,
    html_builder: buildAtsStandardHtml,
  },
  {
    id: "split-header",
    slug: "split-header",
    name: "Split Header",
    description: "Large two-line name, right-aligned contact block, and strong editorial section dividers.",
    layout_type: "single-column",
    sections: ["contacts", "experiences", "projects", "education", "skills"],
    export_formats: ["pdf", "html", "markdown", "json"],
    preview_blurb: "Best when you want a more polished first impression without losing a simple, readable layout.",
    renderer: SplitHeaderTemplate,
    html_builder: buildSplitHeaderHtml,
  },
]

export function listCvTemplates(): CvTemplateMetadata[] {
  return templates.map((template) => ({
    id: template.id,
    slug: template.slug,
    name: template.name,
    description: template.description,
    layout_type: template.layout_type,
    sections: template.sections,
    export_formats: template.export_formats,
  }))
}

export function listCvTemplateOptions(): CvTemplateOption[] {
  return templates.map((template) => ({
    id: template.id,
    slug: template.slug,
    name: template.name,
    description: template.description,
    layout_type: template.layout_type,
    sections: template.sections,
    export_formats: template.export_formats,
    preview_blurb: template.preview_blurb,
  }))
}

export function listCvTemplateDefinitions() {
  return templates
}

export function getCvTemplate(templateIdOrSlug: string | null | undefined) {
  if (!templateIdOrSlug) {
    return null
  }

  return templates.find(
    (template) => template.id === templateIdOrSlug || template.slug === templateIdOrSlug
  ) ?? null
}
