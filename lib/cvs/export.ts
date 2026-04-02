import type { CvExportFormat, CvRenderModel } from "@/lib/cvs/types"
import type { CvTemplateDefinition } from "@/lib/templates/types"

export function buildCvHtmlExport(
  template: Pick<CvTemplateDefinition, "html_builder">,
  model: CvRenderModel
) {
  return template.html_builder(model)
}

export function buildCvMarkdownExport(model: CvRenderModel) {
  const lines: string[] = []

  lines.push(`# ${model.personal.full_name || model.meta.cv_name}`)

  if (model.personal.title) {
    lines.push(`**${model.personal.title}**`)
  }

  if (model.contacts.length) {
    lines.push("", "## Contacts")
    for (const contact of model.contacts) {
      lines.push(`- **${contact.label}:** ${contact.value}`)
    }
  }

  if (model.personal.summary) {
    lines.push("", "## Summary", model.personal.summary)
  }

  if (model.experiences.length) {
    lines.push("", "## Experience")
    for (const experience of model.experiences) {
      lines.push(`### ${experience.role} — ${experience.company}`)
      lines.push(experience.date_label)
      if (experience.location) {
        lines.push(experience.location)
      }
      for (const bullet of experience.bullets) {
        lines.push(`- ${bullet}`)
      }
      lines.push("")
    }
  }

  if (model.projects.length) {
    lines.push("## Projects")
    for (const project of model.projects) {
      lines.push(`### ${project.name}`)
      if (project.description) {
        lines.push(project.description)
      }
      if (project.tech_stack.length) {
        lines.push(`Tech: ${project.tech_stack.join(", ")}`)
      }
      for (const bullet of project.bullets) {
        lines.push(`- ${bullet}`)
      }
      lines.push("")
    }
  }

  if (model.education.length) {
    lines.push("## Education")
    for (const entry of model.education) {
      lines.push(`### ${entry.degree}`)
      lines.push(`${entry.institution} — ${entry.date_label}`)
      if (entry.details) {
        lines.push(entry.details)
      }
      lines.push("")
    }
  }

  if (model.skills.length) {
    lines.push("## Skills")
    for (const skill of model.skills) {
      const detail = [skill.category, skill.level].filter(Boolean).join(" • ")
      lines.push(`- ${skill.name}${detail ? ` — ${detail}` : ""}`)
    }
  }

  return lines.join("\n").trim()
}

export function buildCvJsonExport(model: CvRenderModel) {
  return JSON.stringify(model, null, 2)
}

export function getCvExportContentType(format: Exclude<CvExportFormat, "pdf">) {
  switch (format) {
    case "html":
      return "text/html; charset=utf-8"
    case "markdown":
      return "text/markdown; charset=utf-8"
    case "json":
      return "application/json; charset=utf-8"
    default:
      return "text/plain; charset=utf-8"
  }
}
