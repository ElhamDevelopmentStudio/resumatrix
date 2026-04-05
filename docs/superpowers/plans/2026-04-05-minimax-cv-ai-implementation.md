# Minimax CV AI Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Minimax 2.7 as an AI assistant across Career Data (field rewrite), CV Editor (content rewrite, layout suggestions), and Profile creation (AI-generated profiles from natural language prompts).

**Architecture:** Three-layer system — (1) `lib/region-instructions/` defines regional CV standards as structured data with system-prompt generation, (2) `lib/ai/prompts/` assembles prompts combining region instructions + career data context, (3) `convex/ai/` exposes typed mutations that call Minimax and return structured suggestions. AI responses are never stored — users apply suggestions explicitly.

**Tech Stack:** Minimax API (REST), TypeScript, Convex mutations/queries, Next.js client components.

---

## File Map

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

convex/schema.ts  ← add rate_limits + ai_call_logs tables

components/ai-diff-overlay.tsx

app/(dashboard)/career-data/_components/  ← add AI buttons to fields
app/(dashboard)/cvs/_components/         ← add AI in Content + Layout tabs
app/(dashboard)/profiles/                 ← add AI generation step + floating button
```

### Modified Files

```
convex/schema.ts
.env.local.example  ← add MINIMAX_API_KEY
```

---

## Task 1: Region Instruction Layer

**Files:**
- Create: `lib/region-instructions/us.ts`
- Create: `lib/region-instructions/canada.ts`
- Create: `lib/region-instructions/uk.ts`
- Create: `lib/region-instructions/eu.ts`
- Create: `lib/region-instructions/germany.ts`
- Create: `lib/region-instructions/france.ts`
- Create: `lib/region-instructions/afghanistan.ts`
- Create: `lib/region-instructions/russia.ts`
- Create: `lib/region-instructions/australia.ts`
- Create: `lib/region-instructions/international.ts`
- Create: `lib/region-instructions/index.ts`

First, create the shared types file that all regions implement:

```typescript
// lib/region-instructions/types.ts
export type SectionKey = "personal" | "contacts" | "experiences" | "projects" | "education" | "skills"

export type SectionOrder = SectionKey[]

export type SectionRequirement = {
  section: SectionKey
  required: boolean
  note?: string
}

export type FormattingRules = {
  nameFormat?: string
  photo?: { included: boolean; size?: string; position?: "top" | "side" }
  dateOfBirth?: "required" | "optional" | "never"
  nationality?: "required" | "optional" | "never"
  maritalStatus?: "required" | "optional" | "never"
  linkedin?: "recommended" | "optional"
  github?: "recommended" | "optional"
  portfolio?: "recommended" | "optional"
}

export type BulletStyle = {
  prefix?: string
  separator?: string
  emphasis: "action_verbs" | "metrics" | "both" | "none"
  maxLength?: number
}

export type ContentEmphasis = {
  highlights: string[]
  omit: string[]
}

export type LengthRules = {
  pages: 1 | 2 | "flexible"
  reason?: string
}

export type RegionStandard = {
  id: string
  name: string
  section_order: SectionOrder
  required_sections: SectionRequirement[]
  formatting: FormattingRules
  bullet_style: BulletStyle
  content_emphasis: ContentEmphasis
  length_expectations: LengthRules
}
```

Then create `lib/region-instructions/index.ts` that exports `getRegionStandard(id): RegionStandard`:

```typescript
// lib/region-instructions/index.ts
import type { RegionStandard } from "./types"

import { us } from "./us"
import { canada } from "./canada"
import { uk } from "./uk"
import { eu } from "./eu"
import { germany } from "./germany"
import { france } from "./france"
import { afghanistan } from "./afghanistan"
import { russia } from "./russia"
import { australia } from "./australia"
import { international } from "./international"

const regions: Record<string, RegionStandard> = {
  us,
  canada,
  uk,
  eu,
  germany,
  france,
  afghanistan,
  russia,
  australia,
  international,
}

export { type RegionStandard, type SectionKey, type SectionOrder, type SectionRequirement, type FormattingRules, type BulletStyle, type ContentEmphasis, type LengthRules } from "./types"

export function getRegionStandard(id: string): RegionStandard {
  return regions[id] ?? international
}

export function getAllRegionIds(): string[] {
  return Object.keys(regions)
}
```

Now create each region file. Example — `lib/region-instructions/us.ts`:

```typescript
// lib/region-instructions/us.ts
import type { RegionStandard } from "./types"

export const us: RegionStandard = {
  id: "us",
  name: "United States",
  section_order: ["contacts", "experiences", "education", "skills", "projects"],
  required_sections: [
    { section: "contacts", required: true, note: "Name, email, phone required" },
    { section: "experiences", required: true },
    { section: "education", required: true },
  ],
  formatting: {
    photo: { included: false },
    dateOfBirth: "never",
    nationality: "never",
    maritalStatus: "never",
    linkedin: "recommended",
    github: "recommended",
    portfolio: "optional",
  },
  bullet_style: {
    emphasis: "both",
  },
  content_emphasis: {
    highlights: ["quantified achievements", "action verbs", "leadership", "impact"],
    omit: ["personal details", "photo", "age", "marital status", "religious affiliation"],
  },
  length_expectations: {
    pages: "flexible",
    reason: "US resumes are typically 1-2 pages depending on experience level",
  },
}
```

Create all 9 remaining region files following the same pattern with appropriate conventions for each country. The `international.ts` should be the most permissive/generic fallback.

Finally, add a `toSystemPrompt()` method to the `RegionStandard` type and implement it in `index.ts` as a function that assembles all fields into a coherent system prompt string:

```typescript
// Append to lib/region-instructions/index.ts

export function toSystemPrompt(region: RegionStandard): string {
  const lines: string[] = [
    `You are a professional CV writer specializing in ${region.name} standards.`,
    "",
    `## Section Order`,
    `Use this section order: ${region.section_order.join(" → ")}`,
    "",
    `## Formatting Rules`,
  ]

  if (region.formatting.photo) {
    lines.push(`- Photo: ${region.formatting.photo.included ? "Include" : "Do not include"}`)
  } else {
    lines.push("- Photo: Do not include")
  }
  lines.push(`- Date of birth: ${region.formatting.dateOfBirth}`)
  lines.push(`- Nationality: ${region.formatting.nationality}`)
  lines.push(`- Marital status: ${region.formatting.maritalStatus}`)
  if (region.formatting.linkedin) lines.push(`- LinkedIn: ${region.formatting.linkedin}`)
  if (region.formatting.github) lines.push(`- GitHub: ${region.formatting.github}`)

  lines.push("", `## Bullet Style`, `- Emphasis: ${region.bullet_style.emphasis}`)
  if (region.bullet_style.maxLength) lines.push(`- Max bullet length: ${region.bullet_style.maxLength} characters`)

  lines.push("", `## Content Emphasis`)
  lines.push(`- Highlight: ${region.content_emphasis.highlights.join(", ")}`)
  lines.push(`- Omit: ${region.content_emphasis.omit.join(", ")}`)

  lines.push("", `## Length`)
  lines.push(`- Pages: ${region.length_expectations.pages === "flexible" ? "Flexible (1-2 pages)" : region.length_expectations.pages}`)
  if (region.length_expectations.reason) lines.push(`- Note: ${region.length_expectations.reason}`)

  return lines.join("\n")
}
```

- [ ] **Step 1: Create `lib/region-instructions/types.ts`** with all shared TypeScript interfaces

- [ ] **Step 2: Create `lib/region-instructions/index.ts`** with `getRegionStandard()`, `getAllRegionIds()`, `toSystemPrompt()`

- [ ] **Step 3: Create `lib/region-instructions/us.ts`**

- [ ] **Step 4: Create `lib/region-instructions/canada.ts`**

- [ ] **Step 5: Create `lib/region-instructions/uk.ts`**

- [ ] **Step 6: Create `lib/region-instructions/eu.ts`** (generic EU)

- [ ] **Step 7: Create `lib/region-instructions/germany.ts`**

- [ ] **Step 8: Create `lib/region-instructions/france.ts`**

- [ ] **Step 9: Create `lib/region-instructions/afghanistan.ts`**

- [ ] **Step 10: Create `lib/region-instructions/russia.ts`**

- [ ] **Step 11: Create `lib/region-instructions/australia.ts`**

- [ ] **Step 12: Create `lib/region-instructions/international.ts`** (fallback)

- [ ] **Step 13: Commit**
```bash
git add lib/region-instructions/ && git commit -m "feat: add region instruction layer for CV AI"
```

---

## Task 2: AI Types and Minimax Client

**Files:**
- Create: `lib/ai/types.ts`
- Create: `lib/ai/minimax.ts`
- Modify: `.env.local.example`

- [ ] **Step 1: Create `lib/ai/types.ts`**

```typescript
// lib/ai/types.ts
export interface RewriteSuggestion {
  original: string
  suggested: string
  reasoning: string
}

export interface LayoutSuggestion {
  section_order: string[]
  reasoning_per_section: Record<string, string>
}

export interface ProfileSuggestion {
  name: string
  include_tags: string[]
  exclude_tags: string[]
  ordering: {
    experiences: "recent" | "oldest"
    projects: "manual" | "name"
    education: "recent" | "oldest"
  }
  limits: {
    experiences: number | null
    projects: number | null
  }
}

export type AIResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
```

- [ ] **Step 2: Create `lib/ai/minimax.ts`**

```typescript
// lib/ai/minimax.ts
import type { AIResponse } from "./types"

const MINIMAX_API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2"

interface MinimaxMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface MinimaxRequest {
  model: string
  messages: MinimaxMessage[]
  temperature?: number
  max_tokens?: number
}

export async function callMinimax<T>({
  systemPrompt,
  userPrompt,
  outputSchema,
  model = "Minimax-2.7-flash",
  temperature = 0.7,
  maxTokens = 1024,
}: {
  systemPrompt: string
  userPrompt: string
  outputSchema: object
  model?: string
  temperature?: number
  maxTokens?: number
}): Promise<AIResponse<T>> {
  const apiKey = process.env.MINIMAX_API_KEY

  if (!apiKey) {
    return { ok: false, error: "MINIMAX_API_KEY is not configured" }
  }

  const request: MinimaxRequest = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt + "\n\nIMPORTANT: Respond only with valid JSON matching this schema:\n" + JSON.stringify(outputSchema) },
    ],
    temperature,
    max_tokens: maxTokens,
  }

  try {
    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return { ok: false, error: `Minimax API error ${response.status}: ${errorBody}` }
    }

    const data = await response.json()

    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      return { ok: false, error: "No response content from Minimax" }
    }

    // Strip markdown code blocks if present
    let jsonStr = assistantMessage.trim()
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7)
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr) as T
    return { ok: true, data: parsed }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: "AI returned invalid JSON response" }
    }
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
```

- [ ] **Step 3: Update `.env.local.example`** — add `MINIMAX_API_KEY=your_key_here` to the file

- [ ] **Step 4: Commit**
```bash
git add lib/ai/types.ts lib/ai/minimax.ts .env.local.example && git commit -m "feat: add AI types and Minimax client"
```

---

## Task 3: Prompt Assembly Layer

**Files:**
- Create: `lib/ai/prompts/index.ts`
- Create: `lib/ai/prompts/rewrite-field.ts`
- Create: `lib/ai/prompts/suggest-layout.ts`
- Create: `lib/ai/prompts/generate-profile.ts`

- [ ] **Step 1: Create `lib/ai/prompts/index.ts`**

```typescript
// lib/ai/prompts/index.ts
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import { toSystemPrompt, getRegionStandard, type RegionStandard } from "@/region-instructions"

export { type RewriteSuggestion, type LayoutSuggestion, type ProfileSuggestion } from "../types"

const BASE_SYSTEM_PROMPT = `You are a professional CV writer. You help users create polished, accurate, and compelling CV content. Be concise, specific, and truthful. Do not fabricate details not present in the provided data.`

export function buildSystemPrompt(region: RegionStandard): string {
  return [BASE_SYSTEM_PROMPT, toSystemPrompt(region)].join("\n\n")
}

export function buildCareerDataContext(careerData: CareerWorkspaceData): string {
  const lines: string[] = ["## Career Data Context", ""]

  lines.push("### Personal")
  lines.push(`Name: ${careerData.personal.full_name || "(not set)"}`)
  lines.push(`Title: ${careerData.personal.title || "(not set)"}`)
  lines.push(`Summary: ${careerData.personal.summary || "(not set)"}`)

  lines.push("", "### Experience")
  if (careerData.experiences.length === 0) {
    lines.push("(none)")
  } else {
    for (const exp of careerData.experiences) {
      lines.push(`- ${exp.role || "Role"} at ${exp.company || "Company"} (${exp.start_date} → ${exp.end_date || "Present"})`)
      if (exp.location) lines.push(`  Location: ${exp.location}`)
      if (exp.bullets.length) lines.push(`  Bullets: ${exp.bullets.join(" | ")}`)
      if (exp.tags.length) lines.push(`  Tags: ${exp.tags.join(", ")}`)
    }
  }

  lines.push("", "### Projects")
  if (careerData.projects.length === 0) {
    lines.push("(none)")
  } else {
    for (const proj of careerData.projects) {
      lines.push(`- ${proj.name || "Project"}: ${proj.description || "(no description)"}`)
      if (proj.tech_stack.length) lines.push(`  Tech: ${proj.tech_stack.join(", ")}`)
      if (proj.bullets.length) lines.push(`  Bullets: ${proj.bullets.join(" | ")}`)
      if (proj.tags.length) lines.push(`  Tags: ${proj.tags.join(", ")}`)
    }
  }

  lines.push("", "### Education")
  if (careerData.education.length === 0) {
    lines.push("(none)")
  } else {
    for (const edu of careerData.education) {
      lines.push(`- ${edu.degree || "Degree"} at ${edu.institution || "Institution"} (${edu.start_date} → ${edu.end_date || "Present"})`)
      if (edu.details) lines.push(`  Details: ${edu.details}`)
    }
  }

  lines.push("", "### Skills")
  if (careerData.skills.length === 0) {
    lines.push("(none)")
  } else {
    const byCategory = careerData.skills.reduce<Record<string, string[]>>((acc, skill) => {
      const cat = skill.category || "Uncategorized"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(skill.name)
      return acc
    }, {})
    for (const [cat, names] of Object.entries(byCategory)) {
      lines.push(`- ${cat}: ${names.join(", ")}`)
    }
  }

  lines.push("", "### Contacts")
  if (careerData.contacts.length === 0) {
    lines.push("(none)")
  } else {
    for (const contact of careerData.contacts) {
      lines.push(`- ${contact.type}: ${contact.value}`)
    }
  }

  return lines.join("\n")
}
```

- [ ] **Step 2: Create `lib/ai/prompts/rewrite-field.ts`**

```typescript
// lib/ai/prompts/rewrite-field.ts
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "@/region-instructions"
import type { RewriteSuggestion } from "../types"
import { buildSystemPrompt, buildCareerDataContext } from "./index"

export type RewriteFieldType = "bullet" | "summary" | "description" | "role" | "details"

interface RewriteFieldParams {
  fieldType: RewriteFieldType
  originalValue: string
  careerData: CareerWorkspaceData
  region: RegionStandard
  entryContext?: string
}

export function buildRewriteFieldUserPrompt(params: RewriteFieldParams): string {
  const { fieldType, originalValue, careerData, region, entryContext } = params
  const ctx = buildCareerDataContext(careerData)

  const fieldLabels: Record<RewriteFieldType, string> = {
    bullet: "a bullet point",
    summary: "the personal summary",
    description: "a project description",
    role: "a job role title",
    details: "education details",
  }

  const lines: string[] = [
    `## Task`,
    `Rewrite ${fieldLabels[fieldType]} to better match ${region.name} CV standards.`,
    "",
    `## Original Content`,
    originalValue || "(empty)",
    "",
  ]

  if (entryContext) {
    lines.push("## Entry Context")
    lines.push(entryContext)
    lines.push("")
  }

  lines.push("## Your Career Data")
  lines.push(ctx)
  lines.push("")
  lines.push(`## Instructions`)
  lines.push(`Rewrite the original content following ${region.name} conventions. Keep the same factual meaning. Make it more impactful, clear, and professionally phrased. Keep it concise. Respond with JSON.`)
  lines.push("")
  lines.push(`IMPORTANT: Respond ONLY with valid JSON matching this schema:`)
  lines.push(JSON.stringify({ original: "string", suggested: "string", reasoning: "string" }))

  return lines.join("\n")
}

export function buildRewriteFieldSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}
```

- [ ] **Step 3: Create `lib/ai/prompts/suggest-layout.ts`**

```typescript
// lib/ai/prompts/suggest-layout.ts
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "@/region-instructions"
import type { LayoutSuggestion } from "../types"
import { buildSystemPrompt, buildCareerDataContext } from "./index"

export function buildSuggestLayoutUserPrompt(
  careerData: CareerWorkspaceData,
  region: RegionStandard,
  currentSectionOrder: string[]
): string {
  const ctx = buildCareerDataContext(careerData)

  const lines: string[] = [
    `## Task`,
    `Suggest an optimal section order for a CV following ${region.name} standards.`,
    "",
    `## Available Sections (in default order)`,
    currentSectionOrder.join(", "),
    "",
    `## Current Section Order in CV`,
    currentSectionOrder.join(" → "),
    "",
    `## Career Data Summary`,
    ctx,
    "",
    `## Instructions`,
    `Based on the career data provided and ${region.name} conventions, suggest the optimal section order. Also explain why each section is placed where it is. Respond ONLY with valid JSON matching this schema:`,
    JSON.stringify({
      section_order: ["string"],
      reasoning_per_section: { "string": "string" }
    }),
  ]

  return lines.join("\n")
}

export function buildSuggestLayoutSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}
```

- [ ] **Step 4: Create `lib/ai/prompts/generate-profile.ts`**

```typescript
// lib/ai/prompts/generate-profile.ts`
import type { CareerWorkspaceData } from "@/lib/career-data/types"
import type { RegionStandard } from "@/region-instructions"
import type { ProfileSuggestion } from "../types"
import { buildSystemPrompt, buildCareerDataContext } from "./index"

export function buildGenerateProfileUserPrompt(
  userPrompt: string,
  careerData: CareerWorkspaceData,
  region: RegionStandard
): string {
  const ctx = buildCareerDataContext(careerData)

  const lines: string[] = [
    `## Task`,
    `Generate a profile configuration from a natural language description of the target CV.`,
    "",
    `## User Request`,
    userPrompt,
    "",
    `## Career Data Available`,
    ctx,
    "",
    `## Instructions`,
    `Create a profile that selects and organizes career data to match the user's request and ${region.name} standards. Analyze their career data and suggest include/exclude tags, item limits, and ordering. Pick tag names that actually exist in the career data where possible. Respond ONLY with valid JSON matching this schema:`,
    JSON.stringify({
      name: "string",
      include_tags: ["string"],
      exclude_tags: ["string"],
      ordering: { experiences: "recent | oldest", projects: "manual | name", education: "recent | oldest" },
      limits: { experiences: "number | null", projects: "number | null" }
    }),
  ]

  return lines.join("\n")
}

export function buildGenerateProfileSystemPrompt(region: RegionStandard): string {
  return buildSystemPrompt(region)
}
```

- [ ] **Step 5: Commit**
```bash
git add lib/ai/prompts/ && git commit -m "feat: add AI prompt assembly layer"
```

---

## Task 4: Convex Schema — Rate Limits and AI Call Logs

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Read current `convex/schema.ts`** to identify exact insertion points

- [ ] **Step 2: Add two new tables to the schema:**

After the `cvs` table definition (before the closing `}`), add:

```typescript
rate_limits: defineTable({
    user_id: v.string(),
    function_name: v.string(),
    call_count: v.number(),
    window_start: v.number(), // Unix timestamp ms
  })
    .index("by_user_function", ["user_id", "function_name"])
    .index("by_window", ["window_start"]),

ai_call_logs: defineTable({
    user_id: v.string(),
    function_name: v.string(),
    region: v.optional(v.string()),
    tokens_used: v.optional(v.number()),
    success: v.boolean(),
    error_message: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_created_at", ["created_at"]),
```

- [ ] **Step 3: Commit**
```bash
git add convex/schema.ts && git commit -m "feat: add rate_limits and ai_call_logs tables to Convex schema"
```

---

## Task 5: Convex AI Functions

**Files:**
- Create: `convex/ai/minimax.ts`
- Create: `convex/ai/rewrite_field.ts`
- Create: `convex/ai/suggest_layout.ts`
- Create: `convex/ai/generate_profile.ts`

First, create `convex/ai/minimax.ts` — a server-side Minimax wrapper:

```typescript
// convex/ai/minimax.ts
import { internal } from "@/../_generated/server"
import type { AIResponse } from "@/ai/types"

const RATE_LIMIT_CALLS = 10
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute

async function checkRateLimit(
  ctx: RunQueryCtx | RunMutationCtx,
  userId: string,
  functionName: string
): Promise<boolean> {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  const existing = await ctx.runQuery(internal.ai.minimax.getRateLimitEntry, {
    userId,
    functionName,
    windowStart,
  })

  if (!existing) {
    return true // no record = no calls made yet
  }

  return existing.call_count < RATE_LIMIT_CALLS
}

async function incrementRateLimit(
  ctx: RunMutationCtx,
  userId: string,
  functionName: string
) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  const existing = await ctx.runQuery(internal.ai.minimax.getRateLimitEntry, {
    userId,
    functionName,
    windowStart,
  })

  if (!existing) {
    await ctx.runMutation(internal.ai.minimax.createRateLimitEntry, {
      userId,
      functionName,
      callCount: 1,
      windowStart,
    })
  } else {
    await ctx.runMutation(internal.ai.minimax.incrementRateLimit, {
      id: existing._id,
      callCount: existing.call_count + 1,
    })
  }
}

async function logAiCall(
  ctx: RunMutationCtx,
  params: {
    userId: string
    functionName: string
    region?: string
    tokensUsed?: number
    success: boolean
    errorMessage?: string
  }
) {
  await ctx.runMutation(internal.ai.minimax.logAiCall, {
    userId: params.userId,
    functionName: params.functionName,
    region: params.region,
    tokensUsed: params.tokensUsed,
    success: params.success,
    errorMessage: params.errorMessage,
    createdAt: new Date().toISOString(),
  })
}

export { checkRateLimit, incrementRateLimit, logAiCall }
```

Note: The internal query/mutation references above (`internal.ai.minimax.getRateLimitEntry`, etc.) will need corresponding internal Convex functions. Create those in the same file as helper queries/mutations.

Create `convex/ai/rewrite_field.ts`:

```typescript
// convex/ai/rewrite_field.ts
"use server"
import { internal } from "@/../_generated/server"
import { buildRewriteFieldSystemPrompt, buildRewriteFieldUserPrompt } from "@/ai/prompts/rewrite-field"
import { getRegionStandard } from "@/region-instructions"
import { callMinimax } from "@/ai/minimax"
import type { RewriteSuggestion } from "@/ai/types"

export async function rewrite_field(
  ctx: RunMutationCtx,
  args: {
    fieldType: "bullet" | "summary" | "description" | "role" | "details"
    originalValue: string
    careerDataSerialized: string  // JSON string of CareerWorkspaceData
    regionId?: string
    entryContext?: string
  }
): Promise<{ ok: true; data: RewriteSuggestion } | { ok: false; error: string }> {
  const userId = ctx.auth.getUserIdentity()?.tokenIdentifier
  if (!userId) return { ok: false, error: "Not authenticated" }

  const { ok: rateLimitOk } = await checkRateLimit(ctx, userId, "rewrite_field")
  if (!rateLimitOk) {
    return { ok: false, error: "Rate limit exceeded. Please wait a moment before trying again." }
  }

  const region = getRegionStandard(args.regionId ?? "international")
  const careerData = JSON.parse(args.careerDataSerialized)

  const systemPrompt = buildRewriteFieldSystemPrompt(region)
  const userPrompt = buildRewriteFieldUserPrompt({
    fieldType: args.fieldType,
    originalValue: args.originalValue,
    careerData,
    region,
    entryContext: args.entryContext,
  })

  const result = await callMinimax<RewriteSuggestion>({
    systemPrompt,
    userPrompt,
    outputSchema: { original: "", suggested: "", reasoning: "" },
  })

  await incrementRateLimit(ctx, userId, "rewrite_field")
  await logAiCall(ctx, {
    userId,
    functionName: "rewrite_field",
    region: region.id,
    success: result.ok,
    errorMessage: result.ok ? undefined : result.error,
  })

  return result
}
```

Create `convex/ai/suggest_layout.ts` and `convex/ai/generate_profile.ts` following the same pattern.

- [ ] **Step 1: Create `convex/ai/rewrite_field.ts`** — full implementation with rate limiting and logging

- [ ] **Step 2: Create `convex/ai/suggest_layout.ts`** — layout suggestion mutation

- [ ] **Step 3: Create `convex/ai/generate_profile.ts`** — profile generation mutation

- [ ] **Step 4: Create helper internal Convex queries/mutations** in `convex/ai/minimax.ts` for rate limit checking, incrementing, and AI call logging

- [ ] **Step 5: Commit**
```bash
git add convex/ai/ && git commit -m "feat: add Convex AI functions for rewrite, layout, and profile generation"
```

---

## Task 6: Diff Overlay Component

**Files:**
- Create: `components/ai-diff-overlay.tsx`

- [ ] **Step 1: Create `components/ai-diff-overlay.tsx`**

```typescript
// components/ai-diff-overlay.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { RewriteSuggestion } from "@/lib/ai/types"

interface AiDiffOverlayProps {
  suggestion: RewriteSuggestion | null
  isLoading: boolean
  error: string | null
  onApply: (suggested: string) => void
  onRegenerate: () => void
  onCancel: () => void
}

export function AiDiffOverlay({
  suggestion,
  isLoading,
  error,
  onApply,
  onRegenerate,
  onCancel,
}: AiDiffOverlayProps) {
  if (!isLoading && !suggestion && !error) return null

  return (
    <Card className="mt-2 border-primary/20 bg-primary-soft/10 p-3">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Spinner className="size-4" />
          <span>Generating suggestion…</span>
        </div>
      ) : error ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">AI error: {error}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRegenerate}>
              Try again
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : suggestion ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-on-surface-variant/70">Original</p>
              <p className="mt-1 rounded-sm bg-destructive/10 px-2 py-1 text-sm text-destructive line-through">
                {suggestion.original || "(empty)"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-on-surface-variant/70">Suggested</p>
              <p className="mt-1 rounded-sm bg-primary-soft/20 px-2 py-1 text-sm text-primary">
                {suggestion.suggested}
              </p>
            </div>
            {suggestion.reasoning && (
              <div>
                <p className="text-xs italic text-on-surface-variant/60">{suggestion.reasoning}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onApply(suggestion.suggested)}>
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={onRegenerate}>
              Regenerate
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/ai-diff-overlay.tsx && git commit -m "feat: add AI diff overlay component"
```

---

## Task 7: Career Data AI — Field Rewrite Buttons

**Files:**
- Modify: `app/(dashboard)/career-data/_components/experience-section.tsx`
- Modify: `app/(dashboard)/career-data/_components/projects-section.tsx`
- Modify: `app/(dashboard)/career-data/_components/education-section.tsx`
- Modify: `app/(dashboard)/career-data/_components/personal-section.tsx`
- Modify: `app/(dashboard)/career-data/_components/skills-section.tsx`

For each section, add a small AI rewrite button (sparkle icon) next to eligible fields. The button calls the `rewrite_field` Convex mutation and shows the `AiDiffOverlay` below the field.

Example — adding AI rewrite to the role field in ExperienceSection:

First, add the `SparkleIcon` import and the mutation call:

```typescript
// In experience-section.tsx, add import:
import { callMutation } from "convex/react"
import { api } from "../../../../../../../convex/_generated/api"
import { AiDiffOverlay } from "@/components/ai-diff-overlay"
import { useState } from "react"

// Inside the ItemCard for an experience entry, modify the role field:
const [roleAiState, setRoleAiState] = useState<"idle" | "loading" | "suggestion" | "error">("idle")
const [roleSuggestion, setRoleSuggestion] = useState<RewriteSuggestion | null>(null)
const [roleError, setRoleError] = useState<string | null>(null)

const handleRoleRewrite = async () => {
  setRoleAiState("loading")
  const result = await callMutation(api.ai.rewrite_field, {
    fieldType: "role",
    originalValue: experience.role,
    careerDataSerialized: JSON.stringify(useCareerDataStore.getState()), // serialize full workspace
  })
  if (result.ok) {
    setRoleSuggestion(result.data)
    setRoleAiState("suggestion")
  } else {
    setRoleError(result.error)
    setRoleAiState("error")
  }
}

const handleRoleApply = (newValue: string) => {
  updateExperienceField(experience.clientId, "role", newValue)
  setRoleAiState("idle")
  setRoleSuggestion(null)
}
```

Then in the JSX, add the sparkle button next to the Role FieldLabel and the AiDiffOverlay below the Input.

Apply this same pattern to:
- `bullets_text` field in experience (fieldType: "bullet")
- `description` field in projects (fieldType: "description")
- `bullets_text` in projects (fieldType: "bullet")
- `details` field in education (fieldType: "details")
- `summary` field in personal (fieldType: "summary")

- [ ] **Step 1: Add AI rewrite to experience-section.tsx** — role and bullets fields

- [ ] **Step 2: Add AI rewrite to projects-section.tsx** — description and bullets fields

- [ ] **Step 3: Add AI rewrite to education-section.tsx** — details field

- [ ] **Step 4: Add AI rewrite to personal-section.tsx** — summary field

- [ ] **Step 5: Add AI rewrite to skills-section.tsx** — name field (with career context)

- [ ] **Step 6: Commit**
```bash
git add app/\(dashboard\)/career-data/ && git commit -m "feat: add AI rewrite buttons to Career Data fields"
```

---

## Task 8: CV Editor — Region Dropdown in Document Tab

**Files:**
- Modify: `app/(dashboard)/cvs/_components/cv-editor.tsx` — Document tab section
- Modify: `lib/cvs/types.ts` — add `region_id` to CvPayload and CvData

First, add `region_id` to the CV types and schema:

- [ ] **Step 1: Add `region_id` to `lib/cvs/types.ts`** — add `region_id?: string` to `CvPayload` and `CvData`

- [ ] **Step 2: Update the `cvs` table in `convex/schema.ts`** — add `region_id: v.optional(v.string())` as a top-level field on the `cvs` table (not inside `cvOverridesValidator`)

- [ ] **Step 3: In `cv-editor.tsx` Document tab**, add a Region dropdown below the Template selector using the same pattern as other dropdowns. Use `getAllRegionIds()` from `lib/region-instructions` for options.

- [ ] **Step 4: Add a region badge** to the CV editor header showing the active region when one is set

- [ ] **Step 5: Commit**
```bash
git add lib/cvs/types.ts convex/schema.ts app/\(dashboard\)/cvs/_components/cv-editor.tsx && git commit -m "feat: add region dropdown to CV Document tab"
```

---

## Task 9: CV Editor Content Tab — Region-Aware AI Rewrite

**Files:**
- Modify: `app/(dashboard)/cvs/_components/cv-content-editor.tsx`

In the CV Content tab, add AI rewrite buttons to the same fields as Career Data, but these call `ai.rewrite_field` with the CV's region context (from the CV's `region_id`).

- [ ] **Step 1: Add AI buttons to header fields** (full_name, title, summary) in the header section — these read `cv?.region_id`

- [ ] **Step 2: Add AI buttons to experience fields** (role, bullets) in the experiences section

- [ ] **Step 3: Add AI buttons to project fields** (description, bullets) in the projects section

- [ ] **Step 4: Add AI buttons to education details** in the education section

- [ ] **Step 5: Commit**
```bash
git add app/\(dashboard\)/cvs/_components/cv-content-editor.tsx && git commit -m "feat: add region-aware AI rewrite to CV Content tab"
```

---

## Task 10: CV Editor Layout Tab — AI Layout Suggestions

**Files:**
- Modify: `app/(dashboard)/cvs/_components/cv-editor.tsx` — Layout tab

Add a "Get AI Suggestions" button at the top of the Layout tab that calls `ai.suggest_layout` and displays a list of suggested section order changes with Accept/Reject per section.

- [ ] **Step 1: Add "Get AI Suggestions" button** at the top of the layout tab

- [ ] **Step 2: Build layout suggestion UI** — shows suggested order with explanations, Accept All + per-section Accept buttons

- [ ] **Step 3: Wire up accepted suggestions** to `moveSection` calls via the existing `updateState` mechanism

- [ ] **Step 4: Commit**
```bash
git add app/\(dashboard\)/cvs/_components/cv-editor.tsx && git commit -m "feat: add AI layout suggestions to CV Layout tab"
```

---

## Task 11: Profile AI Generation — Wizard Step + Floating Button

**Files:**
- Modify: `app/(dashboard)/profiles/_components/profile-builder.tsx`
- Modify: `app/(dashboard)/profiles/new/page.tsx`

Add a new step between "name" and "filters" called "generate" that:
1. Shows a text input for the user's prompt
2. Has a Region selector dropdown
3. Calls `ai.generate_profile`
4. Shows the generated profile preview with ability to edit before proceeding

For existing profiles, add a floating "Regenerate with AI" button that opens the same flow in a modal.

- [ ] **Step 1: Add `generate` to `stepOrder` array** in `profile-builder.tsx`: `["name", "generate", "filters", "items", "review"]`

- [ ] **Step 2: Add the generation step UI** — text prompt input, region dropdown, generate button, result preview with edit capability

- [ ] **Step 3: Wire up `ai.generate_profile`** call to populate form state with suggested values

- [ ] **Step 4: Add floating "Regenerate with AI" button** for edit mode, opening the same generation modal

- [ ] **Step 5: Commit**
```bash
git add app/\(dashboard\)/profiles/ && git commit -m "feat: add AI profile generation to Profile wizard"
```

---

## Task 12: Environment Variable Documentation

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Ensure `.env.local.example`** has `MINIMAX_API_KEY=your_minimax_api_key_here` documented

- [ ] **Step 2: Commit**
```bash
git add .env.local.example && git commit -m "docs: add MINIMAX_API_KEY to environment example"
```

---

## Implementation Order

Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

Each task is self-contained and produces a commit. Tasks 1-5 are pure backend/infrastructure. Task 6 is a shared UI component. Tasks 7-11 are UI integrations.
