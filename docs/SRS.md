# 📄 Software Requirements Specification (SRS)

## Project: Personal CV Management & Generation System

----------

# 1. 🧭 System Overview

## 1.1 Purpose

The system is a **single-user web application** that enables centralized management of professional data (experience, projects, education, etc.) and transforms it into **multiple CV variants** using selectable templates and profiles.

The system separates:

-   **Data layer** → canonical career information
-   **Profile layer** → filtered views of data
-   **Template layer** → presentation formats

----------

## 1.2 Core Value Proposition

-   Eliminate repetitive CV rewriting
-   Enable fast generation of role-specific CVs
-   Provide real-time visual editing with live preview
-   Maintain a single source of truth for career data

----------

## 1.3 Target User

-   Single authenticated user (system owner)

----------

## 1.4 System Scope

The system includes:

-   Profile management
-   Career data management
-   Template-based CV generation
-   Real-time CV editing interface
-   Export functionality (PDF initially)

----------

# 2. 🧱 System Architecture (Conceptual)

The system consists of four logical layers:

### 2.1 Data Layer

Stores structured career information:

-   Experience
-   Projects
-   Education
-   Skills
-   Contacts

----------

### 2.2 Profile Layer

Defines **views over data** using:

-   inclusion rules (tags, filters)
-   ordering preferences

Profiles represent roles such as:

-   Software Engineer
-   Frontend Developer
-   Fullstack Developer

----------

### 2.3 Template Layer

Defines how data is rendered:

-   layout
-   section order
-   formatting rules

----------

### 2.4 Rendering Engine

Combines:

Profile + Template + Data → CV Output

----------

# 3. ⚙️ Functional Requirements

----------

## 3.1 Authentication

### 3.1.1 Requirements

-   System shall provide a simple login mechanism
-   Single user only
-   Username + password authentication
-   No registration or multi-user support required

----------

## 3.2 Data Management

### 3.2.1 Core Entities

The system shall support creation, editing, deletion of:

-   Personal Information
-   Contacts
-   Experience entries
-   Project entries
-   Education entries
-   Skills

----------

### 3.2.2 Data Characteristics

-   All entries must be fully editable
-   Entries must support:
    -   multiple bullet points
    -   optional tags
-   Data must be reusable across profiles

----------

### 3.2.3 Tagging System

The system shall allow tagging of entries:

-   Used for filtering per profile
-   Used for dynamic CV generation

----------

## 3.3 Profile Management

### 3.3.1 Profile Definition

A profile shall include:

-   Name (e.g., “Frontend Developer”)
-   Inclusion rules:
    -   include tags
    -   exclude tags
-   Optional ordering preferences

----------

### 3.3.2 Profile Behavior

-   Profiles shall not duplicate data
-   Profiles shall dynamically select data from the main dataset

----------

## 3.4 Template System

### 3.4.1 Template Definition

A template shall define:

-   layout structure
-   section ordering
-   styling rules

----------

### 3.4.2 Template Selection

Users shall be able to:

-   choose a template when creating a CV
-   preview template before selection

----------

## 3.5 CV Generation Flow

### 3.5.1 CV Creation

The system shall support:

1.  User clicks “New CV”
2.  User selects a template
3.  User selects a profile
4.  System generates a CV instance

----------

### 3.5.2 CV Instance

A CV instance represents:

-   a snapshot of:
    -   selected template
    -   selected profile
-   linked dynamically to underlying data

----------

## 3.6 CV Detail Page (Core Feature)

### 3.6.1 Layout

The CV detail page shall include:

**Split View Interface**

-   Left panel → Editable form
-   Right panel → Live preview

----------

### 3.6.2 Resizable Panels

-   A draggable vertical divider shall allow resizing
-   User can prioritize:
    -   editing (left)
    -   preview (right)

----------

### 3.6.3 Real-Time Synchronization

-   Changes in the left panel must reflect immediately in the right panel
-   No manual refresh required

----------

### 3.6.4 Editable Scope

User shall be able to modify:

-   content
-   ordering
-   inclusion/exclusion of items

----------

### 3.6.5 Editing Model

The system shall support:

-   temporary overrides per CV instance (optional future)
-   or direct editing of base data (MVP acceptable)

----------

## 3.7 Preview System

### 3.7.1 Live Rendering

-   The system shall render the CV preview in real-time
-   Preview must match export output as closely as possible

----------

## 3.8 Export System

### 3.8.1 Supported Formats (MVP)

-   PDF export required

----------

### 3.8.2 Export Behavior

-   Export shall reflect current preview state
-   Export must preserve layout and formatting

----------

### 3.8.3 Future Formats (Out of Scope for MVP)

-   DOCX
-   Other formats

----------

## 3.9 Dashboard

### 3.9.1 Main View

The dashboard shall display:

-   list of profiles
-   list of generated CVs

----------

### 3.9.2 Actions

User shall be able to:

-   create new CV
-   edit existing CV
-   delete CV

----------

# 4. 🧠 Non-Functional Requirements

----------

## 4.1 Performance

-   Real-time preview updates should feel instantaneous (<200ms perceived delay)
-   CV generation should not exceed 2 seconds

----------

## 4.2 Usability

-   Editing must be frictionless
-   UI must prioritize speed over visual complexity
-   Minimal clicks to generate CV

----------

## 4.3 Reliability

-   Data must persist reliably
-   No data loss on refresh or navigation

----------

## 4.4 Security

-   Basic authentication sufficient
-   Prevent unauthorized access
-   No need for enterprise-grade security

----------

## 4.5 Maintainability

-   Templates must be modular and extendable
-   Data model must support future expansion

----------

# 5. 🚫 Out of Scope (MVP)

-   Multi-user support
-   Public CV sharing links
-   AI rewriting features
-   Multi-language support
-   Country-specific formatting logic
-   Version history

----------

# 6. 🔮 Future Enhancements (Planned)

-   AI-assisted bullet rewriting
-   CV version snapshots
-   Job-description-based tailoring
-   DOCX export
-   Template marketplace
-   Public shareable CV links

----------

# 7. 🧩 Key Design Principles

----------

## 7.1 Single Source of Truth

All data originates from one centralized dataset

----------

## 7.2 Separation of Concerns

-   Data ≠ Profile ≠ Template

----------

## 7.3 Real-Time Feedback Loop

Editing and preview must feel instantaneous

----------

## 7.4 Minimal Friction

System should reduce effort, not add complexity

----------

# 8. ⚠️ Critical Success Factors

-   Clean data modeling
-   Smooth editing experience
-   Accurate preview-to-export consistency