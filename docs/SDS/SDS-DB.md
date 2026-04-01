# 📄 SDS — Database Schema

## Project: _VitaForge_

----------

# 1. 🧠 Design Principles (ENFORCED)

Before tables, lock these rules:

### 1. Single Source of Truth

-   No duplicated career data across profiles or CVs

----------

### 2. Profiles = Filters

-   Profiles NEVER store actual content
-   Only rules

----------

### 3. CVs = Lightweight Instances

-   CVs do NOT copy all data
-   Only reference + optional overrides

----------

### 4. JSON Where It Helps, Not Everywhere

-   Use JSON for flexible fields (bullets, configs)
-   Use relational structure for core entities

----------

# 2. 🧱 Core Tables

----------

## 2.1 users

Single-user system, but still structured.

users  
------  
id (uuid, pk)  
username (text, unique)  
password_hash (text)  
created_at (timestamp)

----------

## 2.2 profiles

Defines filtering behavior.

profiles  
--------  
id (uuid, pk)  
name (text)  
  
include_tags (text[]) -- ["frontend", "react"]  
exclude_tags (text[]) -- ["backend-heavy"]  
  
config (jsonb) -- ordering, future rules  
  
created_at  
updated_at

----------

## 2.3 experiences

experiences  
-----------  
id (uuid, pk)  
  
company (text)  
role (text)  
  
start_date (date)  
end_date (date, nullable)  
  
location (text)  
  
bullets (jsonb) -- ["Did X", "Built Y"]  
  
tags (text[]) -- ["frontend", "react"]  
  
created_at  
updated_at

----------

## 2.4 projects

projects  
--------  
id (uuid, pk)  
  
name (text)  
description (text)  
  
tech_stack (text[]) -- ["Next.js", "Prisma"]  
  
bullets (jsonb)  
  
tags (text[])  
  
created_at  
updated_at

----------

## 2.5 education

education  
---------  
id (uuid, pk)  
  
institution (text)  
degree (text)  
  
start_date (date)  
end_date (date)  
  
details (text)  
  
created_at  
updated_at

----------

## 2.6 skills

skills  
------  
id (uuid, pk)  
  
name (text)  
category (text) -- "frontend", "backend", "tools"  
  
level (text) -- optional (e.g., "advanced")  
  
created_at

----------

## 2.7 personal_info

Single row (or enforced 1 record)

personal_info  
-------------  
id (uuid, pk)  
  
full_name (text)  
title (text)  
summary (text)  
  
created_at  
updated_at

----------

## 2.8 contacts

contacts  
--------  
id (uuid, pk)  
  
type (text) -- "email", "linkedin", "github"  
value (text)  
  
label (text) -- optional display label  
  
created_at

----------

# 3. 🧩 CV SYSTEM TABLES

----------

## 3.1 templates

templates  
---------  
id (uuid, pk)  
  
name (text)  
slug (text, unique)  
  
config (jsonb) -- layout rules, section order  
  
created_at

----------

## 3.2 cvs

This is your generated CV instance.

cvs  
---  
id (uuid, pk)  
  
profile_id (fk → profiles.id)  
template_id (fk → templates.id)  
  
name (text) -- optional label like "Frontend CV v2"  
  
overrides (jsonb) -- IMPORTANT (see below)  
  
created_at  
updated_at

----------

# 4. 🧠 CRITICAL: Overrides Design

This is where your system becomes powerful.

----------

## 4.1 Purpose

Allows per-CV customization without touching base data.

----------

## 4.2 Structure Example

{  
 "experience": {  
 "exp_id_1": {  
 "bullets": [  
  "Modified bullet for frontend role"  
 ]  
 }  
 },  
 "projects": {  
 "proj_id_2": {  
 "hidden": true  
 }  
 },  
 "skills": {  
 "reordered": ["React", "Next.js", "TypeScript"]  
 }  
}

----------

## 4.3 Rules

-   Overrides are optional
-   Overrides never mutate base tables
-   Overrides take highest priority in rendering

----------

# 5. 🔗 Relationships

----------

## Core Relationships

profiles → (no direct FK to data, uses tags)  
  
cvs → profiles  
cvs → templates

----------

## No Direct Linking Between:

-   profiles ↔ experiences
-   profiles ↔ projects

👉 This is intentional (filter-based system)

----------

# 6. 🧠 Derived Data Flow (IMPORTANT)

This is how your DB feeds the system:

DB Tables  
 ↓  
Raw Data Fetch  
 ↓  
Profile Filtering (tags)  
 ↓  
Apply Overrides (CV-specific)  
 ↓  
Template Rendering

----------

# 7. ⚠️ Constraints & Rules

----------

## 7.1 Tag Consistency

-   Tags must be consistent across:
    -   experiences
    -   projects

👉 Otherwise filtering breaks

----------

## 7.2 Bullet Structure

-   bullets must always be arrays
-   never store as plain text blobs

----------

## 7.3 Dates

-   end_date nullable = current role

----------

## 7.4 Single Personal Info Record

-   enforce via app logic (or DB constraint)

----------

# 8. 🚀 Indexing Strategy (IMPORTANT)

----------

CREATE INDEX idx_experiences_tags ON experiences USING GIN (tags);  
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);

👉 This makes profile filtering fast

----------

# 9. 🧠 Why This Schema Works

----------

## ✔ Flexible

-   JSON for bullets + overrides

----------

## ✔ Scalable

-   Can add new sections later

----------

## ✔ AI-friendly

-   Clear structure → easy code generation

----------

## ✔ Supports Your Core UX

-   real-time editing
-   profile-based filtering
-   template rendering