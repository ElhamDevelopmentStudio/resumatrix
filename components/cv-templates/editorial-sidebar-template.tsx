import { Fragment } from "react"

import type { CvOverrideSection, CvRenderContact, CvRenderModel, CvRenderSkill } from "@/lib/cvs/types"
import { buildHtmlDocument, escapeHtml, getDisplayNameParts } from "@/lib/cvs/html"
import type { CvTemplateComponentProps } from "@/lib/templates/types"

type ContactIconKind = "phone" | "email" | "location" | "linkedin" | "link"

type SkillGroup = {
  label: string
  items: CvRenderSkill[]
}

export const editorialSidebarStyles = `
.editorial-sidebar-root {
  width: 100%;
  background: #ffffff;
}

.editorial-sidebar-document {
  --editorial-sidebar-name-size: 23pt;
  --editorial-sidebar-title-size: 10.5pt;
  --editorial-sidebar-body-size: 10pt;
  --editorial-sidebar-meta-size: 9.6pt;
  --editorial-sidebar-section-size: 10.5pt;
  --editorial-sidebar-body-line-height: 1.42;
  box-sizing: border-box;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  color: #161616;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: var(--editorial-sidebar-body-size);
  line-height: var(--editorial-sidebar-body-line-height);
}

.editorial-sidebar-page {
  padding: 13mm 13mm 14mm;
}

.editorial-sidebar-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  grid-template-areas:
    "name contacts"
    "title contacts";
  column-gap: 18px;
  row-gap: 12px;
  align-items: start;
}

.editorial-sidebar-name-block {
  grid-area: name;
  min-width: 0;
}

.editorial-sidebar-name-line {
  margin: 0;
  font-size: var(--editorial-sidebar-name-size);
  line-height: 0.94;
  font-weight: 300;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #111111;
}

.editorial-sidebar-name-line + .editorial-sidebar-name-line {
  margin-top: 4pt;
}

.editorial-sidebar-title {
  grid-area: title;
  margin: 0;
  font-size: var(--editorial-sidebar-title-size);
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #202020;
}

.editorial-sidebar-contact-list {
  grid-area: contacts;
  display: flex;
  flex-direction: column;
  gap: 7pt;
  margin: 2px 0 0;
}

.editorial-sidebar-contact-row {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.editorial-sidebar-contact-icon {
  display: inline-flex;
  height: 18px;
  width: 18px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #111111;
}

.editorial-sidebar-contact-icon svg {
  display: block;
  height: 18px;
  width: 18px;
}

.editorial-sidebar-contact-value {
  margin: 0;
  min-width: 0;
  font-size: var(--editorial-sidebar-meta-size);
  line-height: 1.32;
  color: #202020;
  word-break: break-word;
}

.editorial-sidebar-body {
  display: grid;
  grid-template-columns: 27% minmax(0, 1fr);
  margin-top: 16pt;
  border-top: 2px solid #272727;
  align-items: start;
}

.editorial-sidebar-body--main-only,
.editorial-sidebar-body--sidebar-only {
  grid-template-columns: minmax(0, 1fr);
}

.editorial-sidebar-sidebar {
  padding: 14pt 16pt 0 0;
}

.editorial-sidebar-main {
  border-left: 2px solid #272727;
  padding: 14pt 0 0 18pt;
}

.editorial-sidebar-body--main-only .editorial-sidebar-main {
  border-left: 0;
  padding-left: 0;
}

.editorial-sidebar-body--sidebar-only .editorial-sidebar-sidebar {
  padding-right: 0;
}

.editorial-sidebar-column-section + .editorial-sidebar-column-section {
  margin-top: 16pt;
  border-top: 1px solid #c8c8cb;
  padding-top: 12pt;
}

.editorial-sidebar-section-title {
  margin: 0 0 9pt;
  font-size: var(--editorial-sidebar-section-size);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #202226;
}

.editorial-sidebar-summary-text {
  margin: 0;
  max-width: 76ch;
  font-size: var(--editorial-sidebar-body-size);
  line-height: 1.46;
  color: #222222;
}

.editorial-sidebar-placeholder {
  color: #7e7e7e;
}

.editorial-sidebar-education-item + .editorial-sidebar-education-item,
.editorial-sidebar-experience-item + .editorial-sidebar-experience-item,
.editorial-sidebar-project-item + .editorial-sidebar-project-item {
  margin-top: 12pt;
}

.editorial-sidebar-education-degree,
.editorial-sidebar-experience-role,
.editorial-sidebar-project-name,
.editorial-sidebar-skill-group-title {
  margin: 0;
  font-size: var(--editorial-sidebar-body-size);
  line-height: 1.22;
  font-weight: 700;
  text-transform: uppercase;
  color: #111111;
}

.editorial-sidebar-education-school,
.editorial-sidebar-experience-meta,
.editorial-sidebar-project-meta {
  margin: 3pt 0 0;
  font-size: var(--editorial-sidebar-meta-size);
  line-height: 1.34;
  font-weight: 700;
  color: #1b1b1b;
}

.editorial-sidebar-education-details,
.editorial-sidebar-education-date,
.editorial-sidebar-project-description {
  margin: 3pt 0 0;
  font-size: var(--editorial-sidebar-meta-size);
  line-height: 1.38;
  color: #202020;
}

.editorial-sidebar-bullet-list {
  margin: 5pt 0 0;
  padding-left: 15pt;
}

.editorial-sidebar-bullet-list li,
.editorial-sidebar-skill-list li {
  margin: 0;
  font-size: var(--editorial-sidebar-body-size);
  line-height: 1.38;
  color: #1f1f1f;
}

.editorial-sidebar-bullet-list li + li,
.editorial-sidebar-skill-list li + li {
  margin-top: 3pt;
}

.editorial-sidebar-skill-group + .editorial-sidebar-skill-group {
  margin-top: 14pt;
}

.editorial-sidebar-skill-list {
  margin: 6pt 0 0;
  padding: 0;
  list-style: none;
}

@media (max-width: 760px) {
  .editorial-sidebar-page {
    padding: 24px;
  }

  .editorial-sidebar-header,
  .editorial-sidebar-body,
  .editorial-sidebar-body--main-only,
  .editorial-sidebar-body--sidebar-only {
    grid-template-columns: minmax(0, 1fr);
  }

  .editorial-sidebar-header {
    grid-template-areas:
      "name"
      "title"
      "contacts";
  }

  .editorial-sidebar-main {
    border-left: 0;
    padding: 18px 0 0;
  }

  .editorial-sidebar-sidebar {
    padding-right: 0;
  }

  .editorial-sidebar-column-section + .editorial-sidebar-column-section {
    margin-top: 16px;
    padding-top: 14px;
  }
}

@media print {
  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .editorial-sidebar-document {
    max-width: none;
    min-height: 0;
  }
}
`

const sectionTitles: Record<Exclude<CvOverrideSection, "contacts">, string> = {
  experiences: "Professional Experience",
  projects: "Projects",
  education: "Education",
  skills: "Core Skills",
}

function getDisplayTitle(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  if (model.personal.title.trim()) {
    return model.personal.title
  }

  return mode === "preview" ? "Professional Title" : ""
}

function getDisplaySummary(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  if (model.personal.summary.trim()) {
    return model.personal.summary
  }

  return mode === "preview"
    ? "Write a summary of your qualifications, strengths, and focus for this CV."
    : ""
}

function formatContactValue(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/g, "")
}

function getContactIconKind(contact: CvRenderContact): ContactIconKind {
  const type = contact.type.toLowerCase()
  const value = contact.value.toLowerCase()

  if (type.includes("phone") || /^\+?[\d\s().-]+$/.test(contact.value.trim())) {
    return "phone"
  }

  if (type.includes("email") || value.includes("@")) {
    return "email"
  }

  if (type.includes("linkedin") || value.includes("linkedin")) {
    return "linkedin"
  }

  if (
    type.includes("location") ||
    type.includes("address") ||
    (value.includes(",") && !value.includes("/") && !value.includes("@"))
  ) {
    return "location"
  }

  return "link"
}

function buildContactRows(model: CvRenderModel) {
  if (model.hidden_sections.includes("contacts")) {
    return []
  }

  return model.contacts.map((contact) => ({
    id: contact.id,
    kind: getContactIconKind(contact),
    value: formatContactValue(contact.value),
  }))
}

function buildSkillGroups(skills: CvRenderSkill[]) {
  const groups = new Map<string, CvRenderSkill[]>()

  for (const skill of skills) {
    const label = skill.category.trim() || "General"
    const existing = groups.get(label)

    if (existing) {
      existing.push(skill)
      continue
    }

    groups.set(label, [skill])
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items })) satisfies SkillGroup[]
}

function getNameLines(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  return getDisplayNameParts(model.personal.full_name || model.meta.cv_name, mode ?? "preview")
}

function getLeftSections(model: CvRenderModel) {
  return model.section_order.filter((section) => section === "education" || section === "skills")
}

function getRightSections(model: CvRenderModel) {
  return model.section_order.filter((section) => section === "experiences" || section === "projects")
}

function getBodyClassName(hasSidebar: boolean, hasMain: boolean) {
  if (!hasSidebar) {
    return "editorial-sidebar-body editorial-sidebar-body--main-only"
  }

  if (!hasMain) {
    return "editorial-sidebar-body editorial-sidebar-body--sidebar-only"
  }

  return "editorial-sidebar-body"
}

function getContactIconSvg(kind: ContactIconKind) {
  switch (kind) {
    case "phone":
      return `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="8.5" fill="#111111"/><rect x="6.1" y="3.6" width="5.8" height="10.8" rx="1.2" fill="none" stroke="#ffffff" stroke-width="1.2"/><circle cx="9" cy="12.2" r="0.7" fill="#ffffff"/></svg>`
    case "email":
      return `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="8.5" fill="#111111"/><path d="M4.6 6.1h8.8v5.8H4.6z" fill="none" stroke="#ffffff" stroke-width="1.2"/><path d="M5.1 6.7 9 9.6l3.9-2.9" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    case "location":
      return `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="8.5" fill="#111111"/><path d="M5.1 8.4 9 5.1l3.9 3.3v4.3h-2.3V9.8H7.4v2.9H5.1z" fill="#ffffff"/><path d="M4.7 8.6 9 4.9l4.3 3.7" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    case "linkedin":
      return `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="8.5" fill="#111111"/><circle cx="6" cy="6" r="1.1" fill="#ffffff"/><path d="M5.2 8h1.6v4.6H5.2zM8.4 8H10v.7c.4-.5 1-.9 1.8-.9 1.3 0 2 .8 2 2.3v2.5h-1.7V10.4c0-.7-.3-1.1-.9-1.1-.7 0-1.1.5-1.1 1.1v2.2H8.4z" fill="#ffffff"/></svg>`
    case "link":
      return `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="8.5" fill="#111111"/><path d="M7.2 10.8 10.8 7.2M6.7 8.4l-1.2 1.2a1.7 1.7 0 0 0 2.4 2.4l1.2-1.2M11.3 9.6l1.2-1.2a1.7 1.7 0 1 0-2.4-2.4L8.9 7.2" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
}

function ContactIcon({ kind }: { kind: ContactIconKind }) {
  return (
    <span
      className="editorial-sidebar-contact-icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: getContactIconSvg(kind) }}
    />
  )
}

function renderEducationSection(model: CvRenderModel) {
  if (!model.education.length) {
    return null
  }

  return (
    <section className="editorial-sidebar-column-section" aria-label={sectionTitles.education}>
      <h2 className="editorial-sidebar-section-title">{sectionTitles.education}</h2>
      {model.education.map((entry) => (
        <article key={entry.id} className="editorial-sidebar-education-item">
          <h3 className="editorial-sidebar-education-degree">{entry.degree || "Degree name"}</h3>
          <p className="editorial-sidebar-education-school">{entry.institution || "University name"}</p>
          {entry.details ? (
            <p className="editorial-sidebar-education-details">{entry.details}</p>
          ) : null}
          <p className="editorial-sidebar-education-date">{entry.date_label}</p>
        </article>
      ))}
    </section>
  )
}

function renderSkillsSection(model: CvRenderModel) {
  if (!model.skills.length) {
    return null
  }

  const groups = buildSkillGroups(model.skills)

  return (
    <section className="editorial-sidebar-column-section" aria-label={sectionTitles.skills}>
      <h2 className="editorial-sidebar-section-title">{sectionTitles.skills}</h2>
      {groups.map((group) => (
        <div key={group.label} className="editorial-sidebar-skill-group">
          <h3 className="editorial-sidebar-skill-group-title">{`//${group.label.toUpperCase()}`}</h3>
          <ul className="editorial-sidebar-skill-list">
            {group.items.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function renderSummarySection(summary: string, isPlaceholder: boolean) {
  if (!summary) {
    return null
  }

  return (
    <section className="editorial-sidebar-column-section" aria-label="Summary">
      <h2 className="editorial-sidebar-section-title">Summary</h2>
      <p className={isPlaceholder ? "editorial-sidebar-summary-text editorial-sidebar-placeholder" : "editorial-sidebar-summary-text"}>
        {summary}
      </p>
    </section>
  )
}

function renderExperienceSection(model: CvRenderModel) {
  if (!model.experiences.length) {
    return null
  }

  return (
    <section className="editorial-sidebar-column-section" aria-label={sectionTitles.experiences}>
      <h2 className="editorial-sidebar-section-title">{sectionTitles.experiences}</h2>
      {model.experiences.map((experience) => (
        <article key={experience.id} className="editorial-sidebar-experience-item">
          <h3 className="editorial-sidebar-experience-role">{experience.role || "Professional title name here"}</h3>
          <p className="editorial-sidebar-experience-meta">
            {[experience.company, experience.location, experience.date_label].filter(Boolean).join(" - ") ||
              "Company name - City, State, Country - Year-Year"}
          </p>
          {experience.bullets.length ? (
            <ul className="editorial-sidebar-bullet-list">
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

function renderProjectsSection(model: CvRenderModel) {
  if (!model.projects.length) {
    return null
  }

  return (
    <section className="editorial-sidebar-column-section" aria-label={sectionTitles.projects}>
      <h2 className="editorial-sidebar-section-title">{sectionTitles.projects}</h2>
      {model.projects.map((project) => (
        <article key={project.id} className="editorial-sidebar-project-item">
          <h3 className="editorial-sidebar-project-name">{project.name || "Project name"}</h3>
          {project.tech_stack.length ? (
            <p className="editorial-sidebar-project-meta">{project.tech_stack.join(" • ")}</p>
          ) : null}
          {project.description ? (
            <p className="editorial-sidebar-project-description">{project.description}</p>
          ) : null}
          {project.bullets.length ? (
            <ul className="editorial-sidebar-bullet-list">
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

function renderLeftSection(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "education":
      return renderEducationSection(model)
    case "skills":
      return renderSkillsSection(model)
    default:
      return null
  }
}

function renderRightSection(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "experiences":
      return renderExperienceSection(model)
    case "projects":
      return renderProjectsSection(model)
    default:
      return null
  }
}

export function EditorialSidebarTemplate({ model, mode = "preview" }: CvTemplateComponentProps) {
  const nameLines = getNameLines(model, mode)
  const displayTitle = getDisplayTitle(model, mode)
  const displaySummary = getDisplaySummary(model, mode)
  const contactRows = buildContactRows(model)
  const leftSections = getLeftSections(model)
  const rightSections = getRightSections(model)
  const hasSidebar = leftSections.some((section) => renderLeftSection(section, model) !== null)
  const hasMain = Boolean(displaySummary) || rightSections.some((section) => renderRightSection(section, model) !== null)

  return (
    <div className="editorial-sidebar-root">
      <style>{editorialSidebarStyles}</style>
      <article className="editorial-sidebar-document" aria-label={`${model.meta.cv_name} preview`}>
        <div className="editorial-sidebar-page">
          <header className="editorial-sidebar-header">
            <div className="editorial-sidebar-name-block">
              {nameLines.primary ? <p className="editorial-sidebar-name-line">{nameLines.primary}</p> : null}
              <p className={nameLines.secondary ? "editorial-sidebar-name-line" : "editorial-sidebar-name-line editorial-sidebar-placeholder"}>
                {nameLines.secondary || "Name"}
              </p>
            </div>

            {contactRows.length ? (
              <div className="editorial-sidebar-contact-list" aria-label="Primary contact details">
                {contactRows.map((contact) => (
                  <div key={contact.id} className="editorial-sidebar-contact-row">
                    <ContactIcon kind={contact.kind} />
                    <p className="editorial-sidebar-contact-value">{contact.value}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {displayTitle ? (
              <p className={model.personal.title ? "editorial-sidebar-title" : "editorial-sidebar-title editorial-sidebar-placeholder"}>
                {displayTitle}
              </p>
            ) : null}
          </header>

          <div className={getBodyClassName(hasSidebar, hasMain)}>
            {hasSidebar ? (
              <aside className="editorial-sidebar-sidebar">
                {leftSections.map((section) => (
                  <Fragment key={section}>{renderLeftSection(section, model)}</Fragment>
                ))}
              </aside>
            ) : null}

            {hasMain ? (
              <div className="editorial-sidebar-main">
                {renderSummarySection(displaySummary, !model.personal.summary.trim())}
                {rightSections.map((section) => (
                  <Fragment key={section}>{renderRightSection(section, model)}</Fragment>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  )
}

function renderEducationSectionHtml(model: CvRenderModel) {
  if (!model.education.length) {
    return ""
  }

  return `
    <section class="editorial-sidebar-column-section" aria-label="${sectionTitles.education}">
      <h2 class="editorial-sidebar-section-title">${sectionTitles.education}</h2>
      ${model.education
        .map(
          (entry) => `
            <article class="editorial-sidebar-education-item">
              <h3 class="editorial-sidebar-education-degree">${escapeHtml(entry.degree || "Degree name")}</h3>
              <p class="editorial-sidebar-education-school">${escapeHtml(entry.institution || "University name")}</p>
              ${entry.details ? `<p class="editorial-sidebar-education-details">${escapeHtml(entry.details)}</p>` : ""}
              <p class="editorial-sidebar-education-date">${escapeHtml(entry.date_label)}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `
}

function renderSkillsSectionHtml(model: CvRenderModel) {
  if (!model.skills.length) {
    return ""
  }

  const groups = buildSkillGroups(model.skills)

  return `
    <section class="editorial-sidebar-column-section" aria-label="${sectionTitles.skills}">
      <h2 class="editorial-sidebar-section-title">${sectionTitles.skills}</h2>
      ${groups
        .map(
          (group) => `
            <div class="editorial-sidebar-skill-group">
              <h3 class="editorial-sidebar-skill-group-title">//${escapeHtml(group.label.toUpperCase())}</h3>
              <ul class="editorial-sidebar-skill-list">
                ${group.items.map((skill) => `<li>${escapeHtml(skill.name)}</li>`).join("")}
              </ul>
            </div>
          `
        )
        .join("")}
    </section>
  `
}

function renderSummarySectionHtml(summary: string, isPlaceholder: boolean) {
  if (!summary) {
    return ""
  }

  return `
    <section class="editorial-sidebar-column-section" aria-label="Summary">
      <h2 class="editorial-sidebar-section-title">Summary</h2>
      <p class="${isPlaceholder ? "editorial-sidebar-summary-text editorial-sidebar-placeholder" : "editorial-sidebar-summary-text"}">${escapeHtml(summary)}</p>
    </section>
  `
}

function renderExperienceSectionHtml(model: CvRenderModel) {
  if (!model.experiences.length) {
    return ""
  }

  return `
    <section class="editorial-sidebar-column-section" aria-label="${sectionTitles.experiences}">
      <h2 class="editorial-sidebar-section-title">${sectionTitles.experiences}</h2>
      ${model.experiences
        .map(
          (experience) => `
            <article class="editorial-sidebar-experience-item">
              <h3 class="editorial-sidebar-experience-role">${escapeHtml(experience.role || "Professional title name here")}</h3>
              <p class="editorial-sidebar-experience-meta">${escapeHtml(
                [experience.company, experience.location, experience.date_label].filter(Boolean).join(" - ") ||
                  "Company name - City, State, Country - Year-Year"
              )}</p>
              ${
                experience.bullets.length
                  ? `<ul class="editorial-sidebar-bullet-list">${experience.bullets
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

function renderProjectsSectionHtml(model: CvRenderModel) {
  if (!model.projects.length) {
    return ""
  }

  return `
    <section class="editorial-sidebar-column-section" aria-label="${sectionTitles.projects}">
      <h2 class="editorial-sidebar-section-title">${sectionTitles.projects}</h2>
      ${model.projects
        .map(
          (project) => `
            <article class="editorial-sidebar-project-item">
              <h3 class="editorial-sidebar-project-name">${escapeHtml(project.name || "Project name")}</h3>
              ${project.tech_stack.length ? `<p class="editorial-sidebar-project-meta">${escapeHtml(project.tech_stack.join(" • "))}</p>` : ""}
              ${project.description ? `<p class="editorial-sidebar-project-description">${escapeHtml(project.description)}</p>` : ""}
              ${
                project.bullets.length
                  ? `<ul class="editorial-sidebar-bullet-list">${project.bullets
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

function renderLeftSectionHtml(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "education":
      return renderEducationSectionHtml(model)
    case "skills":
      return renderSkillsSectionHtml(model)
    default:
      return ""
  }
}

function renderRightSectionHtml(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "experiences":
      return renderExperienceSectionHtml(model)
    case "projects":
      return renderProjectsSectionHtml(model)
    default:
      return ""
  }
}

export function buildEditorialSidebarHtml(model: CvRenderModel) {
  const nameLines = getNameLines(model, "print")
  const displayTitle = getDisplayTitle(model, "print")
  const displaySummary = getDisplaySummary(model, "print")
  const contactRows = buildContactRows(model)
  const leftSections = getLeftSections(model)
  const rightSections = getRightSections(model)
  const hasSidebar = leftSections.some((section) => renderLeftSectionHtml(section, model) !== "")
  const hasMain = Boolean(displaySummary) || rightSections.some((section) => renderRightSectionHtml(section, model) !== "")

  return buildHtmlDocument(
    model.meta.cv_name,
    `
      <div class="editorial-sidebar-root">
        <style>${editorialSidebarStyles}</style>
        <article class="editorial-sidebar-document" aria-label="${escapeHtml(model.meta.cv_name)} preview">
          <div class="editorial-sidebar-page">
            <header class="editorial-sidebar-header">
              <div class="editorial-sidebar-name-block">
                ${nameLines.primary ? `<p class="editorial-sidebar-name-line">${escapeHtml(nameLines.primary)}</p>` : ""}
                <p class="${nameLines.secondary ? "editorial-sidebar-name-line" : "editorial-sidebar-name-line editorial-sidebar-placeholder"}">${escapeHtml(nameLines.secondary || "Name")}</p>
              </div>
              ${
                contactRows.length
                  ? `<div class="editorial-sidebar-contact-list" aria-label="Primary contact details">${contactRows
                      .map(
                        (contact) => `
                          <div class="editorial-sidebar-contact-row">
                            <span class="editorial-sidebar-contact-icon" aria-hidden="true">${getContactIconSvg(contact.kind)}</span>
                            <p class="editorial-sidebar-contact-value">${escapeHtml(contact.value)}</p>
                          </div>
                        `
                      )
                      .join("")}</div>`
                  : ""
              }
              ${
                displayTitle
                  ? `<p class="${model.personal.title.trim() ? "editorial-sidebar-title" : "editorial-sidebar-title editorial-sidebar-placeholder"}">${escapeHtml(displayTitle)}</p>`
                  : ""
              }
            </header>
            <div class="${getBodyClassName(hasSidebar, hasMain)}">
              ${
                hasSidebar
                  ? `<aside class="editorial-sidebar-sidebar">${leftSections
                      .map((section) => renderLeftSectionHtml(section, model))
                      .join("")}</aside>`
                  : ""
              }
              ${
                hasMain
                  ? `<div class="editorial-sidebar-main">${renderSummarySectionHtml(
                      displaySummary,
                      !model.personal.summary.trim()
                    )}${rightSections.map((section) => renderRightSectionHtml(section, model)).join("")}</div>`
                  : ""
              }
            </div>
          </div>
        </article>
      </div>
    `
  )
}
