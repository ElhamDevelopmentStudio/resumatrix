"use client"

import * as ResizablePrimitive from "react-resizable-panels"
import { HorizontalResizeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "group/resizable-handle relative flex items-center justify-center bg-transparent ring-offset-background transition-colors focus-visible:outline-hidden",
        "aria-[orientation=vertical]:w-3 aria-[orientation=vertical]:cursor-col-resize",
        "aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:cursor-row-resize",
        "before:absolute before:rounded-full before:bg-border/80 before:transition-colors",
        "hover:bg-primary-soft/60 hover:before:bg-primary/45 focus-visible:bg-primary-soft/60 focus-visible:before:bg-primary/45",
        "aria-[orientation=vertical]:before:inset-y-2 aria-[orientation=vertical]:before:left-1/2 aria-[orientation=vertical]:before:w-px aria-[orientation=vertical]:before:-translate-x-1/2",
        "aria-[orientation=horizontal]:before:inset-x-2 aria-[orientation=horizontal]:before:top-1/2 aria-[orientation=horizontal]:before:h-px aria-[orientation=horizontal]:before:-translate-y-1/2",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 inline-flex size-7 items-center justify-center rounded-full border border-border/80 bg-card text-on-surface-variant shadow-sm transition-colors group-hover/resizable-handle:border-primary/35 group-hover/resizable-handle:text-primary">
          <HugeiconsIcon icon={HorizontalResizeIcon} strokeWidth={2} className="size-3.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
