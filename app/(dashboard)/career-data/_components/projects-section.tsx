"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { isBlankProject } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { ProjectsItem } from "./projects-item"
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
        renderItem={(project) => (
          <ProjectsItem
            project={project}
            errors={projectErrors[project.clientId] ?? {}}
            updateProjectField={updateProjectField}
            removeProject={removeProject}
          />
        )}
      />

      <SectionAddButton label="Add project" onClick={addProject} />
    </CareerSectionCard>
  )
}