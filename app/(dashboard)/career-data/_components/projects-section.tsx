"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isBlankProject } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
  fieldLabelClassName,
  textAreaClassName,
  textInputClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

export function ProjectsSection() {
  const projects = useCareerDataStore((state) => state.projects)
  const projectErrors = useCareerDataStore((state) => state.projectErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.projects)
  const addProject = useCareerDataStore((state) => state.addProject)
  const updateProjectField = useCareerDataStore((state) => state.updateProjectField)
  const removeProject = useCareerDataStore((state) => state.removeProject)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("projects")
  const activeCount = projects.filter((project) => !isBlankProject(project)).length
  const summary = activeCount ? `${activeCount} ${activeCount === 1 ? "entry" : "entries"}` : "No entries yet"

  return (
    <CareerSectionCard
      id="career-section-projects"
      step="04"
      title="Projects"
      description="Projects, shipped work, and case studies worth reusing."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("projects")}
    >
      <DynamicList
        items={projects}
        getKey={(project) => project.clientId}
        className="space-y-3"
        emptyState={
          <div className={emptyStateClassName}>
            Add projects that prove your strengths, especially the ones you may want on more than one resume.
          </div>
        }
        renderItem={(project) => {
          const nextErrors = projectErrors[project.clientId] ?? {}

          return (
            <ItemCard
              title={project.name || "New project"}
              subtitle={project.description || "Add the project name, stack, and outcomes."}
              onRemove={() => void removeProject(project.clientId)}
              removeLabel={`Remove ${project.name || "project"}`}
            >
              <div className="space-y-2">
                <FieldLabel className={fieldLabelClassName}>Project name</FieldLabel>
                <Input
                  type="text"
                  value={project.name}
                  onChange={(event) => updateProjectField(project.clientId, "name", event.target.value)}
                  aria-invalid={Boolean(nextErrors.name)}
                  placeholder="e.g. Resume Builder"
                  className={textInputClassName}
                />
                <FieldError>{nextErrors.name}</FieldError>
              </div>

              <div className="space-y-2">
                <FieldLabel className={fieldLabelClassName}>Description</FieldLabel>
                <Textarea
                  value={project.description}
                  onChange={(event) => updateProjectField(project.clientId, "description", event.target.value)}
                  placeholder="Explain what the project does and why it matters."
                  className={textAreaClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={fieldLabelClassName}>Tech stack</FieldLabel>
                <Input
                  type="text"
                  value={project.tech_stack_text}
                  onChange={(event) => updateProjectField(project.clientId, "tech_stack_text", event.target.value)}
                  placeholder="e.g. Next.js, TypeScript, Prisma"
                  className={textInputClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={fieldLabelClassName}>Highlights</FieldLabel>
                <Textarea
                  value={project.bullets_text}
                  onChange={(event) => updateProjectField(project.clientId, "bullets_text", event.target.value)}
                  placeholder={"Write one highlight per line.\nExample: Built a live preview editor for ATS-friendly resumes."}
                  className={textAreaClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={fieldLabelClassName}>Tags</FieldLabel>
                <Input
                  type="text"
                  value={project.tags_text}
                  onChange={(event) => updateProjectField(project.clientId, "tags_text", event.target.value)}
                  placeholder="e.g. frontend, ai, product-design"
                  className={textInputClassName}
                />
              </div>
            </ItemCard>
          )
        }}
      />

      <SectionAddButton label="Add project" onClick={addProject} />
    </CareerSectionCard>
  )
}
