export type SectionKey =
  | "personal"
  | "contacts"
  | "experiences"
  | "projects"
  | "education"
  | "skills"

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
