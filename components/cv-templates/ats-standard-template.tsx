import type { CvOverrideSection, CvRenderModel } from "@/lib/cvs/types"
import { buildHtmlDocument, escapeHtml } from "@/lib/cvs/html"
import type { CvTemplateComponentProps } from "@/lib/templates/types"

export const atsStandardStyles = `
.cv-preview-root {
  width: 100%;
}

.cv-document {
  box-sizing: border-box;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  color: #0f172a;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.12);
}

.cv-page {
  padding: 20mm 16mm;
}

.cv-header {
  border-bottom: 1px solid #dbe3ef;
  padding-bottom: 16px;
}

.cv-name {
  margin: 0;
  font-size: 31px;
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.cv-role {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: #334155;
}

.cv-summary {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.65;
  color: #334155;
}

.cv-contact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.cv-contact-item {
  font-size: 11px;
  line-height: 1.4;
  color: #475569;
}

.cv-contact-item strong {
  color: #0f172a;
}

.cv-section {
  padding-top: 18px;
}

.cv-section-title {
  margin: 0 0 10px;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #334155;
}

.cv-item + .cv-item {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #e5ebf3;
}

.cv-item-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.cv-item-title {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 700;
  color: #0f172a;
}

.cv-item-subtitle,
.cv-item-date,
.cv-item-description,
.cv-item-meta,
.cv-item-details {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: #475569;
}

.cv-item-date {
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
}

.cv-bullet-list,
.cv-skill-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.cv-bullet-list li,
.cv-skill-list li {
  margin: 0;
  font-size: 11px;
  line-height: 1.65;
  color: #1e293b;
}

.cv-tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0;
}

.cv-tech-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid #dbe3ef;
  font-size: 10px;
  line-height: 1.4;
  color: #334155;
}

.cv-placeholder {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .cv-document {
    min-height: auto;
  }

  .cv-page {
    padding: 20px;
  }

  .cv-item-header {
    flex-direction: column;
  }

  .cv-item-date {
    text-align: left;
    white-space: normal;
  }
}

@media print {
  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .cv-document {
    max-width: none;
    min-height: 0;
    box-shadow: none;
  }

  .cv-page {
    padding: 14mm 12mm;
  }
}
`

const sectionTitles: Record<CvOverrideSection, string> = {
  contacts: "Contacts",
  experiences: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
}

function renderContacts(model: CvRenderModel) {
  if (!model.contacts.length) {
    return null
  }

  return (
    <section className="cv-section" aria-label="Contacts">
      <h2 className="cv-section-title">{sectionTitles.contacts}</h2>
      <div className="cv-item">
        {model.contacts.map((contact) => (
          <p key={contact.id} className="cv-item-description">
            <strong>{contact.label}:</strong> {contact.value}
          </p>
        ))}
      </div>
    </section>
  )
}

function renderExperiences(model: CvRenderModel) {
  if (!model.experiences.length) {
    return null
  }

  return (
    <section className="cv-section" aria-label="Experience">
      <h2 className="cv-section-title">{sectionTitles.experiences}</h2>
      {model.experiences.map((experience) => (
        <article key={experience.id} className="cv-item">
          <div className="cv-item-header">
            <div>
              <h3 className="cv-item-title">{experience.role || "Role"}</h3>
              <p className="cv-item-subtitle">
                {[experience.company, experience.location].filter(Boolean).join(" • ") || "Company details"}
              </p>
            </div>
            <p className="cv-item-date">{experience.date_label}</p>
          </div>
          {experience.bullets.length ? (
            <ul className="cv-bullet-list">
              {experience.bullets.map((bullet, index) => (
                <li key={`${experience.id}-${index}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  )
}

function renderProjects(model: CvRenderModel) {
  if (!model.projects.length) {
    return null
  }

  return (
    <section className="cv-section" aria-label="Projects">
      <h2 className="cv-section-title">{sectionTitles.projects}</h2>
      {model.projects.map((project) => (
        <article key={project.id} className="cv-item">
          <div className="cv-item-header">
            <div>
              <h3 className="cv-item-title">{project.name || "Project"}</h3>
              {project.description ? (
                <p className="cv-item-description">{project.description}</p>
              ) : null}
            </div>
          </div>
          {project.tech_stack.length ? (
            <div className="cv-tech-list">
              {project.tech_stack.map((tech) => (
                <span key={`${project.id}-${tech}`} className="cv-tech-pill">
                  {tech}
                </span>
              ))}
            </div>
          ) : null}
          {project.bullets.length ? (
            <ul className="cv-bullet-list">
              {project.bullets.map((bullet, index) => (
                <li key={`${project.id}-${index}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  )
}

function renderEducation(model: CvRenderModel) {
  if (!model.education.length) {
    return null
  }

  return (
    <section className="cv-section" aria-label="Education">
      <h2 className="cv-section-title">{sectionTitles.education}</h2>
      {model.education.map((entry) => (
        <article key={entry.id} className="cv-item">
          <div className="cv-item-header">
            <div>
              <h3 className="cv-item-title">{entry.degree || "Degree"}</h3>
              <p className="cv-item-subtitle">{entry.institution || "Institution"}</p>
              {entry.details ? <p className="cv-item-details">{entry.details}</p> : null}
            </div>
            <p className="cv-item-date">{entry.date_label}</p>
          </div>
        </article>
      ))}
    </section>
  )
}

function renderSkills(model: CvRenderModel) {
  if (!model.skills.length) {
    return null
  }

  return (
    <section className="cv-section" aria-label="Skills">
      <h2 className="cv-section-title">{sectionTitles.skills}</h2>
      <ul className="cv-skill-list">
        {model.skills.map((skill) => (
          <li key={skill.id}>
            <strong>{skill.name}</strong>
            {[skill.category, skill.level].filter(Boolean).length ? (
              <span> — {[skill.category, skill.level].filter(Boolean).join(" • ")}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function renderSection(section: CvOverrideSection, model: CvRenderModel) {
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
      return null
  }
}

function getDisplayName(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  if (model.personal.full_name) {
    return model.personal.full_name
  }

  return mode === "preview" ? "Your name" : ""
}

function getDisplayTitle(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  if (model.personal.title) {
    return model.personal.title
  }

  if (mode === "preview") {
    return model.meta.profile_name || "Professional title"
  }

  return ""
}

export function AtsStandardTemplate({ model, mode = "preview" }: CvTemplateComponentProps) {
  const displayName = getDisplayName(model, mode)
  const displayTitle = getDisplayTitle(model, mode)

  return (
    <div className="cv-preview-root">
      <style>{atsStandardStyles}</style>
      <article className="cv-document" aria-label={`${model.meta.cv_name} preview`}>
        <div className="cv-page">
          <header className="cv-header">
            <h1 className={displayName ? "cv-name" : "cv-name cv-placeholder"}>{displayName || "Untitled"}</h1>
            {displayTitle ? <p className="cv-role">{displayTitle}</p> : null}
            {model.contacts.length ? (
              <ul className="cv-contact-list" aria-label="Primary contact details">
                {model.contacts.map((contact) => (
                  <li key={contact.id} className="cv-contact-item">
                    <strong>{contact.label}</strong> {contact.value}
                  </li>
                ))}
              </ul>
            ) : null}
            {model.personal.summary ? (
              <p className="cv-summary">{model.personal.summary}</p>
            ) : mode === "preview" ? (
              <p className="cv-summary cv-placeholder">Add a short summary in Career Data to show it here.</p>
            ) : null}
          </header>

          {model.section_order.map((section) => (
            <div key={section}>{renderSection(section, model)}</div>
          ))}
        </div>
      </article>
    </div>
  )
}

function renderContactsHtml(model: CvRenderModel) {
  if (!model.contacts.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Contacts">
      <h2 class="cv-section-title">${sectionTitles.contacts}</h2>
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

function renderExperiencesHtml(model: CvRenderModel) {
  if (!model.experiences.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Experience">
      <h2 class="cv-section-title">${sectionTitles.experiences}</h2>
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

function renderProjectsHtml(model: CvRenderModel) {
  if (!model.projects.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Projects">
      <h2 class="cv-section-title">${sectionTitles.projects}</h2>
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

function renderEducationHtml(model: CvRenderModel) {
  if (!model.education.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Education">
      <h2 class="cv-section-title">${sectionTitles.education}</h2>
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

function renderSkillsHtml(model: CvRenderModel) {
  if (!model.skills.length) {
    return ""
  }

  return `
    <section class="cv-section" aria-label="Skills">
      <h2 class="cv-section-title">${sectionTitles.skills}</h2>
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

function renderHtmlSection(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "contacts":
      return renderContactsHtml(model)
    case "experiences":
      return renderExperiencesHtml(model)
    case "projects":
      return renderProjectsHtml(model)
    case "education":
      return renderEducationHtml(model)
    case "skills":
      return renderSkillsHtml(model)
    default:
      return ""
  }
}

export function buildAtsStandardHtml(model: CvRenderModel) {
  const displayName = getDisplayName(model, "print")
  const displayTitle = getDisplayTitle(model, "print")

  return buildHtmlDocument(
    model.meta.cv_name,
    `
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
            ${model.section_order.map((section) => renderHtmlSection(section, model)).join("")}
          </div>
        </article>
      </div>
    `
  )
}
