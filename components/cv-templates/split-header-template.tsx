import { Fragment } from "react"

import type { CvOverrideSection, CvRenderModel } from "@/lib/cvs/types"
import {
  buildHtmlDocument,
  escapeHtml,
  getDisplayNameParts,
} from "@/lib/cvs/html"
import type { CvTemplateComponentProps } from "@/lib/templates/types"

export const splitHeaderStyles = `
.split-header-root {
  width: 100%;
  background: #ffffff;
}

.split-header-document {
  --split-header-name-primary-size: 18pt;
  --split-header-name-secondary-size: 24pt;
  --split-header-contact-size: 9.5pt;
  --split-header-body-size: 11pt;
  --split-header-meta-size: 10.5pt;
  --split-header-section-size: 10pt;
  --split-header-body-line-height: 1.34;
  --split-header-summary-line-height: 1.38;
  --split-header-tight-line-height: 1.16;
  --split-header-section-gap: 14pt;
  --split-header-entry-gap: 11pt;
  --split-header-heading-gap: 6pt;
  --split-header-detail-gap: 4pt;
  box-sizing: border-box;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  color: #1f1f22;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: var(--split-header-body-size);
  line-height: var(--split-header-body-line-height);
}

.split-header-page {
  padding: 14mm 15mm 16mm;
}

.split-header-top-line {
  height: 1px;
  width: 100%;
  margin-bottom: 12pt;
  background: #8b8b90;
}

.split-header-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 9mm;
}

.split-header-name-block {
  min-width: 0;
}

.split-header-name-primary,
.split-header-name-secondary {
  margin: 0;
  text-transform: uppercase;
  line-height: 0.92;
  letter-spacing: 0.06em;
}

.split-header-name-primary {
  font-size: var(--split-header-name-primary-size);
  font-weight: 300;
  color: #5f5f63;
}

.split-header-name-secondary {
  margin-top: 2pt;
  font-size: var(--split-header-name-secondary-size);
  font-weight: 500;
  color: #111111;
}

.split-header-contact-block {
  display: flex;
  min-width: 176px;
  max-width: 240px;
  flex-direction: column;
  align-items: flex-end;
  gap: 1pt;
  text-align: right;
  flex-shrink: 0;
}

.split-header-contact-line {
  margin: 0;
  font-size: var(--split-header-contact-size);
  line-height: 1.32;
  color: #202024;
  white-space: nowrap;
}

.split-header-summary {
  margin: 11pt 0 0;
  max-width: 74ch;
  font-size: var(--split-header-body-size);
  line-height: var(--split-header-summary-line-height);
  color: #4d4f54;
}

.split-header-divider {
  height: 2px;
  width: 100%;
  margin: 11pt 0 14pt;
  background: #c2c2c6;
}

.split-header-section + .split-header-section {
  margin-top: var(--split-header-section-gap);
}

.split-header-section-title {
  margin: 0 0 var(--split-header-heading-gap);
  font-size: var(--split-header-section-size);
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5a5a5f;
}

.split-header-entry + .split-header-entry {
  margin-top: var(--split-header-entry-gap);
}

.split-header-entry-title {
  margin: 0;
  font-size: var(--split-header-body-size);
  line-height: var(--split-header-tight-line-height);
  font-weight: 800;
  text-transform: uppercase;
  color: #111111;
}

.split-header-entry-meta,
.split-header-entry-date,
.split-header-entry-description,
.split-header-entry-details {
  margin: var(--split-header-detail-gap) 0 0;
  font-size: var(--split-header-meta-size);
  line-height: var(--split-header-body-line-height);
  color: #1f1f22;
}

.split-header-entry-description,
.split-header-entry-details {
  color: #4d4f54;
  max-width: 78ch;
}

.split-header-bullet-list,
.split-header-skill-list {
  margin: 5pt 0 0;
  padding-left: 15pt;
}

.split-header-bullet-list li,
.split-header-skill-list li {
  margin: 0;
  font-size: var(--split-header-meta-size);
  line-height: var(--split-header-body-line-height);
  color: #4d4f54;
}

.split-header-bullet-list li + li,
.split-header-skill-list li + li {
  margin-top: 2.5pt;
}

.split-header-skill-list {
  columns: 2;
  column-gap: 18pt;
}

.split-header-tech-line {
  margin: var(--split-header-detail-gap) 0 0;
  font-size: var(--split-header-meta-size);
  line-height: var(--split-header-body-line-height);
  color: #4d4f54;
  max-width: 78ch;
}

.split-header-placeholder {
  color: #9b9ca1;
}

@media (max-width: 680px) {
  .split-header-document {
    min-height: auto;
  }

  .split-header-page {
    padding: 24px;
  }

  .split-header-top-line {
    margin-bottom: 18px;
  }

  .split-header-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .split-header-contact-block {
    align-items: flex-start;
    min-width: 0;
    max-width: none;
    text-align: left;
  }

  .split-header-contact-line {
    white-space: normal;
  }

  .split-header-summary {
    max-width: 100%;
  }

  .split-header-skill-list {
    columns: 1;
  }
}

@media print {
  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .split-header-document {
    max-width: none;
    min-height: 0;
    box-shadow: none;
  }

  .split-header-page {
    padding: 14mm 15mm 16mm;
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

function shouldShowContacts(model: CvRenderModel) {
  return !model.hidden_sections.includes("contacts") && model.contacts.length > 0
}

function getSummaryText(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  const nextMode = mode ?? "preview"

  if (model.personal.summary) {
    return model.personal.summary
  }

  if (model.personal.title) {
    return model.personal.title
  }

  return nextMode === "preview" ? "Add a short summary to show it here." : ""
}

function getNameLines(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  return getDisplayNameParts(model.personal.full_name || model.meta.cv_name, mode ?? "preview")
}

function formatHeaderContactValue(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/\/+$/g, "")
}

function renderExperienceEntries(model: CvRenderModel) {
  if (!model.experiences.length) {
    return null
  }

  return (
    <section className="split-header-section" aria-label="Experience">
      <h2 className="split-header-section-title">{sectionTitles.experiences}</h2>
      {model.experiences.map((experience) => (
        <article key={experience.id} className="split-header-entry">
          <h3 className="split-header-entry-title">{experience.role || "Role"}</h3>
          <p className="split-header-entry-meta">
            {[experience.company, experience.location].filter(Boolean).join(" | ") || "Company details"}
          </p>
          <p className="split-header-entry-date">{experience.date_label}</p>
          {experience.bullets.length === 1 ? (
            <p className="split-header-entry-description">{experience.bullets[0]}</p>
          ) : experience.bullets.length ? (
            <ul className="split-header-bullet-list">
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

function renderProjectEntries(model: CvRenderModel) {
  if (!model.projects.length) {
    return null
  }

  return (
    <section className="split-header-section" aria-label="Projects">
      <h2 className="split-header-section-title">{sectionTitles.projects}</h2>
      {model.projects.map((project) => (
        <article key={project.id} className="split-header-entry">
          <h3 className="split-header-entry-title">{project.name || "Project"}</h3>
          {project.description ? (
            <p className="split-header-entry-description">{project.description}</p>
          ) : null}
          {project.tech_stack.length ? (
            <p className="split-header-tech-line">{project.tech_stack.join(" · ")}</p>
          ) : null}
          {project.bullets.length === 1 ? (
            <p className="split-header-entry-description">{project.bullets[0]}</p>
          ) : project.bullets.length ? (
            <ul className="split-header-bullet-list">
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

function renderEducationEntries(model: CvRenderModel) {
  if (!model.education.length) {
    return null
  }

  return (
    <section className="split-header-section" aria-label="Education">
      <h2 className="split-header-section-title">{sectionTitles.education}</h2>
      {model.education.map((entry) => (
        <article key={entry.id} className="split-header-entry">
          <h3 className="split-header-entry-title">{entry.degree || "Degree"}</h3>
          <p className="split-header-entry-meta">{entry.institution || "Institution"}</p>
          <p className="split-header-entry-date">{entry.date_label}</p>
          {entry.details ? <p className="split-header-entry-details">{entry.details}</p> : null}
        </article>
      ))}
    </section>
  )
}

function renderSkillEntries(model: CvRenderModel) {
  if (!model.skills.length) {
    return null
  }

  return (
    <section className="split-header-section" aria-label="Skills">
      <h2 className="split-header-section-title">{sectionTitles.skills}</h2>
      <ul className="split-header-skill-list">
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
      return null
    case "experiences":
      return renderExperienceEntries(model)
    case "projects":
      return renderProjectEntries(model)
    case "education":
      return renderEducationEntries(model)
    case "skills":
      return renderSkillEntries(model)
    default:
      return null
  }
}

export function SplitHeaderTemplate({ model, mode = "preview" }: CvTemplateComponentProps) {
  const nameLines = getNameLines(model, mode)
  const summaryText = getSummaryText(model, mode)
  const showContacts = shouldShowContacts(model)

  return (
    <div className="split-header-root">
      <style>{splitHeaderStyles}</style>
      <article className="split-header-document" aria-label={`${model.meta.cv_name} preview`}>
        <div className="split-header-page">
          <div className="split-header-top-line" />
          <header>
            <div className="split-header-hero">
              <div className="split-header-name-block">
                {nameLines.primary ? (
                  <p className="split-header-name-primary">{nameLines.primary}</p>
                ) : null}
                <h1
                  className={
                    nameLines.secondary
                      ? "split-header-name-secondary"
                      : "split-header-name-secondary split-header-placeholder"
                  }
                >
                  {nameLines.secondary || "Untitled"}
                </h1>
              </div>

              {showContacts ? (
                <div className="split-header-contact-block" aria-label="Primary contact details">
                  {model.contacts.map((contact) => (
                    <p key={contact.id} className="split-header-contact-line">
                      {formatHeaderContactValue(contact.value)}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            {summaryText ? (
              <p
                className={
                  model.personal.summary || model.personal.title
                    ? "split-header-summary"
                    : "split-header-summary split-header-placeholder"
                }
              >
                {summaryText}
              </p>
            ) : null}
          </header>

          <div className="split-header-divider" />

          {model.section_order.map((section) => (
            <Fragment key={section}>{renderSection(section, model)}</Fragment>
          ))}
        </div>
      </article>
    </div>
  )
}

function renderExperienceEntriesHtml(model: CvRenderModel) {
  if (!model.experiences.length) {
    return ""
  }

  return `
    <section class="split-header-section" aria-label="Experience">
      <h2 class="split-header-section-title">${sectionTitles.experiences}</h2>
      ${model.experiences
        .map(
          (experience) => `
            <article class="split-header-entry">
              <h3 class="split-header-entry-title">${escapeHtml(experience.role || "Role")}</h3>
              <p class="split-header-entry-meta">${escapeHtml(
                [experience.company, experience.location].filter(Boolean).join(" | ") || "Company details"
              )}</p>
              <p class="split-header-entry-date">${escapeHtml(experience.date_label)}</p>
              ${
                experience.bullets.length === 1
                  ? `<p class="split-header-entry-description">${escapeHtml(experience.bullets[0] ?? "")}</p>`
                  : experience.bullets.length
                  ? `<ul class="split-header-bullet-list">${experience.bullets
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

function renderProjectEntriesHtml(model: CvRenderModel) {
  if (!model.projects.length) {
    return ""
  }

  return `
    <section class="split-header-section" aria-label="Projects">
      <h2 class="split-header-section-title">${sectionTitles.projects}</h2>
      ${model.projects
        .map(
          (project) => `
            <article class="split-header-entry">
              <h3 class="split-header-entry-title">${escapeHtml(project.name || "Project")}</h3>
              ${project.description ? `<p class="split-header-entry-description">${escapeHtml(project.description)}</p>` : ""}
              ${project.tech_stack.length ? `<p class="split-header-tech-line">${escapeHtml(project.tech_stack.join(" · "))}</p>` : ""}
              ${
                project.bullets.length === 1
                  ? `<p class="split-header-entry-description">${escapeHtml(project.bullets[0] ?? "")}</p>`
                  : project.bullets.length
                  ? `<ul class="split-header-bullet-list">${project.bullets
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

function renderEducationEntriesHtml(model: CvRenderModel) {
  if (!model.education.length) {
    return ""
  }

  return `
    <section class="split-header-section" aria-label="Education">
      <h2 class="split-header-section-title">${sectionTitles.education}</h2>
      ${model.education
        .map(
          (entry) => `
            <article class="split-header-entry">
              <h3 class="split-header-entry-title">${escapeHtml(entry.degree || "Degree")}</h3>
              <p class="split-header-entry-meta">${escapeHtml(entry.institution || "Institution")}</p>
              <p class="split-header-entry-date">${escapeHtml(entry.date_label)}</p>
              ${entry.details ? `<p class="split-header-entry-details">${escapeHtml(entry.details)}</p>` : ""}
            </article>
          `
        )
        .join("")}
    </section>
  `
}

function renderSkillEntriesHtml(model: CvRenderModel) {
  if (!model.skills.length) {
    return ""
  }

  return `
    <section class="split-header-section" aria-label="Skills">
      <h2 class="split-header-section-title">${sectionTitles.skills}</h2>
      <ul class="split-header-skill-list">
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
      return ""
    case "experiences":
      return renderExperienceEntriesHtml(model)
    case "projects":
      return renderProjectEntriesHtml(model)
    case "education":
      return renderEducationEntriesHtml(model)
    case "skills":
      return renderSkillEntriesHtml(model)
    default:
      return ""
  }
}

export function buildSplitHeaderHtml(model: CvRenderModel) {
  const nameLines = getNameLines(model, "print")
  const summaryText = getSummaryText(model, "print")
  const showContacts = shouldShowContacts(model)

  return buildHtmlDocument(
    model.meta.cv_name,
    `
      <div class="split-header-root">
        <style>${splitHeaderStyles}</style>
        <article class="split-header-document" aria-label="${escapeHtml(model.meta.cv_name)} preview">
          <div class="split-header-page">
            <div class="split-header-top-line"></div>
            <header>
              <div class="split-header-hero">
                <div class="split-header-name-block">
                  ${nameLines.primary ? `<p class="split-header-name-primary">${escapeHtml(nameLines.primary)}</p>` : ""}
                  <h1 class="${nameLines.secondary ? "split-header-name-secondary" : "split-header-name-secondary split-header-placeholder"}">
                    ${escapeHtml(nameLines.secondary || "Untitled")}
                  </h1>
                </div>
                ${
                  showContacts
                    ? `<div class="split-header-contact-block" aria-label="Primary contact details">${model.contacts
                        .map(
                          (contact) =>
                            `<p class="split-header-contact-line">${escapeHtml(
                              formatHeaderContactValue(contact.value)
                            )}</p>`
                        )
                        .join("")}</div>`
                    : ""
                }
              </div>
              ${summaryText ? `<p class="${model.personal.summary || model.personal.title ? "split-header-summary" : "split-header-summary split-header-placeholder"}">${escapeHtml(summaryText)}</p>` : ""}
            </header>
            <div class="split-header-divider"></div>
            ${model.section_order.map((section) => renderHtmlSection(section, model)).join("")}
          </div>
        </article>
      </div>
    `
  )
}
