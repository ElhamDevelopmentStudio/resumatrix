# Minimax CV AI Integration — Design Spec

## Overview

Integrate Minimax 2.7 as the AI engine to assist users in building region-standard-compliant CVs. AI helps in three main areas: field-level content rewriting in Career Data, layout suggestions in the CV Editor, and profile generation from natural language prompts.

---

## 1. Region Instruction Layer

**Location:** `lib/region-instructions/`

```
lib/region-instructions/
├── us.ts
├── canada.ts
├── uk.ts
├── eu.ts              ← generic EU
├── germany.ts
├── france.ts
├── afghanistan.ts
├── russia.ts
├── australia.ts
├── international.ts   ← fallback
└── index.ts
```

### RegionStandard Interface

```typescript
interface RegionStandard {
  id: string;
  name: string;
  section_order: SectionOrder;
  required_sections: SectionRequirement[];
  formatting: FormattingRules;
  bullet_style: BulletStyle;
  content_emphasis: ContentEmphasis;
  length_expectations: LengthRules;
}
```

### Starting Regions (10)

| ID | Name | Notes |
|---|---|---|
| `us` | United States | US conventions |
| `canada` | Canada | Bilingual-friendly, similar to US |
| `uk` | United Kingdom | UK/EU conventions |
| `eu` | European Union | Generic EU standard |
| `germany` | Germany |严肃, includes photo/date conventions |
| `france` | France | French CV conventions |
| `afghanistan` | Afghanistan | Local standards |
| `russia` | Russia | Russian CV conventions |
| `australia` | Australia | Australian market |
| `international` | International | Fallback/generic |

### AI System Prompt Assembly

Each region file exports a `toSystemPrompt(): string` method that generates a coherent system prompt. For example, US produces:

```
- Format: US English, single-page preferred for early career, two pages acceptable for senior roles
- Section order: Contact → Summary → Experience → Education → Skills → Projects
- Required: Name, email, phone, LinkedIn (optional but recommended)
- Omit: Photo, date of birth, nationality, marital status
- Summary: 3-4 sentence punchy summary at top, no objectives
- Bullets: Start with action verbs (led, built, scaled, reduced), quantify with numbers where possible
- Skills: Grouped by category, relevant technical skills first
```

The `index.ts` exports `getRegionStandard(id): RegionStandard` with fallback to `international`.

---

## 2. AI Prompt Assembly Layer

**Location:** `lib/ai/`

```
lib/ai/
├── prompts/
│   ├── index.ts
│   ├── rewrite-field.ts
│   ├── suggest-layout.ts
│   └── generate-profile.ts
├── minimax.ts
└── types.ts
```

### Shared Prompt Builder (`prompts/index.ts`)

Assembles the full system prompt combining:
1. Base instruction: "You are a professional CV writer..."
2. Region standard system prompt (from region instructions)
3. Career data context

### Field Rewrite Prompt (`prompts/rewrite-field.ts`)

Builds a user prompt given:
- field type (bullet, summary, description, etc.)
- original field content
- full career data context (all sections)
- region standard

**Output format (JSON):**
```typescript
interface RewriteSuggestion {
  original: string;
  suggested: string;
  reasoning: string;
}
```

### Layout Suggestion Prompt (`prompts/suggest-layout.ts`)

Given CV section data + region standard, produces:
```typescript
interface LayoutSuggestion {
  section_order: string[];
  reasoning_per_section: Record<string, string>;
}
```

### Profile Generation Prompt (`prompts/generate-profile.ts`)

Given user prompt + career data + region, produces:
```typescript
interface ProfileSuggestion {
  name: string;
  include_tags: string[];
  exclude_tags: string[];
  ordering: { experiences: string; projects: string; education: string };
  limits: { experiences: number; projects: number; education: number };
}
```

### Minimax Client (`minimax.ts`)

Wraps Minimax API calls. Uses `minimax-ai` SDK (or direct REST). Configurable via environment variable `MINIMAX_API_KEY`.

### Response Types (`types.ts`)

```typescript
type AIResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

---

## 3. Convex AI Layer

**Location:** `convex/ai/`

```
convex/ai/
├── rewrite_field.ts
├── suggest_layout.ts
├── generate_profile.ts
└── minimax.ts
```

### `ai.rewrite_field`

**Type:** Mutation
**Args:** `{ fieldType, sectionType, entryId, fieldValue, careerDataId? }`
**Behavior:**
1. Fetch full career data workspace server-side
2. Get region standard (from CV if `careerDataId` provided, else generic)
3. Assemble prompt via `lib/ai/prompts/rewrite-field.ts`
4. Call Minimax, return `RewriteSuggestion`
5. Enforce rate limit (10 calls/minute/user)

### `ai.suggest_layout`

**Type:** Mutation
**Args:** `{ cvId }`
**Behavior:**
1. Fetch CV + linked career data server-side
2. Get region standard from CV settings
3. Assemble prompt via `lib/ai/prompts/suggest-layout.ts`
4. Call Minimax, return `LayoutSuggestion`

### `ai.generate_profile`

**Type:** Mutation
**Args:** `{ userPrompt, careerDataId, regionId }`
**Behavior:**
1. Fetch career data server-side
2. Get region standard
3. Assemble prompt via `lib/ai/prompts/generate-profile.ts`
4. Call Minimax, return `ProfileSuggestion`

### Rate Limiting

A `rate_limits` Convex table tracks calls per user. Each AI function checks and increments the counter. If limit exceeded, returns `{ ok: false, error: "Rate limit exceeded" }`.

### Data Flow

- AI responses are **NOT stored** in Convex
- User explicitly applies accepted suggestions via standard mutations
- This keeps the data model clean — no "ghost edits"

---

## 4. UI — Career Data Field Rewrite

**Location:** `app/(dashboard)/career-data/` components

### Eligible Fields

AI rewrite button on:
- `experiences[].bullets[]`
- `experiences[].role`
- `projects[].description`
- `projects[].bullets[]`
- `education[].details`
- `personal.summary`
- `skills[].name` (context-aware)

Not eligible: dates, location, company name, institution, degree, category, level.

### Interaction Flow

1. Small sparkle icon button in top-right corner of each eligible field
2. Click → button shows loading spinner
3. Calls `ai.rewrite_field` Convex mutation
4. Below the field, a diff overlay appears:
   - Original text (red background or strikethrough)
   - Suggested text (green background)
   - Reasoning text (italic, muted)
   - Three buttons: **Apply** | **Regenerate** | **Cancel**
5. **Apply** → calls standard career data mutation to save new value, closes overlay
6. **Regenerate** → calls AI again, updates suggestion
7. **Cancel** → closes overlay, no changes

### Reuse

The diff overlay component is a shared component (`components/ai-diff-overlay.tsx`) used in both Career Data and CV Editor.

---

## 5. UI — CV Editor AI (Content Tab)

Same pattern as Career Data, but:
- Region is read from CV settings
- AI uses CV-specific region instructions (more precise)
- Diff overlay is the same shared component

### CV Content Override Flow

When user edits an override field in Content tab:
1. Region-aware AI rewrite available
2. Same diff overlay flow
3. On Apply → saves as CV content override (not to career data)

---

## 6. UI — CV Editor AI (Layout Tab)

**New element:** "Get AI Suggestions" button at the top of the Layout tab.

### Interaction Flow

1. User clicks "Get AI Suggestions"
2. Calls `ai.suggest_layout` with CV + region
3. Shows suggested section order with explanation per section:
   ```
   [1. Summary] — "US tech roles benefit from a summary at the top to quickly show value"
   [2. Experience] — "Experience is the most important section for US recruiters"
   [3. Skills] — "Technical skills near the top for engineering roles"
   ...
   ```
4. Each row has **Accept** / **Reject** / **Move Up** / **Move Down** buttons
5. **Accept All** applies the full suggested order
6. **Accept** on individual sections applies only that suggestion
7. Changes update `section_order` via standard CV mutation

---

## 7. UI — Profile AI Generation

### Creation Wizard Integration

Profile creation wizard (currently Step 1: basics) gets a new **Step 2: "Generate with AI"** between basics and manual configuration.

### Step 2 Flow

1. Text input: "What kind of CV do you want? (e.g., Senior frontend engineer, US market, 5 years experience)"
2. Region selector dropdown (pre-filled from CV creation context if available)
3. "Generate" button
4. Calls `ai.generate_profile`
5. Shows preview:
   - Suggested profile name
   - Include/exclude tags
   - Item limits
   - Section ordering
6. User can edit any of these before proceeding
7. "Continue" passes to Step 3 for final review/override

### Existing Profiles

A floating "Regenerate with AI" button (bottom-right) on the profile edit page, opens the same flow in a modal.

---

## 8. Region Override Per-CV

### Document Tab Addition

CV Document tab gets a new field: **"Region Standard"** dropdown.

- Default: empty (uses "International" fallback)
- Options: all 10 regions
- When set: visual badge in Content and Layout tabs showing current region (e.g., "🇺🇸 US" or "🇩🇪 Germany")

---

## 9. Minimax Integration Details

### API Configuration

```typescript
// environment variable
MINIMAX_API_KEY=your_key_here
MINIMAX_MODEL=Minimax-2.7-flash  // or appropriate model ID
```

### Error Handling

All AI calls return:
```typescript
{ ok: true, data: T } | { ok: false, error: string }
```

Error states to handle:
- API key missing/invalid
- Rate limit exceeded
- Network failure
- Invalid response format (AI returned non-JSON)
- Context too long (token limit)

For token limit errors: truncate career data context and retry, or return partial suggestion with warning.

### Logging

All AI calls logged to `ai_call_logs` Convex table for debugging and cost tracking:
```typescript
{ userId, function, tokens_used, region, timestamp, success }
```

---

## 10. File Map

### New Files

```
lib/region-instructions/
├── us.ts
├── canada.ts
├── uk.ts
├── eu.ts
├── germany.ts
├── france.ts
├── afghanistan.ts
├── russia.ts
├── australia.ts
├── international.ts
└── index.ts

lib/ai/
├── prompts/
│   ├── index.ts
│   ├── rewrite-field.ts
│   ├── suggest-layout.ts
│   └── generate-profile.ts
├── minimax.ts
└── types.ts

convex/ai/
├── rewrite_field.ts
├── suggest_layout.ts
├── generate_profile.ts
└── minimax.ts

convex/schema.ts  ← add rate_limits, ai_call_logs tables

components/ai-diff-overlay.tsx

app/(dashboard)/career-data/  ← add AI buttons to eligible fields
app/(dashboard)/cvs/[id]/     ← add AI in Content + Layout tabs
app/(dashboard)/profiles/     ← add AI generation step + floating button
```

### Modified Files

```
convex/schema.ts        ← add rate_limits + ai_call_logs
app/(dashboard)/cvs/[id]/page.tsx  ← add region dropdown in Document tab
```

---

## 11. Implementation Order

1. **Region instruction layer** (`lib/region-instructions/`) — foundation, no dependencies
2. **Minimix client** (`lib/ai/minimax.ts`) — core API wrapper
3. **Prompt builders** (`lib/ai/prompts/`) — uses region layer
4. **Convex AI functions** (`convex/ai/`) — uses prompt builders
5. **Diff overlay component** (`components/ai-diff-overlay.tsx`)
6. **Career Data AI buttons** — first user-facing feature
7. **CV Editor Content AI** — region-aware rewrites
8. **CV Editor Layout AI** — layout suggestions
9. **Profile AI generation** — wizard step + floating button
10. **Region dropdown per-CV** — Document tab

---

## 12. Testing Strategy

- Unit test region instruction `toSystemPrompt()` for all 10 regions
- Unit test prompt builders with mock data
- Integration test Convex functions with mocked Minimax responses
- E2E: AI rewrite flow works end-to-end with real Minimax key
