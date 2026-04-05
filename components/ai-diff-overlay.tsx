"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
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
          <span>Getting an AI suggestion…</span>
        </div>
      ) : error ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">We couldn’t get an AI suggestion.</p>
            <p className="text-sm text-on-surface-variant">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRegenerate}>
              Try again
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Dismiss
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
            {suggestion.reasoning ? (
              <div>
                <p className="text-xs italic text-on-surface-variant/60">{suggestion.reasoning}</p>
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onApply(suggestion.suggested)}>
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={onRegenerate}>
              Regenerate
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
