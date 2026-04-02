"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isBlankProject } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

const labelClassName =
  "text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase"
const inputClassName =
  "h-12 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"
const textareaClassName =
  "min-h-28 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 py-3 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"

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
  const summary = activeCount ? `${activeCount} project${activeCount === 1 ? "" : "s"}` : "Add work that proves your strengths"

  return (
    <CareerSectionCard
      id="career-section-projects"
      step="Step 04"
      title="Projects"
      description="Keep side projects, shipped work, and case-study-ready details in one place."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("projects")}
    >
      <DynamicList
        items={projects}
        getKey={(project) => project.clientId}
        className="space-y-4"
        emptyState={
          <p className="text-sm font-medium text-on-surface-variant/70">
            No projects yet. Add the projects you want to reuse across roles and resume versions.
          </p>
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
                <FieldLabel className={labelClassName}>Project name</FieldLabel>
                <Input
                  type="text"
                  value={project.name}
                  onChange={(event) => updateProjectField(project.clientId, "name", event.target.value)}
                  aria-invalid={Boolean(nextErrors.name)}
                  placeholder="e.g. Resume Builder"
                  className={inputClassName}
                />
                <FieldError>{nextErrors.name}</FieldError>
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Description</FieldLabel>
                <Textarea
                  value={project.description}
                  onChange={(event) => updateProjectField(project.clientId, "description", event.target.value)}
                  placeholder="Explain what the project does and why it matters."
                  className={textareaClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Tech stack</FieldLabel>
                <Input
                  type="text"
                  value={project.tech_stack_text}
                  onChange={(event) => updateProjectField(project.clientId, "tech_stack_text", event.target.value)}
                  placeholder="e.g. Next.js, TypeScript, Prisma"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Highlights</FieldLabel>
                <Textarea
                  value={project.bullets_text}
                  onChange={(event) => updateProjectField(project.clientId, "bullets_text", event.target.value)}
                  placeholder={"Write one highlight per line.\nExample: Built a live preview editor for ATS-friendly resumes."}
                  className={textareaClassName}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel className={labelClassName}>Tags</FieldLabel>
                <Input
                  type="text"
                  value={project.tags_text}
                  onChange={(event) => updateProjectField(project.clientId, "tags_text", event.target.value)}
                  placeholder="e.g. frontend, ai, product-design"
                  className={inputClassName}
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
