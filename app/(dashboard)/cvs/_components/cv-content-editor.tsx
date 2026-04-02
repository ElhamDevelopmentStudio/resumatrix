"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PersonalData } from "@/lib/career-data/types"
import type {
  CvContactContentOverride,
  CvEducationContentOverride,
  CvExperienceContentOverride,
  CvOverrideSection,
  CvProjectContentOverride,
  CvRenderModel,
  CvSkillContentOverride,
} from "@/lib/cvs/types"

const inputClassName =
  "h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"

const textareaClassName =
  "min-h-24 rounded-sm border-outline-variant/70 bg-background px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"

const cardClassName =
  "rounded-sm border border-outline-variant/60 bg-card p-4 shadow-none"

const sectionTitleMap: Record<Exclude<CvOverrideSection, never>, string> = {
  contacts: "Contacts",
  experiences: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
}

type CvContentEditorProps = {
  model: CvRenderModel | null
  onPersonalChange: (field: keyof PersonalData, value: string) => void
  onContactChange: (id: string, patch: CvContactContentOverride) => void
  onExperienceChange: (id: string, patch: CvExperienceContentOverride) => void
  onProjectChange: (id: string, patch: CvProjectContentOverride) => void
  onEducationChange: (id: string, patch: CvEducationContentOverride) => void
  onSkillChange: (id: string, patch: CvSkillContentOverride) => void
}

function listToEditorValue(value: string[]) {
  return value.join("\n")
}

function editorValueToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function SectionSummaryBadge({ count, hidden }: { count: number; hidden?: boolean }) {
  return (
    <Badge variant="outline" className="border-outline-variant/70 bg-background text-on-surface-variant/80">
      {hidden ? "Hidden" : `${count} item${count === 1 ? "" : "s"}`}
    </Badge>
  )
}

function HiddenSectionState({ label }: { label: string }) {
  return (
    <Card className={cardClassName}>
      <p className="text-sm text-on-surface-variant/75">
        {label} is hidden right now. Show it in <strong>Layout</strong> when you want these edits to appear in the preview.
      </p>
    </Card>
  )
}

function EmptySectionState({ label }: { label: string }) {
  return (
    <Card className={cardClassName}>
      <p className="text-sm text-on-surface-variant/75">
        No {label.toLowerCase()} are showing in this CV right now. Turn items on in <strong>Choose items</strong> if you want to edit them here.
      </p>
    </Card>
  )
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
      <p className="text-sm text-on-surface-variant/75">{description}</p>
    </div>
  )
}

export function CvContentEditor({
  model,
  onPersonalChange,
  onContactChange,
  onExperienceChange,
  onProjectChange,
  onEducationChange,
  onSkillChange,
}: CvContentEditorProps) {
  if (!model) {
    return (
      <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
        <EmptyHeader>
          <EmptyTitle>Content editor unavailable</EmptyTitle>
          <EmptyDescription>
            Choose a valid profile and template to start editing this CV.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const hiddenSectionSet = new Set(model.hidden_sections)

  return (
    <div className="space-y-4">
      <Card className="rounded-sm border border-outline-variant/60 bg-primary-soft/35 px-4 py-3 shadow-none">
        <p className="text-sm font-medium text-on-surface">Edit this version only</p>
        <p className="mt-1 text-sm text-on-surface-variant/80">
          Everything you change here stays on this CV. Your profile and career data stay untouched.
        </p>
      </Card>

      <Accordion defaultValue={["header"]} multiple className="rounded-sm border border-outline-variant/60 bg-card">
        <AccordionItem value="header" className="border-outline-variant/60 bg-transparent">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">Header</p>
              <p className="text-sm font-normal text-on-surface-variant/75">
                Name, professional title, and summary.
              </p>
            </div>
            <SectionSummaryBadge count={3} />
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel className="text-sm font-medium text-on-surface">Full name</FieldLabel>
                <Input
                  value={model.personal.full_name}
                  onChange={(event) => onPersonalChange("full_name", event.target.value)}
                  placeholder="Jane Doe"
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel className="text-sm font-medium text-on-surface">Professional title</FieldLabel>
                <Input
                  value={model.personal.title}
                  onChange={(event) => onPersonalChange("title", event.target.value)}
                  placeholder="Frontend Engineer"
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <FieldLabel className="text-sm font-medium text-on-surface">Summary</FieldLabel>
              <Textarea
                value={model.personal.summary}
                onChange={(event) => onPersonalChange("summary", event.target.value)}
                placeholder="A short introduction for this CV"
                className={textareaClassName}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contacts" className="border-outline-variant/60 bg-transparent">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">Contacts</p>
              <p className="text-sm font-normal text-on-surface-variant/75">
                Edit how your contact details appear on this CV.
              </p>
            </div>
            <SectionSummaryBadge count={model.contacts.length} hidden={hiddenSectionSet.has("contacts")} />
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4">
              {hiddenSectionSet.has("contacts") ? <HiddenSectionState label={sectionTitleMap.contacts} /> : null}
              {!hiddenSectionSet.has("contacts") && model.contacts.length === 0 ? (
                <EmptySectionState label={sectionTitleMap.contacts} />
              ) : null}
              {!hiddenSectionSet.has("contacts")
                ? model.contacts.map((contact) => (
                    <Card key={contact.id} className={cardClassName}>
                      <div className="space-y-4">
                        <SectionHeading
                          title={contact.type || "Contact"}
                          description={contact.value || "This contact line is currently empty."}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Label</FieldLabel>
                            <Input
                              value={contact.type}
                              onChange={(event) => onContactChange(contact.id, { type: event.target.value })}
                              placeholder="Email"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Value</FieldLabel>
                            <Input
                              value={contact.value}
                              onChange={(event) => onContactChange(contact.id, { value: event.target.value })}
                              placeholder="name@example.com"
                              className={inputClassName}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                : null}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience" className="border-outline-variant/60 bg-transparent">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">Experience</p>
              <p className="text-sm font-normal text-on-surface-variant/75">
                Tweak each role for this version of your CV.
              </p>
            </div>
            <SectionSummaryBadge count={model.experiences.length} hidden={hiddenSectionSet.has("experiences")} />
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4">
              {hiddenSectionSet.has("experiences") ? <HiddenSectionState label={sectionTitleMap.experiences} /> : null}
              {!hiddenSectionSet.has("experiences") && model.experiences.length === 0 ? (
                <EmptySectionState label={sectionTitleMap.experiences} />
              ) : null}
              {!hiddenSectionSet.has("experiences")
                ? model.experiences.map((experience) => (
                    <Card key={experience.id} className={cardClassName}>
                      <div className="space-y-4">
                        <SectionHeading
                          title={experience.role || "Untitled role"}
                          description={experience.company || "No company added yet."}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Role</FieldLabel>
                            <Input
                              value={experience.role}
                              onChange={(event) => onExperienceChange(experience.id, { role: event.target.value })}
                              placeholder="Senior Frontend Engineer"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Company</FieldLabel>
                            <Input
                              value={experience.company}
                              onChange={(event) => onExperienceChange(experience.id, { company: event.target.value })}
                              placeholder="Acme"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Location</FieldLabel>
                            <Input
                              value={experience.location}
                              onChange={(event) => onExperienceChange(experience.id, { location: event.target.value })}
                              placeholder="Remote"
                              className={inputClassName}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <FieldLabel className="text-sm font-medium text-on-surface">Start</FieldLabel>
                              <Input
                                value={experience.start_date}
                                onChange={(event) => onExperienceChange(experience.id, { start_date: event.target.value })}
                                placeholder="2024-01"
                                className={inputClassName}
                              />
                            </div>
                            <div className="space-y-2">
                              <FieldLabel className="text-sm font-medium text-on-surface">End</FieldLabel>
                              <Input
                                value={experience.end_date ?? ""}
                                onChange={(event) => onExperienceChange(experience.id, { end_date: event.target.value })}
                                placeholder="Leave blank for Present"
                                className={inputClassName}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <FieldLabel className="text-sm font-medium text-on-surface">Bullet points</FieldLabel>
                          <FieldDescription>Use one line per bullet.</FieldDescription>
                          <Textarea
                            value={listToEditorValue(experience.bullets)}
                            onChange={(event) =>
                              onExperienceChange(experience.id, {
                                bullets: editorValueToList(event.target.value),
                              })
                            }
                            placeholder="Built reusable UI systems"
                            className={textareaClassName}
                          />
                        </div>
                      </div>
                    </Card>
                  ))
                : null}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="projects" className="border-outline-variant/60 bg-transparent">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">Projects</p>
              <p className="text-sm font-normal text-on-surface-variant/75">
                Adjust project wording, stack, and bullet points.
              </p>
            </div>
            <SectionSummaryBadge count={model.projects.length} hidden={hiddenSectionSet.has("projects")} />
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4">
              {hiddenSectionSet.has("projects") ? <HiddenSectionState label={sectionTitleMap.projects} /> : null}
              {!hiddenSectionSet.has("projects") && model.projects.length === 0 ? (
                <EmptySectionState label={sectionTitleMap.projects} />
              ) : null}
              {!hiddenSectionSet.has("projects")
                ? model.projects.map((project) => (
                    <Card key={project.id} className={cardClassName}>
                      <div className="space-y-4">
                        <SectionHeading
                          title={project.name || "Untitled project"}
                          description={project.description || "No project description yet."}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Project name</FieldLabel>
                            <Input
                              value={project.name}
                              onChange={(event) => onProjectChange(project.id, { name: event.target.value })}
                              placeholder="Resume Builder"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Description</FieldLabel>
                            <Textarea
                              value={project.description}
                              onChange={(event) => onProjectChange(project.id, { description: event.target.value })}
                              placeholder="A short description for this project"
                              className={textareaClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Tech stack</FieldLabel>
                            <FieldDescription>Use one line per technology.</FieldDescription>
                            <Textarea
                              value={listToEditorValue(project.tech_stack)}
                              onChange={(event) =>
                                onProjectChange(project.id, {
                                  tech_stack: editorValueToList(event.target.value),
                                })
                              }
                              placeholder="Next.js"
                              className={textareaClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Bullet points</FieldLabel>
                            <FieldDescription>Use one line per bullet.</FieldDescription>
                            <Textarea
                              value={listToEditorValue(project.bullets)}
                              onChange={(event) =>
                                onProjectChange(project.id, {
                                  bullets: editorValueToList(event.target.value),
                                })
                              }
                              placeholder="Improved form completion by 24%"
                              className={textareaClassName}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                : null}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education" className="border-outline-variant/60 bg-transparent">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">Education</p>
              <p className="text-sm font-normal text-on-surface-variant/75">
                Fine-tune school details for this CV.
              </p>
            </div>
            <SectionSummaryBadge count={model.education.length} hidden={hiddenSectionSet.has("education")} />
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4">
              {hiddenSectionSet.has("education") ? <HiddenSectionState label={sectionTitleMap.education} /> : null}
              {!hiddenSectionSet.has("education") && model.education.length === 0 ? (
                <EmptySectionState label={sectionTitleMap.education} />
              ) : null}
              {!hiddenSectionSet.has("education")
                ? model.education.map((entry) => (
                    <Card key={entry.id} className={cardClassName}>
                      <div className="space-y-4">
                        <SectionHeading
                          title={entry.degree || "Untitled degree"}
                          description={entry.institution || "No institution added yet."}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Degree</FieldLabel>
                            <Input
                              value={entry.degree}
                              onChange={(event) => onEducationChange(entry.id, { degree: event.target.value })}
                              placeholder="BSc Computer Science"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Institution</FieldLabel>
                            <Input
                              value={entry.institution}
                              onChange={(event) => onEducationChange(entry.id, { institution: event.target.value })}
                              placeholder="State University"
                              className={inputClassName}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 md:col-span-2">
                            <div className="space-y-2">
                              <FieldLabel className="text-sm font-medium text-on-surface">Start</FieldLabel>
                              <Input
                                value={entry.start_date}
                                onChange={(event) => onEducationChange(entry.id, { start_date: event.target.value })}
                                placeholder="2019-09"
                                className={inputClassName}
                              />
                            </div>
                            <div className="space-y-2">
                              <FieldLabel className="text-sm font-medium text-on-surface">End</FieldLabel>
                              <Input
                                value={entry.end_date ?? ""}
                                onChange={(event) => onEducationChange(entry.id, { end_date: event.target.value })}
                                placeholder="Leave blank for Present"
                                className={inputClassName}
                              />
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Details</FieldLabel>
                            <Textarea
                              value={entry.details}
                              onChange={(event) => onEducationChange(entry.id, { details: event.target.value })}
                              placeholder="Honors, awards, or relevant notes"
                              className={textareaClassName}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                : null}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills" className="border-outline-variant/60 bg-transparent">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-on-surface hover:no-underline">
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">Skills</p>
              <p className="text-sm font-normal text-on-surface-variant/75">
                Rename or regroup skills for this CV.
              </p>
            </div>
            <SectionSummaryBadge count={model.skills.length} hidden={hiddenSectionSet.has("skills")} />
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4">
              {hiddenSectionSet.has("skills") ? <HiddenSectionState label={sectionTitleMap.skills} /> : null}
              {!hiddenSectionSet.has("skills") && model.skills.length === 0 ? (
                <EmptySectionState label={sectionTitleMap.skills} />
              ) : null}
              {!hiddenSectionSet.has("skills")
                ? model.skills.map((skill) => (
                    <Card key={skill.id} className={cardClassName}>
                      <div className="space-y-4">
                        <SectionHeading
                          title={skill.name || "Untitled skill"}
                          description={[skill.category, skill.level].filter(Boolean).join(" • ") || "No category or level yet."}
                        />
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2 md:col-span-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Skill name</FieldLabel>
                            <Input
                              value={skill.name}
                              onChange={(event) => onSkillChange(skill.id, { name: event.target.value })}
                              placeholder="React"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <FieldLabel className="text-sm font-medium text-on-surface">Category</FieldLabel>
                            <Input
                              value={skill.category}
                              onChange={(event) => onSkillChange(skill.id, { category: event.target.value })}
                              placeholder="Frontend"
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-3">
                            <FieldLabel className="text-sm font-medium text-on-surface">Level</FieldLabel>
                            <Input
                              value={skill.level}
                              onChange={(event) => onSkillChange(skill.id, { level: event.target.value })}
                              placeholder="Advanced"
                              className={inputClassName}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
