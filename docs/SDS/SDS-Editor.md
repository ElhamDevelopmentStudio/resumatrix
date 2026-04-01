# 📄 SDS — Editor Engine

## Project: _VitaForge_

----------

# 1. 🧠 Responsibility

The Editor Engine manages:

User Input → State → Derived CV Model → Live Preview

It ensures:

-   real-time synchronization
-   stable state separation
-   clean override behavior
-   no data corruption

----------

# 2. 🧩 Core Concept (CRITICAL)

The system operates on **3 distinct state layers**:

1. Base Data State (DB)  
2. CV Override State (per CV)  
3. Derived Render State (computed)

----------

## 2.1 Why This Matters

👉 This separation prevents:

-   accidental data mutation
-   profile logic corruption
-   template inconsistencies

----------

# 3. 🧱 State Layers

----------

## 3.1 Base Data State

Source:

-   DB (experiences, projects, etc.)

Characteristics:

-   persistent
-   shared across all CVs
-   canonical truth

----------

## 3.2 Override State (CV-specific)

Source:

-   `cvs.overrides`

Characteristics:

-   scoped to a single CV
-   stores only differences
-   optional

----------

## 3.3 Derived Render State

Generated from:

Base Data + Profile Filtering + Overrides

Characteristics:

-   read-only
-   used for preview rendering
-   recalculated frequently

----------

# 4. ⚙️ State Flow

----------

## 4.1 Core Flow

User edits form (left panel)  
 ↓  
Update override state OR base state  
 ↓  
Recompute derived CV model  
 ↓  
Trigger preview re-render (right panel)

----------

## 4.2 Deterministic Rule

At any moment:

Derived State = f(Base Data, Profile, Overrides)

----------

# 5. 🧠 Editing Modes (IMPORTANT DESIGN)

----------

## 5.1 Mode Types

The system supports two editing strategies:

----------

### Mode A — Direct Base Editing (MVP)

-   Editing modifies base data directly
-   Overrides used minimally

✔ simpler  
✔ faster to implement

----------

### Mode B — CV Override Editing (Advanced)

-   Editing modifies only overrides
-   Base data remains untouched

✔ safer  
✔ enables per-CV customization

----------

## 5.2 MVP Decision

👉 Start with **Mode A (direct base editing)**  
👉 Design system to support Mode B later

----------

# 6. 🧩 Form State Design

----------

## 6.1 Local Form State

Each editable section maintains local state:

formState  = {  
 experience: [...],  
 projects: [...],  
 education: [...],  
 skills: [...]  
}

----------

## 6.2 Controlled Inputs

-   all inputs are controlled
-   updates are immediate in memory
-   persistence is async

----------

## 6.3 Temporary Validity

Form must tolerate:

-   empty fields
-   partial edits
-   invalid intermediate states

----------

# 7. 🔄 Derived State Computation

----------

## 7.1 Trigger Conditions

Recompute derived state when:

-   form state changes
-   profile changes
-   override state changes

----------

## 7.2 Pipeline

Form/Base Data  
 ↓  
Normalize  
 ↓  
Profile Filter Engine  
 ↓  
Apply Overrides  
 ↓  
Generate Render Model

----------

## 7.3 Debouncing

-   apply 50–100ms debounce
-   avoid recompute on every keystroke

----------

# 8. ⚡ Real-Time Preview

----------

## 8.1 Behavior

-   preview updates automatically
-   no refresh button
-   no manual trigger

----------

## 8.2 Rendering Source

Preview MUST use:

Derived Render State → Template Engine

----------

## 8.3 Performance Rules

-   avoid full re-render of entire tree
-   memoize sections
-   diff-based updates preferred

----------

# 9. 🧠 Overrides Handling

----------

## 9.1 When Overrides Are Created

Overrides should be created when:

-   user edits content in CV context (future mode)
-   user hides/shows items
-   user reorders items

----------

## 9.2 Merge Strategy

Final Value =  
 override exists → use override  
 else → use base data

----------

## 9.3 Partial Overrides

Overrides may contain only specific fields:

{  
 "experience": {  
 "exp_1": {  
 "bullets": ["Modified"]  
 }  
 }  
}

----------

# 10. 🖥️ Split View Layout

----------

## 10.1 Structure

[ Left Panel | Divider | Right Panel ]

----------

## 10.2 Left Panel

-   form inputs
-   scrollable
-   editable data

----------

## 10.3 Right Panel

-   live CV preview
-   template-rendered

----------

## 10.4 Divider

-   draggable
-   adjusts width ratio
-   persisted per session (optional)

----------

# 11. 💾 Persistence Strategy

----------

## 11.1 Save Model

Two approaches:

----------

### Option A — Auto-save (Recommended)

-   save changes after debounce (500–1000ms)
-   silent persistence

----------

### Option B — Manual Save

-   explicit save button

----------

## 11.2 MVP Choice

👉 Auto-save with debounce

----------

## 11.3 Save Targets

-   base data tables
-   OR overrides (future)

----------

# 12. 🧠 Conflict Handling

----------

## 12.1 Concurrent Changes

Not required (single-user system)

----------

## 12.2 Save Failures

-   retry silently
-   show minimal error indicator

----------

# 13. ⚠️ Failure Modes

----------

## 13.1 Infinite Re-render Loop

Cause:

-   derived state updating base state

Rule:

-   derived state must be read-only

----------

## 13.2 Flickering Preview

Cause:

-   too frequent updates

Fix:

-   debounce
-   memoization

----------

## 13.3 Data Loss

Cause:

-   unsaved form state

Fix:

-   autosave + local buffer

----------

# 14. 🧪 Validation Rules

----------

## 14.1 Field Validation

-   minimal validation during typing
-   strict validation only on export (optional)

----------

## 14.2 Bullet Handling

-   remove empty bullet entries automatically
-   preserve order

----------

# 15. 🧠 Performance Design

----------

## 15.1 Optimization Points

-   memoize filtered results
-   avoid recomputing entire dataset
-   isolate section updates

----------

## 15.2 Rendering Strategy

-   component-level memoization
-   avoid re-rendering entire preview tree

----------

# 16. 🔒 Data Safety Rules

----------

## Rule 1

Derived state must never mutate base state

----------

## Rule 2

Overrides must not overwrite unrelated fields

----------

## Rule 3

Form state must not directly write to DB without validation layer

----------

# 17. 🔥 Design Guarantees

----------

### Guarantee 1

Preview always reflects latest edits

----------

### Guarantee 2

Data consistency between preview and export

----------

### Guarantee 3

No accidental data duplication

----------

### Guarantee 4

Stable editing experience even with partial data