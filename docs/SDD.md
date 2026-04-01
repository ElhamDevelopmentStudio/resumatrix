# 1. 🧭 System Design Overview

## 1.1 Architectural Style

The system follows a **modular monolith architecture**:

-   Single deployable unit
-   Clear internal boundaries between modules
-   Frontend + backend tightly integrated

----------

## 1.2 High-Level Components

[ UI Layer ]  
 ↓  
[ Application Layer ]  
 ↓  
[ Domain Layer ]  
 ↓  
[ Data Layer ]

----------

## 1.3 Core Modules

Module

Responsibility

Auth

Single-user access control

Data Manager

CRUD for career data

Profile Engine

Filtering + selection logic

Template Engine

Layout + rendering

CV Engine

Combines profile + template

Export Engine

Generates PDF

Editor Engine

Real-time sync (left ↔ right)

----------

# 2. 🧱 Data Design

----------

## 2.1 Core Philosophy

> Normalize everything. Never duplicate.

----------

## 2.2 Entities

### User

User:  
  id  
  username  
  password_hash

----------

### Profile

Profile:  
  id  
  name  
  include_tags[]  
  exclude_tags[]  
  ordering_config

----------

### Experience

Experience:  
  id  
  company  
  role  
  start_date  
  end_date  
  bullets[]  
  tags[]

----------

### Project

Project:  
  id  
  name  
  description  
  tech[]  
  bullets[]  
  tags[]

----------

### Education

Education:  
  id  
  institution  
  degree  
  start_date  
  end_date

----------

### Skill

Skill:  
  id  
  name  
  category

----------

### CV Instance

CV:  
  id  
  template_id  
  profile_id  
  created_at  
  overrides (optional JSON)

----------

## 2.3 Key Design Decision

Profiles DO NOT store data.

They store:

filters  +  ordering rules

----------

# 3. 🧠 Profile Engine Design

----------

## 3.1 Responsibility

Transforms:

Raw Data → Filtered Data Set

----------

## 3.2 Filtering Logic

### Input:

-   include_tags
-   exclude_tags

----------

### Output:

Filtered list of:

-   experiences
-   projects

----------

### Rule Priority

1.  Exclude > Include
2.  If no include_tags → include all
3.  Tag matching is OR-based

----------

## 3.3 Ordering

Profiles may define:

-   section ordering
-   item priority

Fallback:

-   chronological order

----------

# 4. 🎨 Template Engine Design

----------

## 4.1 Template Definition

Each template defines:

Template:  
  id  
  name  
  layout_config  
  section_order[]  
  style_rules

----------

## 4.2 Layout Config

Defines:

-   column structure
-   spacing
-   typography scale

----------

## 4.3 Rendering Contract

Template expects normalized input:

{  
  personal,  
  contacts,  
  experience[],  
  projects[],  
  education[],  
  skills[]  
}

----------

## 4.4 Template Isolation

Templates must:

-   not contain business logic
-   only render provided data

----------

# 5. ⚙️ CV Engine

----------

## 5.1 Responsibility

Core orchestrator:

Data + Profile + Template → Renderable CV Model

----------

## 5.2 Steps

1.  Fetch raw data
2.  Apply profile filters
3.  Normalize structure
4.  Pass to template

----------

## 5.3 Output

Renderable JSON model used by:

-   preview
-   export

----------

# 6. 🧩 Editor Engine (CRITICAL)

----------

## 6.1 Architecture

Dual-state system:

[ Form State ] → [ Derived CV State ] → [ Preview ]

----------

## 6.2 Left Panel (Form)

-   Controlled inputs
-   Updates local state

----------

## 6.3 Right Panel (Preview)

-   Subscribes to derived CV state
-   Renders via template

----------

## 6.4 Synchronization Strategy

### Approach:

-   reactive state (single source)

### Flow:

User Input → State Update → Recompute CV → Re-render Preview

----------

## 6.5 Performance Strategy

-   Debounce heavy computations (50–100ms)
-   Memoize filtered results
-   Avoid full re-renders

----------

## 6.6 Resizable Split Layout

-   Divider component
-   Stores width ratio
-   Persist per session (optional)

----------

# 7. 📄 Export Engine

----------

## 7.1 Strategy

Render → Export pipeline:

HTML Preview → Headless Render → PDF

----------

## 7.2 Requirements

-   Output must match preview
-   Pagination must be controlled

----------

## 7.3 Constraints

-   Avoid dynamic layout shifts
-   Fixed print styles required

----------

# 8. 🖥️ UI Design Structure

----------

## 8.1 Pages

### Dashboard

-   Profiles list
-   CV list
-   “New CV” button

----------

### CV Detail Page

Split layout:

Left

Right

Form

Preview

----------

### Data Management Pages

-   Experience editor
-   Project editor
-   Skills editor

----------

## 8.2 Navigation

-   Sidebar (minimal)
-   Focus on speed

----------

# 9. 🔐 Auth Design

----------

## 9.1 Model

-   Single-user system
-   Simple session-based auth

----------

## 9.2 Constraints

-   No signup flow
-   No roles

----------

# 10. ⚡ Performance Considerations

----------

## 10.1 Critical Paths

-   Preview rendering
-   Profile filtering
-   Export generation

----------

## 10.2 Optimization Strategy

-   Cache filtered data
-   Precompute CV model
-   Avoid unnecessary DB calls

----------

# 11. 🚫 Technical Constraints

----------

-   Must remain simple
-   Avoid microservices
-   Avoid overengineering
-   Prioritize responsiveness

----------

# 12. 🔮 Extensibility Points

----------

## 12.1 Template System

-   Add new templates without touching core logic

----------

## 12.2 Profile Logic

-   Extend filtering rules

----------

## 12.3 Export Formats

-   Add DOCX later

----------

# 13. ⚠️ Risk Areas

----------

## 13.1 Template Consistency

Mismatch between preview and PDF

----------

## 13.2 State Synchronization

Lag or flicker in editor

----------

## 13.3 Data Model Drift

If not normalized → chaos

----------

# 14. 🧠 Design Principles (Enforced)

----------

### 1. Data is the source of truth

### 2. Profiles are filters, not copies

### 3. Templates are pure renderers

### 4. Editor must feel instant

### 5. Preview must be trustworthy