"use client"

import { useState } from "react"
import { FullscreenIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { TemplateRenderer } from "@/components/cv-templates/template-renderer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CvRenderModel } from "@/lib/cvs/types"

type CvPreviewPanelProps = {
  templateId: string
  model: CvRenderModel
}

export function CvPreviewPanel({ templateId, model }: CvPreviewPanelProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  return (
    <>
      <Card className="relative overflow-hidden rounded-sm border border-outline-variant/60 bg-card shadow-sm">
        <div className="absolute top-3 right-3 z-10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-outline-variant/70 bg-background/95 shadow-sm backdrop-blur-sm"
            onClick={() => setFullscreenOpen(true)}
          >
            <HugeiconsIcon icon={FullscreenIcon} strokeWidth={2} />
            Full screen
          </Button>
        </div>
        <div className="max-h-[75vh] overflow-auto bg-surface-subtle/35 p-2 md:p-3">
          <TemplateRenderer templateId={templateId} model={model} mode="preview" />
        </div>
      </Card>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-sm p-0 sm:max-w-[calc(100vw-2rem)]">
          <DialogHeader className="border-b border-outline-variant/60 px-4 py-3">
            <DialogTitle className="text-sm font-medium text-on-surface">Full-screen preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-surface-subtle/35 p-3 md:p-5">
            <TemplateRenderer templateId={templateId} model={model} mode="preview" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
