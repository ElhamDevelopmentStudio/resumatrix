"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ProfileSectionSelectorItem = {
  id: string
  title: string
  description: string
  meta: string[]
  available: boolean
}

type ProfileSectionSelectorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionLabel: string
  itemLabel: string
  description: string
  automaticDescription: string
  items: ProfileSectionSelectorItem[]
  value: string[] | null
  onSave: (value: string[] | null) => void
}

export function ProfileSectionSelectorDialog({
  open,
  onOpenChange,
  sectionLabel,
  itemLabel,
  description,
  automaticDescription,
  items,
  value,
  onSave,
}: ProfileSectionSelectorDialogProps) {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<"automatic" | "custom">(
    value === null ? "automatic" : "custom"
  )
  const [selectedIds, setSelectedIds] = useState<string[]>(() => value ?? items.map((item) => item.id))

  const allIds = useMemo(() => items.map((item) => item.id), [items])
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return items
    }

    return items.filter((item) => {
      const haystack = [item.title, item.description, ...item.meta].join(" ").toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [items, query])

  const selectedCount = mode === "automatic" ? items.length : selectedIds.length

  const isSelected = (itemId: string) =>
    mode === "automatic" ? true : selectedIds.includes(itemId)

  const toggleItem = (itemId: string) => {
    if (mode === "automatic") {
      setMode("custom")
      setSelectedIds(allIds.filter((currentId) => currentId !== itemId))
      return
    }

    setSelectedIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId]
    )
  }

  const handleSave = () => {
    if (mode === "automatic" || selectedIds.length === allIds.length) {
      onSave(null)
      onOpenChange(false)
      return
    }

    onSave(selectedIds)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-3rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-outline-variant/60 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-on-surface">
            Customize {sectionLabel.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <label htmlFor="profile-section-search" className="text-sm font-medium text-on-surface">
                Search {sectionLabel.toLowerCase()}
              </label>
              <Input
                id="profile-section-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${sectionLabel.toLowerCase()}`}
                className="h-11 rounded-sm border-outline-variant/70 bg-background px-3 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("automatic")}>
                Use automatic
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode("custom")
                  setSelectedIds(allIds)
                }}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode("custom")
                  setSelectedIds([])
                }}
              >
                Clear all
              </Button>
            </div>
          </div>

          <Card className="rounded-sm border border-outline-variant/60 bg-surface-subtle/40 p-4 shadow-none">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-on-surface">
                    {mode === "automatic" ? "Automatic selection" : "Custom selection"}
                  </p>
                  <Badge variant="outline">
                    {selectedCount} of {items.length} selected
                  </Badge>
                </div>
                <p className="text-sm text-on-surface-variant/75">
                  {mode === "automatic"
                    ? automaticDescription
                    : `Only the ${itemLabel}${selectedCount === 1 ? "" : "s"} you keep selected here can appear in this profile.`}
                </p>
              </div>
            </div>
          </Card>

          {visibleItems.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleItems.map((item) => {
                const selected = isSelected(item.id)

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "rounded-sm border p-4 shadow-none transition-colors",
                      selected
                        ? "border-primary/30 bg-primary-soft/40"
                        : "border-outline-variant/60 bg-card"
                    )}
                  >
                    <div className="flex h-full flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-on-surface">{item.title}</h3>
                          <p className="text-sm text-on-surface-variant/75">{item.description}</p>
                        </div>

                        <Button
                          type="button"
                          variant={selected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleItem(item.id)}
                        >
                          {selected ? "Included" : "Hidden"}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.meta.map((metaItem) => (
                          <Badge
                            key={`${item.id}-${metaItem}`}
                            variant="outline"
                            className="border-outline-variant/70 bg-surface-subtle text-on-surface-variant"
                          >
                            {metaItem}
                          </Badge>
                        ))}
                        {!item.available ? (
                          <Badge variant="destructive">Blocked by current tag rules</Badge>
                        ) : null}
                      </div>

                      {!item.available ? (
                        <p className="text-xs text-on-surface-variant/70">
                          This item is currently filtered out by your include or exclude tags.
                        </p>
                      ) : null}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Empty className="rounded-sm border border-dashed border-outline-variant/70 bg-card py-14">
              <EmptyHeader>
                <EmptyTitle>No {sectionLabel.toLowerCase()} match this search</EmptyTitle>
                <EmptyDescription>
                  Try a different search term to find the {itemLabel} you want to update.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

        <DialogFooter className="border-t border-outline-variant/60 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
