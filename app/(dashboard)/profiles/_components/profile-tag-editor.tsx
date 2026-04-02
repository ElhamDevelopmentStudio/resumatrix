"use client"

import { useMemo, useState, type KeyboardEvent } from "react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { normalizeTagList } from "@/lib/profiles/validation"

type ProfileTagEditorProps = {
  label: string
  description: string
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions: string[]
  blockedTags?: string[]
  placeholder: string
  error?: string
  tone?: "default" | "destructive"
}

export function ProfileTagEditor({
  label,
  description,
  tags,
  onChange,
  suggestions,
  blockedTags = [],
  placeholder,
  error,
  tone = "default",
}: ProfileTagEditorProps) {
  const [draft, setDraft] = useState("")

  const normalizedBlockedTags = useMemo(() => new Set(normalizeTagList(blockedTags)), [blockedTags])
  const availableSuggestions = useMemo(
    () =>
      suggestions.filter((tag) => !tags.includes(tag) && !normalizedBlockedTags.has(tag)).slice(0, 8),
    [normalizedBlockedTags, suggestions, tags]
  )

  const addTag = (value: string) => {
    const nextTag = normalizeTagList([value])[0]

    if (!nextTag || tags.includes(nextTag)) {
      setDraft("")
      return
    }

    onChange([...tags, nextTag])
    setDraft("")
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") {
      return
    }

    event.preventDefault()
    addTag(draft)
  }

  return (
    <div className="space-y-2">
      <FieldLabel className="text-sm font-medium text-on-surface">{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>

      <div
        className={cn(
          "rounded-sm border bg-background p-3",
          error ? "border-destructive/60 ring-1 ring-destructive/20" : "border-outline-variant/70"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn(
                "gap-1 border-outline-variant/70 bg-surface-subtle px-2 py-1 text-xs text-on-surface-variant",
                tone === "destructive" ? "border-destructive/30 bg-destructive/5 text-destructive" : undefined
              )}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onChange(tags.filter((currentTag) => currentTag !== tag))}
                aria-label={`Remove ${tag}`}
                className="inline-flex size-3.5 items-center justify-center rounded-sm text-current/70 transition-colors hover:text-current"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
              </button>
            </Badge>
          ))}

          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-9 min-w-[12rem] flex-1 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {availableSuggestions.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(tag)}
              className="h-7 border-outline-variant/60 bg-surface-subtle text-on-surface-variant hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <FieldError>{error}</FieldError>
    </div>
  )
}
