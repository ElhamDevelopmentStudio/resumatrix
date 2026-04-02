import { atsStandardStyles } from "@/components/cv-templates/ats-standard-template"
import type { CvExportFormat, CvRenderModel } from "@/lib/cvs/types"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function buildHtmlDocument(title: string, bodyMarkup: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title></head><body>${bodyMarkup}</body></html>`
}

function renderContacts(model: CvRenderModel) {
  if (!model.contacts.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Contacts">
      <h2 class="cv-section-title">Contacts</h2>
      <div class="cv-item">
        ${model.contacts
          .map(
            (contact) =>
              `<p class="cv-item-description"><strong>${escapeHtml(contact.label)}:</strong> ${escapeHtml(contact.value)}</p>`
          )
          .join("")}
      </div>
    </section>
  `
}

function renderExperiences(model: CvRenderModel) {
  if (!model.experiences.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Experience">
      <h2 class="cv-section-title">Experience</h2>
      ${model.experiences
        .map(
          (experience) => `
            <article class="cv-item">
              <div class="cv-item-header">
                <div>
                  <h3 class="cv-item-title">${escapeHtml(experience.role || "Role")}</h3>
                  <p class="cv-item-subtitle">${escapeHtml(
                    [experience.company, experience.location].filter(Boolean).join(" • ") || "Company details"
                  )}</p>
                </div>
                <p class="cv-item-date">${escapeHtml(experience.date_label)}</p>
              </div>
              ${
                experience.bullets.length
                  ? `<ul class="cv-bullet-list">${experience.bullets
                      .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
                      .join("")}</ul>`
                  : ""
              }
            </article>
          `
        )
        .join("")}
    </section>
  `
}

function renderProjects(model: CvRenderModel) {
  if (!model.projects.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Projects">
      <h2 class="cv-section-title">Projects</h2>
      ${model.projects
        .map(
          (project) => `
            <article class="cv-item">
              <div class="cv-item-header">
                <div>
                  <h3 class="cv-item-title">${escapeHtml(project.name || "Project")}</h3>
                  ${project.description ? `<p class="cv-item-description">${escapeHtml(project.description)}</p>` : ""}
                </div>
              </div>
              ${
                project.tech_stack.length
                  ? `<div class="cv-tech-list">${project.tech_stack
                      .map((tech) => `<span class="cv-tech-pill">${escapeHtml(tech)}</span>`)
                      .join("")}</div>`
                  : ""
              }
              ${
                project.bullets.length
                  ? `<ul class="cv-bullet-list">${project.bullets
                      .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
                      .join("")}</ul>`
                  : ""
              }
            </article>
          `
        )
        .join("")}
    </section>
  `
}

function renderEducation(model: CvRenderModel) {
  if (!model.education.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Education">
      <h2 class="cv-section-title">Education</h2>
      ${model.education
        .map(
          (entry) => `
            <article class="cv-item">
              <div class="cv-item-header">
                <div>
                  <h3 class="cv-item-title">${escapeHtml(entry.degree || "Degree")}</h3>
                  <p class="cv-item-subtitle">${escapeHtml(entry.institution || "Institution")}</p>
                  ${entry.details ? `<p class="cv-item-details">${escapeHtml(entry.details)}</p>` : ""}
                </div>
                <p class="cv-item-date">${escapeHtml(entry.date_label)}</p>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `
}

function renderSkills(model: CvRenderModel) {
  if (!model.skills.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Skills">
      <h2 class="cv-section-title">Skills</h2>
      <ul class="cv-skill-list">
        ${model.skills
          .map((skill) => {
            const detail = [skill.category, skill.level].filter(Boolean).join(" • ")
            return `<li><strong>${escapeHtml(skill.name)}</strong>${detail ? ` — ${escapeHtml(detail)}` : ""}</li>`
          })
          .join("")}
      </ul>
    </section>
  `
}

function renderSection(section: string, model: CvRenderModel) {
  switch (section) {
    case "contacts":
      return renderContacts(model)
    case "experiences":
      return renderExperiences(model)
    case "projects":
      return renderProjects(model)
    case "education":
      return renderEducation(model)
    case "skills":
      return renderSkills(model)
    default:
      return ""
  }
}

function buildAtsStandardMarkup(model: CvRenderModel) {
  const displayName = model.personal.full_name || model.meta.cv_name
  const displayTitle = model.personal.title || model.meta.profile_name

  return `
    <div class="cv-preview-root">
      <style>${atsStandardStyles}</style>
      <article class="cv-document" aria-label="${escapeHtml(model.meta.cv_name)} preview">
        <div class="cv-page">
          <header class="cv-header">
            <h1 class="cv-name">${escapeHtml(displayName || "Untitled")}</h1>
            ${displayTitle ? `<p class="cv-role">${escapeHtml(displayTitle)}</p>` : ""}
            ${
              model.contacts.length
                ? `<ul class="cv-contact-list" aria-label="Primary contact details">${model.contacts
                    .map(
                      (contact) =>
                        `<li class="cv-contact-item"><strong>${escapeHtml(contact.label)}</strong> ${escapeHtml(contact.value)}</li>`
                    )
                    .join("")}</ul>`
                : ""
            }
            ${model.personal.summary ? `<p class="cv-summary">${escapeHtml(model.personal.summary)}</p>` : ""}
          </header>
          ${model.section_order.map((section) => renderSection(section, model)).join("")}
        </div>
      </article>
    </div>
  `
}

export function buildCvHtmlExport(model: CvRenderModel) {
  return buildHtmlDocument(model.meta.cv_name, buildAtsStandardMarkup(model))
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
