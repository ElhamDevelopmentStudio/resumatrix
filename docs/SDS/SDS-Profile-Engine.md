# 📄 SDS — Profile Engine

## Project: _VitaForge_

----------

# 1. 🧠 Responsibility

The Profile Engine transforms:

Raw Career Data → Profile-Specific Data Set

It determines:

-   what appears in the CV
-   what gets removed
-   what gets prioritized

----------

# 2. 🧩 Inputs & Outputs

----------

## 2.1 Inputs

### From DB:

-   experiences[]
-   projects[]
-   education[]
-   skills[]
-   personal_info
-   contacts

----------

### From Profile:

{  
 "include_tags": ["frontend", "react"],  
 "exclude_tags": ["backend-heavy"],  
 "config": {  
 "ordering": {},  
 "limits": {}  
 }  
}

----------

## 2.2 Output

Normalized dataset:

{  
 "experience": [],  
 "projects": [],  
 "education": [],  
 "skills": [],  
 "personal": {},  
 "contacts": []  
}

👉 This is passed to the Template Engine

----------

# 3. ⚙️ Filtering Algorithm (STRICT)

----------

## 3.1 Tag Matching Rules

Each item (experience/project) has:

{  
 "tags": ["frontend", "react"]  
}

----------

## 3.2 Evaluation Logic

For EACH item:

### Step 1 — Exclusion Check (HIGHEST PRIORITY)

IF item.tags intersects with exclude_tags  
→ EXCLUDE item

----------

### Step 2 — Inclusion Check

IF include_tags is empty  
→ INCLUDE item  
  
ELSE IF item.tags intersects include_tags  
→ INCLUDE item  
  
ELSE  
→ EXCLUDE item

----------

## 3.3 Final Rule Priority

EXCLUDE > INCLUDE

----------

# 4. 🧠 Edge Cases (MANDATORY HANDLING)

----------

## 4.1 Item Without Tags

IF item.tags is empty:  
 IF include_tags is empty → INCLUDE  
 ELSE → EXCLUDE

----------

## 4.2 Conflicting Tags

Example:

item.tags = ["frontend", "backend-heavy"]

include_tags = ["frontend"]  
exclude_tags = ["backend-heavy"]

👉 Result:

EXCLUDE (because exclude wins)

----------

## 4.3 No Matching Data

If filtering results in empty section:

-   Section should be:
    -   hidden OR
    -   rendered empty (based on template)

----------

# 5. 🧮 Ordering Logic

----------

## 5.1 Default Ordering

If no config:

-   experiences → descending by start_date
-   projects → most recent first
-   education → descending by end_date

----------

## 5.2 Profile-Based Ordering

Profiles may define:

{  
 "config": {  
 "ordering": {  
 "experience": "priority",  
 "projects": "recent"  
 }  
 }  
}

----------

## 5.3 Priority Ordering (OPTIONAL FUTURE)

Each item may have:

{  
 "priority": 1  
}

Lower number = higher priority

----------

# 6. ✂️ Limits & Trimming

----------

## 6.1 Profile Limits

{  
 "config": {  
 "limits": {  
 "experience": 3,  
 "projects": 4  
 }  
 }  
}

----------

## 6.2 Behavior

After filtering:

Apply ordering → Apply limits

----------

# 7. 🔄 Transformation Layer

----------

## 7.1 Normalize Data Shape

Before passing to templates:

Ensure consistent structure:

{  
 "experience": [  
 {  
 "company": "",  
 "role": "",  
 "bullets": []  
 }  
 ]  
}

----------

## 7.2 Derived Fields

Compute:

-   duration (optional)
-   formatted dates
-   display labels

----------

# 8. 🧠 CV Overrides Integration (CRITICAL)

----------

## 8.1 Flow

Filtered Data  
 ↓  
Apply CV Overrides  
 ↓  
Final Data

----------

## 8.2 Override Rules

For each item:

### Example:

{  
 "experience": {  
 "exp_id_1": {  
 "bullets": ["Modified bullet"]  
 }  
 }  
}

----------

### Behavior:

-   Replace only specified fields
-   Do NOT remove unspecified fields

----------

## 8.3 Hidden Items

{  
 "projects": {  
 "proj_id_2": {  
 "hidden": true  
 }  
 }  
}

👉 Remove from final dataset

----------

# 9. ⚡ Performance Design

----------

## 9.1 Memoization

-   Cache filtered results per profile
-   Recompute only when:
    -   data changes
    -   profile changes

----------

## 9.2 Complexity

-   Filtering should be O(n)
-   Avoid nested loops

----------

## 9.3 Debouncing (Editor Context)

-   Apply 50–100ms debounce for live edits

----------

# 10. 🧪 Validation Rules

----------

## 10.1 Required Fields

-   experience must have:
    -   company
    -   role

----------

## 10.2 Bullet Integrity

-   bullets must be arrays
-   empty bullets should be filtered out

----------

# 11. ⚠️ Failure Modes

----------

## 11.1 Over-filtering

Too many excludes → empty CV

👉 Solution:

-   fallback warning in UI (future)

----------

## 11.2 Tag Inconsistency

Different naming:

-   "frontend"
-   "front-end"

👉 Solution:

-   normalize tags (lowercase, trimmed)

----------

# 12. 🧠 Design Guarantees

----------

## Guarantee 1

Same profile + same data → same output

----------

## Guarantee 2

Overrides always take priority

----------

## Guarantee 3

Templates never affect filtering

----------

# 13. 🔥 Why This Matters

This engine gives you:

-   role-specific CVs instantly
-   zero duplication
-   full control over visibility