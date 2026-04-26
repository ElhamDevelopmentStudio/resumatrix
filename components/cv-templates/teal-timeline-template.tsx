import { Fragment } from "react"

import type { CvOverrideSection, CvRenderModel } from "@/lib/cvs/types"
import { buildHtmlDocument, escapeHtml } from "@/lib/cvs/html"
import type { CvTemplateComponentProps } from "@/lib/templates/types"

type BulletColumn = string[]

export const tealTimelineStyles = `
.teal-timeline-root {
  width: 100%;
  background: #ffffff;
}

.teal-timeline-document {
  --teal-timeline-name-size: 22pt;
  --teal-timeline-role-size: 12.5pt;
  --teal-timeline-body-size: 10.5pt;
  --teal-timeline-meta-size: 10pt;
  --teal-timeline-section-size: 10.75pt;
  --teal-timeline-body-line-height: 1.42;
  box-sizing: border-box;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  color: #2f2f2f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: var(--teal-timeline-body-size);
  line-height: var(--teal-timeline-body-line-height);
}

.teal-timeline-page {
  padding: 14mm 13mm 15mm;
}

.teal-timeline-header {
  margin-bottom: 18pt;
}

.teal-timeline-name {
  margin: 0;
  font-size: var(--teal-timeline-name-size);
  line-height: 1.02;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: #4e9ca2;
}

.teal-timeline-role {
  margin: 5pt 0 0;
  font-size: var(--teal-timeline-role-size);
  line-height: 1.22;
  font-weight: 700;
  text-transform: uppercase;
  color: #333333;
}

.teal-timeline-contact-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6pt 9pt;
  margin-top: 9pt;
  padding-top: 7pt;
  border-top: 1px solid #d5d8d8;
}

.teal-timeline-contact-item,
.teal-timeline-contact-separator {
  font-size: var(--teal-timeline-meta-size);
  line-height: 1.35;
  color: #4f4f4f;
}

.teal-timeline-contact-separator {
  color: #4e9ca2;
}

.teal-timeline-section + .teal-timeline-section {
  margin-top: 16pt;
  padding-top: 12pt;
  border-top: 1px solid #d5d8d8;
}

.teal-timeline-section-title {
  margin: 0 0 8pt;
  font-size: var(--teal-timeline-section-size);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4e9ca2;
}

.teal-timeline-summary {
  margin: 0;
  max-width: 76ch;
  font-size: var(--teal-timeline-body-size);
  line-height: 1.46;
  color: #3c3c3c;
}

.teal-timeline-timeline {
  margin: 0;
  padding-left: 0;
  list-style: none;
  border-left: 1px solid #d9d9d9;
}

.teal-timeline-entry {
  position: relative;
  margin-left: 2px;
  padding: 0 0 0 15px;
}

.teal-timeline-entry + .teal-timeline-entry {
  margin-top: 12pt;
}

.teal-timeline-entry::before {
  content: "";
  position: absolute;
  top: 4px;
  left: -5px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #4e9ca2;
}

.teal-timeline-entry-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}

.teal-timeline-entry-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.teal-timeline-entry-title {
  margin: 0;
  font-size: var(--teal-timeline-body-size);
  line-height: 1.2;
  font-weight: 700;
  text-transform: uppercase;
  color: #333333;
}

.teal-timeline-entry-accent {
  margin: 0;
  font-size: var(--teal-timeline-body-size);
  line-height: 1.24;
  color: #4e9ca2;
}

.teal-timeline-entry-subtitle,
.teal-timeline-entry-side {
  margin: 3pt 0 0;
  font-size: var(--teal-timeline-meta-size);
  line-height: 1.34;
  color: #4e4e4e;
}

.teal-timeline-entry-side {
  text-align: right;
  font-style: italic;
  white-space: nowrap;
}

.teal-timeline-bullet-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 28px;
  margin-top: 6pt;
}

.teal-timeline-bullet-grid--one {
  grid-template-columns: minmax(0, 1fr);
}

.teal-timeline-bullet-column {
  margin: 0;
  padding: 0;
  list-style: none;
}

.teal-timeline-bullet-item {
  position: relative;
  padding-left: 12px;
  font-size: var(--teal-timeline-meta-size);
  line-height: 1.38;
  color: #444444;
}

.teal-timeline-bullet-item + .teal-timeline-bullet-item {
  margin-top: 3pt;
}

.teal-timeline-bullet-item::before {
  content: "■";
  position: absolute;
  top: 0;
  left: 0;
  font-size: 7px;
  line-height: 1.6;
  color: #4e9ca2;
}

.teal-timeline-education-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
}

.teal-timeline-education-main {
  min-width: 0;
}

.teal-timeline-education-side {
  text-align: right;
}

.teal-timeline-education-side .teal-timeline-entry-subtitle,
.teal-timeline-education-side .teal-timeline-entry-side {
  white-space: nowrap;
}

.teal-timeline-placeholder {
  color: #8c8c8c;
}

@media (max-width: 760px) {
  .teal-timeline-page {
    padding: 24px;
  }

  .teal-timeline-entry-header,
  .teal-timeline-education-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .teal-timeline-entry-side,
  .teal-timeline-education-side {
    text-align: left;
    white-space: normal;
  }

  .teal-timeline-bullet-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
}

@media print {
  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .teal-timeline-document {
    max-width: none;
    min-height: 0;
  }
}
`

const sectionTitles: Record<Exclude<CvOverrideSection, "contacts">, string> = {
  experiences: "Professional Experience",
  projects: "Projects",
  education: "Education",
  achievements: "Achievements",
  skills: "Skills",
}

function formatContactValue(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "")
}

function getDisplayName(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
  if (model.personal.full_name.trim()) {
    return model.personal.full_name
  }

  return mode === "preview" ? "Your Name" : ""
}

function getDisplayRole(model: CvRenderModel, mode: CvTemplateComponentProps["mode"]) {
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
    ? "Write a short summary that explains your experience, strengths, and the kind of work you do best."
    : ""
}

function buildBulletColumns(items: string[]): BulletColumn[] {
  if (items.length <= 1) {
    return items.length ? [items] : []
  }

  const midpoint = Math.ceil(items.length / 2)
  return [items.slice(0, midpoint), items.slice(midpoint)].filter((column) => column.length > 0)
}

function renderContactBar(model: CvRenderModel) {
  if (model.hidden_sections.includes("contacts") || !model.contacts.length) {
    return null
  }

  return (
    <div className="teal-timeline-contact-bar" aria-label="Primary contact details">
      {model.contacts.map((contact, index) => (
        <Fragment key={contact.id}>
          {index > 0 ? <span className="teal-timeline-contact-separator">▪</span> : null}
          <span className="teal-timeline-contact-item">{formatContactValue(contact.value)}</span>
        </Fragment>
      ))}
    </div>
  )
}

function renderBulletGrid(items: string[]) {
  const columns = buildBulletColumns(items)

  if (!columns.length) {
    return null
  }

  return (
    <div
      className={
        columns.length === 1
          ? "teal-timeline-bullet-grid teal-timeline-bullet-grid--one"
          : "teal-timeline-bullet-grid"
      }
    >
      {columns.map((column, columnIndex) => (
        <ul key={columnIndex} className="teal-timeline-bullet-column">
          {column.map((item, itemIndex) => (
            <li key={`${columnIndex}-${itemIndex}`} className="teal-timeline-bullet-item">
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

function renderExperienceSection(model: CvRenderModel) {
  if (!model.experiences.length) {
    return null
  }

  return (
    <section className="teal-timeline-section" aria-label={sectionTitles.experiences}>
      <h2 className="teal-timeline-section-title">{sectionTitles.experiences}</h2>
      <div className="teal-timeline-timeline">
        {model.experiences.map((experience) => (
          <article key={experience.id} className="teal-timeline-entry">
            <div className="teal-timeline-entry-header">
              <div>
                <div className="teal-timeline-entry-heading">
                  <h3 className="teal-timeline-entry-title">
                    {experience.role || "Professional title"}
                  </h3>
                  {experience.company ? (
                    <p className="teal-timeline-entry-accent">{experience.company}</p>
                  ) : null}
                </div>
                <p className="teal-timeline-entry-subtitle">
                  {experience.location || "Location"}
                </p>
              </div>
              <p className="teal-timeline-entry-side">{experience.date_label}</p>
            </div>
            {renderBulletGrid(experience.bullets)}
          </article>
        ))}
      </div>
    </section>
  )
}

function renderProjectsSection(model: CvRenderModel) {
  if (!model.projects.length) {
    return null
  }

  return (
    <section className="teal-timeline-section" aria-label={sectionTitles.projects}>
      <h2 className="teal-timeline-section-title">{sectionTitles.projects}</h2>
      <div className="teal-timeline-timeline">
        {model.projects.map((project) => (
          <article key={project.id} className="teal-timeline-entry">
            <div className="teal-timeline-entry-header">
              <div>
                <div className="teal-timeline-entry-heading">
                  <h3 className="teal-timeline-entry-title">{project.name || "Project"}</h3>
                  {project.tech_stack.length ? (
                    <p className="teal-timeline-entry-accent">{project.tech_stack.join(" • ")}</p>
                  ) : null}
                </div>
                {project.description ? (
                  <p className="teal-timeline-entry-subtitle">{project.description}</p>
                ) : null}
              </div>
            </div>
            {renderBulletGrid(project.bullets)}
          </article>
        ))}
      </div>
    </section>
  )
}

function renderEducationSection(model: CvRenderModel) {
  if (!model.education.length) {
    return null
  }

  return (
    <section className="teal-timeline-section" aria-label={sectionTitles.education}>
      <h2 className="teal-timeline-section-title">{sectionTitles.education}</h2>
      <div className="teal-timeline-timeline">
        {model.education.map((entry) => (
          <article key={entry.id} className="teal-timeline-entry">
            <div className="teal-timeline-education-row">
              <div className="teal-timeline-education-main">
                <h3 className="teal-timeline-entry-title">{entry.degree || "Degree"}</h3>
                <p className="teal-timeline-entry-accent">{entry.institution || "Institution"}</p>
                {entry.details ? (
                  <p className="teal-timeline-entry-subtitle">{entry.details}</p>
                ) : null}
              </div>
              <div className="teal-timeline-education-side">
                <p className="teal-timeline-entry-side">{entry.date_label}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function renderSkillsSection(model: CvRenderModel) {
  if (!model.skills.length) {
    return null
  }

  const skillItems = model.skills.map((skill) => {
    const detail = [skill.category, skill.level].filter(Boolean).join(", ")
    return detail ? `${skill.name} (${detail})` : skill.name
  })

  return (
    <section className="teal-timeline-section" aria-label={sectionTitles.skills}>
      <h2 className="teal-timeline-section-title">{sectionTitles.skills}</h2>
      {renderBulletGrid(skillItems)}
    </section>
  )
}

function renderAchievementsSection(model: CvRenderModel) {
  if (!model.achievements.length) {
    return null
  }

  return (
    <section className="teal-timeline-section" aria-label={sectionTitles.achievements}>
      <h2 className="teal-timeline-section-title">{sectionTitles.achievements}</h2>
      <div className="teal-timeline-timeline">
        {model.achievements.map((achievement) => (
          <article key={achievement.id} className="teal-timeline-entry">
            <div className="teal-timeline-entry-heading">
              <h3 className="teal-timeline-entry-title">{achievement.title || "Achievement"}</h3>
              {achievement.link_url ? (
                <p className="teal-timeline-entry-accent">
                  <a href={achievement.link_url}>{achievement.link_label || achievement.link_url}</a>
                </p>
              ) : null}
            </div>
            {achievement.description ? (
              <p className="teal-timeline-entry-subtitle">{achievement.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function renderSection(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "contacts":
      return null
    case "experiences":
      return renderExperienceSection(model)
    case "projects":
      return renderProjectsSection(model)
    case "education":
      return renderEducationSection(model)
    case "achievements":
      return renderAchievementsSection(model)
    case "skills":
      return renderSkillsSection(model)
    default:
      return null
  }
}

export function TealTimelineTemplate({ model, mode = "preview" }: CvTemplateComponentProps) {
  const displayName = getDisplayName(model, mode)
  const displayRole = getDisplayRole(model, mode)
  const displaySummary = getDisplaySummary(model, mode)

  return (
    <div className="teal-timeline-root">
      <style>{tealTimelineStyles}</style>
      <article className="teal-timeline-document" aria-label={`${model.meta.cv_name} preview`}>
        <div className="teal-timeline-page">
          <header className="teal-timeline-header">
            <h1 className={displayName ? "teal-timeline-name" : "teal-timeline-name teal-timeline-placeholder"}>
              {displayName || "Your Name"}
            </h1>
            {displayRole ? (
              <p className={model.personal.title.trim() ? "teal-timeline-role" : "teal-timeline-role teal-timeline-placeholder"}>
                {displayRole}
              </p>
            ) : null}
            {renderContactBar(model)}
          </header>

          {displaySummary ? (
            <section className="teal-timeline-section" aria-label="Summary">
              <h2 className="teal-timeline-section-title">Summary</h2>
              <p className={model.personal.summary.trim() ? "teal-timeline-summary" : "teal-timeline-summary teal-timeline-placeholder"}>
                {displaySummary}
              </p>
            </section>
          ) : null}

          {model.section_order.map((section) => (
            <Fragment key={section}>{renderSection(section, model)}</Fragment>
          ))}
        </div>
      </article>
    </div>
  )
}

function renderContactBarHtml(model: CvRenderModel) {
  if (model.hidden_sections.includes("contacts") || !model.contacts.length) {
    return ""
  }

  return `
    <div class="teal-timeline-contact-bar" aria-label="Primary contact details">
      ${model.contacts
        .map(
          (contact, index) => `
            ${index > 0 ? '<span class="teal-timeline-contact-separator">▪</span>' : ""}
            <span class="teal-timeline-contact-item">${escapeHtml(formatContactValue(contact.value))}</span>
          `
        )
        .join("")}
    </div>
  `
}

function renderBulletGridHtml(items: string[]) {
  const columns = buildBulletColumns(items)

  if (!columns.length) {
    return ""
  }

  return `
    <div class="${
      columns.length === 1
        ? "teal-timeline-bullet-grid teal-timeline-bullet-grid--one"
        : "teal-timeline-bullet-grid"
    }">
      ${columns
        .map(
          (column) => `
            <ul class="teal-timeline-bullet-column">
              ${column.map((item) => `<li class="teal-timeline-bullet-item">${escapeHtml(item)}</li>`).join("")}
            </ul>
          `
        )
        .join("")}
    </div>
  `
}

function renderExperienceSectionHtml(model: CvRenderModel) {
  if (!model.experiences.length) {
    return ""
  }

  return `
    <section class="teal-timeline-section" aria-label="${sectionTitles.experiences}">
      <h2 class="teal-timeline-section-title">${sectionTitles.experiences}</h2>
      <div class="teal-timeline-timeline">
        ${model.experiences
          .map(
            (experience) => `
              <article class="teal-timeline-entry">
                <div class="teal-timeline-entry-header">
                  <div>
                    <div class="teal-timeline-entry-heading">
                      <h3 class="teal-timeline-entry-title">${escapeHtml(experience.role || "Professional title")}</h3>
                      ${experience.company ? `<p class="teal-timeline-entry-accent">${escapeHtml(experience.company)}</p>` : ""}
                    </div>
                    <p class="teal-timeline-entry-subtitle">${escapeHtml(experience.location || "Location")}</p>
                  </div>
                  <p class="teal-timeline-entry-side">${escapeHtml(experience.date_label)}</p>
                </div>
                ${renderBulletGridHtml(experience.bullets)}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `
}

function renderProjectsSectionHtml(model: CvRenderModel) {
  if (!model.projects.length) {
    return ""
  }

  return `
    <section class="teal-timeline-section" aria-label="${sectionTitles.projects}">
      <h2 class="teal-timeline-section-title">${sectionTitles.projects}</h2>
      <div class="teal-timeline-timeline">
        ${model.projects
          .map(
            (project) => `
              <article class="teal-timeline-entry">
                <div class="teal-timeline-entry-header">
                  <div>
                    <div class="teal-timeline-entry-heading">
                      <h3 class="teal-timeline-entry-title">${escapeHtml(project.name || "Project")}</h3>
                      ${project.tech_stack.length ? `<p class="teal-timeline-entry-accent">${escapeHtml(project.tech_stack.join(" • "))}</p>` : ""}
                    </div>
                    ${project.description ? `<p class="teal-timeline-entry-subtitle">${escapeHtml(project.description)}</p>` : ""}
                  </div>
                </div>
                ${renderBulletGridHtml(project.bullets)}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `
}

function renderEducationSectionHtml(model: CvRenderModel) {
  if (!model.education.length) {
    return ""
  }

  return `
    <section class="teal-timeline-section" aria-label="${sectionTitles.education}">
      <h2 class="teal-timeline-section-title">${sectionTitles.education}</h2>
      <div class="teal-timeline-timeline">
        ${model.education
          .map(
            (entry) => `
              <article class="teal-timeline-entry">
                <div class="teal-timeline-education-row">
                  <div class="teal-timeline-education-main">
                    <h3 class="teal-timeline-entry-title">${escapeHtml(entry.degree || "Degree")}</h3>
                    <p class="teal-timeline-entry-accent">${escapeHtml(entry.institution || "Institution")}</p>
                    ${entry.details ? `<p class="teal-timeline-entry-subtitle">${escapeHtml(entry.details)}</p>` : ""}
                  </div>
                  <div class="teal-timeline-education-side">
                    <p class="teal-timeline-entry-side">${escapeHtml(entry.date_label)}</p>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `
}

function renderSkillsSectionHtml(model: CvRenderModel) {
  if (!model.skills.length) {
    return ""
  }

  const skillItems = model.skills.map((skill) => {
    const detail = [skill.category, skill.level].filter(Boolean).join(", ")
    return detail ? `${skill.name} (${detail})` : skill.name
  })

  return `
    <section class="teal-timeline-section" aria-label="${sectionTitles.skills}">
      <h2 class="teal-timeline-section-title">${sectionTitles.skills}</h2>
      ${renderBulletGridHtml(skillItems)}
    </section>
  `
}

function renderAchievementsSectionHtml(model: CvRenderModel) {
  if (!model.achievements.length) {
    return ""
  }

  return `
    <section class="teal-timeline-section" aria-label="${sectionTitles.achievements}">
      <h2 class="teal-timeline-section-title">${sectionTitles.achievements}</h2>
      <div class="teal-timeline-timeline">
        ${model.achievements
          .map((achievement) => {
            const linkLabel = achievement.link_label || achievement.link_url
            return `
              <article class="teal-timeline-entry">
                <div class="teal-timeline-entry-heading">
                  <h3 class="teal-timeline-entry-title">${escapeHtml(achievement.title || "Achievement")}</h3>
                  ${achievement.link_url ? `<p class="teal-timeline-entry-accent"><a href="${escapeHtml(achievement.link_url)}">${escapeHtml(linkLabel)}</a></p>` : ""}
                </div>
                ${achievement.description ? `<p class="teal-timeline-entry-subtitle">${escapeHtml(achievement.description)}</p>` : ""}
              </article>
            `
          })
          .join("")}
      </div>
    </section>
  `
}

function renderSectionHtml(section: CvOverrideSection, model: CvRenderModel) {
  switch (section) {
    case "contacts":
      return ""
    case "experiences":
      return renderExperienceSectionHtml(model)
    case "projects":
      return renderProjectsSectionHtml(model)
    case "education":
      return renderEducationSectionHtml(model)
    case "achievements":
      return renderAchievementsSectionHtml(model)
    case "skills":
      return renderSkillsSectionHtml(model)
    default:
      return ""
  }
}

export function buildTealTimelineHtml(model: CvRenderModel) {
  const displayName = getDisplayName(model, "print")
  const displayRole = getDisplayRole(model, "print")
  const displaySummary = getDisplaySummary(model, "print")

  return buildHtmlDocument(
    model.meta.cv_name,
    `
      <div class="teal-timeline-root">
        <style>${tealTimelineStyles}</style>
        <article class="teal-timeline-document" aria-label="${escapeHtml(model.meta.cv_name)} preview">
          <div class="teal-timeline-page">
            <header class="teal-timeline-header">
              <h1 class="${displayName ? "teal-timeline-name" : "teal-timeline-name teal-timeline-placeholder"}">${escapeHtml(displayName || "Your Name")}</h1>
              ${displayRole ? `<p class="${model.personal.title.trim() ? "teal-timeline-role" : "teal-timeline-role teal-timeline-placeholder"}">${escapeHtml(displayRole)}</p>` : ""}
              ${renderContactBarHtml(model)}
            </header>
            ${
              displaySummary
                ? `<section class="teal-timeline-section" aria-label="Summary"><h2 class="teal-timeline-section-title">Summary</h2><p class="${model.personal.summary.trim() ? "teal-timeline-summary" : "teal-timeline-summary teal-timeline-placeholder"}">${escapeHtml(displaySummary)}</p></section>`
                : ""
            }
            ${model.section_order.map((section) => renderSectionHtml(section, model)).join("")}
          </div>
        </article>
      </div>
    `
  )
}
