# 📄 SDS — Template Engine

## Project: _VitaForge_

----------

# 1. 🧠 Responsibility

The Template Engine is responsible for turning a **fully prepared CV data model** into a **visual CV layout**.

It does **not**:

-   filter data
-   choose what data belongs
-   apply profile logic
-   fetch data from DB
-   make business decisions

It only:

-   receive normalized CV data
-   arrange it visually
-   render it consistently for preview and export

----------

# 2. 🧩 Inputs and Outputs

----------

## 2.1 Input

The Template Engine receives a **final render model**.

This model is already:

-   profile-filtered
-   override-applied
-   normalized
-   ready to display

----------

## 2.2 Input Contract

Each template must receive data in this shape:

{  
 "meta": {  
 "cv_id": "uuid",  
 "profile_name": "Frontend Developer",  
 "template_slug": "modern-tech"  
 },  
 "personal": {  
 "full_name": "Elhamullah Hossaini",  
 "title": "Frontend Developer",  
 "summary": "..."  
 },  
 "contacts": [  
 {  
 "type": "email",  
 "label": "Email",  
 "value": "example@email.com"  
 }  
 ],  
 "experience": [  
 {  
 "id": "exp_1",  
 "company": "Company Name",  
 "role": "Frontend Developer",  
 "location": "Kabul, Afghanistan",  
 "start_date": "2024-01-01",  
 "end_date": null,  
 "date_label": "Jan 2024 - Present",  
 "bullets": ["...", "..."]  
 }  
 ],  
 "projects": [  
 {  
 "id": "proj_1",  
 "name": "Project Name",  
 "description": "...",  
 "tech_stack": ["Next.js", "TypeScript"],  
 "bullets": ["...", "..."]  
 }  
 ],  
 "education": [  
 {  
 "id": "edu_1",  
 "institution": "Kardan University",  
 "degree": "Bachelor ...",  
 "start_date": "2021-01-01",  
 "end_date": "2025-01-01",  
 "date_label": "2021 - 2025",  
 "details": "..."  
 }  
 ],  
 "skills": [  
 {  
 "id": "skill_1",  
 "name": "React",  
 "category": "frontend",  
 "level": "advanced"  
 }  
 ]  
}

----------

## 2.3 Output

The template outputs a **renderable visual document** used in:

-   live preview
-   PDF export
-   future print-safe rendering
-   future DOCX mapping support

----------

# 3. ⚙️ Core Design Rule

## 3.1 Templates Are Pure Renderers

A template must behave like this:

RenderModel → Markup/UI

Not like this:

RawData → Business decisions → Filtering → UI

----------

## 3.2 Forbidden Template Responsibilities

Templates must not:

-   inspect tags
-   decide whether a project is “frontend enough”
-   re-order based on role logic
-   modify source data
-   write back to DB
-   compute profile-specific inclusion

That is all upstream.

----------

# 4. 🧱 Template Structure

Each template is defined by two things:

----------

## 4.1 Template Metadata

{  
 "id": "uuid",  
 "name": "Modern Tech",  
 "slug": "modern-tech",  
 "description": "Clean ATS-friendly layout for technical roles"  
}

----------

## 4.2 Template Configuration

{  
 "page": {  
 "size": "A4",  
 "margin": "standard"  
 },  
 "layout": {  
 "type": "single-column"  
 },  
 "sections": [  
  "personal",  
  "contacts",  
  "summary",  
  "experience",  
  "projects",  
  "education",  
  "skills"  
 ],  
 "rules": {  
 "show_section_if_empty": false,  
 "max_bullets_per_item": null  
 }  
}

----------

# 5. 🧠 Section Rendering Contract

Each section must render according to a stable contract.

----------

## 5.1 Personal Section

Must support:

-   full name
-   title
-   optional summary

Rules:

-   full name is always prominent
-   summary may be hidden if empty

----------

## 5.2 Contacts Section

Must support variable contact types:

-   email
-   phone
-   LinkedIn
-   GitHub
-   portfolio
-   location

Rules:

-   render only existing contacts
-   preserve order from input if provided
-   do not hardcode required contact types

----------

## 5.3 Experience Section

Each experience item must support:

-   company
-   role
-   location
-   date label
-   bullet list

Rules:

-   empty bullets must not render
-   bullet list must preserve order from input
-   template may visually truncate only if explicitly configured

----------

## 5.4 Projects Section

Each project item must support:

-   name
-   description
-   tech stack
-   bullet list

Rules:

-   tech stack may be inline or block
-   project description may be omitted if empty
-   bullets must remain ordered

----------

## 5.5 Education Section

Each education item must support:

-   institution
-   degree
-   date label
-   optional details

----------

## 5.6 Skills Section

Must support:

-   grouped rendering by category
-   flat rendering as fallback

Rule:

-   template may choose layout style, but not remove skills unless upstream already filtered them

----------

# 6. 🎨 Layout System

----------

## 6.1 Supported Layout Types

The engine should support, at minimum:

-   single-column
-   two-column
-   compact single-column

These are layout families, not business modes.

----------

## 6.2 Layout Responsibility

Templates define:

-   section placement
-   spacing
-   typography scale
-   grouping style
-   visual hierarchy

Templates do not define:

-   data inclusion logic
-   data transformation rules beyond display formatting

----------

# 7. 📐 Rendering Rules

----------

## 7.1 Deterministic Rendering

Given the same input model and template config, rendering output must be identical.

----------

## 7.2 Stable Section Ordering

Section order must come from:

-   template config
-   not from ad hoc component logic

----------

## 7.3 Empty Section Handling

Template config may define:

{  
 "rules": {  
 "show_section_if_empty": false  
 }  
}

Behavior:

-   if false, hide section when array is empty
-   if true, render empty placeholder container only in editor mode if needed

----------

## 7.4 Overflow Handling

Templates must define predictable behavior for long content.

Allowed strategies:

-   let content expand naturally
-   paginate during export
-   soft truncation only if clearly specified

Forbidden:

-   silent clipping
-   hidden overflow in export view

----------

# 8. 🔄 Preview and Export Consistency

This is critical.

----------

## 8.1 Single Render Source

Preview and PDF export must use the same template rendering logic.

Not:

-   one component for preview
-   another different one for export

Instead:

-   same render tree
-   export-specific print styles only

----------

## 8.2 Consistency Requirement

What the user sees in preview must match exported PDF as closely as possible in:

-   section order
-   spacing
-   typography hierarchy
-   visibility of items
-   bullet content

----------

# 9. 🧩 Template Registration Model

Each template should register through a stable contract.

Example conceptual structure:

TemplateDefinition  = {  
 slug: string  
  name: string  
  description: string  
  layoutType: "single-column"  |  "two-column"  |  "compact-single-column"  
  supportedSections: string[]  
  defaultConfig: object  
  renderer: function  
}

----------

# 10. 🧠 Editor Integration

Templates must support editor preview mode.

----------

## 10.1 Live Re-render

When form state changes:

-   render model updates
-   template re-renders immediately

----------

## 10.2 Editor Safety

Templates must tolerate:

-   partially filled fields
-   missing optional values
-   temporary incomplete states during typing

Example:

-   user deletes company name before typing a new one
-   template must not crash

----------

## 10.3 Placeholder Strategy

In editor mode only, optional placeholders may appear for:

-   empty summary
-   empty contact field
-   missing project description

These placeholders must never appear in export unless explicitly allowed

----------

# 11. ⚠️ Template Constraints

----------

## 11.1 No Side Effects

Template renderers must be side-effect free.

No:

-   DB writes
-   state mutation outside render
-   async fetches inside templates

----------

## 11.2 No Hidden Business Logic

Templates must not contain role logic like:

-   "if frontend profile, highlight React"
-   "if software engineer, show more projects"

That belongs in the Profile Engine or CV Engine.

----------

## 11.3 No Direct DB Dependence

Templates must never query the database directly.

They receive already assembled render data only.

----------

# 12. 🧪 Validation Requirements

Before a template is considered valid, it must be able to render:

-   full CV with all sections
-   CV missing projects
-   CV missing education details
-   CV with long bullet lists
-   CV with many skills
-   CV with empty optional summary

If it fails any of these, it is not production-safe.

----------

# 13. 🚧 Failure Modes

----------

## 13.1 Layout Breakage With Long Content

Cause:

-   fixed heights
-   rigid containers

Mitigation:

-   content-aware blocks
-   print-safe flow layout

----------

## 13.2 Preview/PDF Drift

Cause:

-   separate rendering logic
-   inconsistent styles

Mitigation:

-   single renderer
-   print stylesheet only

----------

## 13.3 Template Logic Drift

Cause:

-   developers adding filtering logic into templates

Mitigation:

-   hard architectural rule: templates are pure renderers only

----------

# 14. 🔥 Minimal Template Set for MVP

Do not overbuild.

Recommended MVP set:

### Template 1: ATS Standard

-   simple
-   single-column
-   print-safe
-   highly readable

### Template 2: Modern Tech

-   cleaner hierarchy
-   slightly more visual polish
-   still professional

### Template 3: Compact Variant

-   tighter spacing
-   optimized for fitting more content

That is enough for MVP.

----------

# 15. 🧠 Design Guarantees

This engine guarantees:

### Guarantee 1

Templates remain modular

### Guarantee 2

New templates can be added without changing filtering logic

### Guarantee 3

Preview and export stay aligned

### Guarantee 4

AI-generated templates remain constrained by a stable contract

----------

# 16. 📌 Final Rule Summary

Templates:

-   receive prepared data
-   render sections in configured order
-   support preview and export
-   remain pure and deterministic

Templates do not:

-   filter
-   fetch
-   decide business rules
-   mutate data