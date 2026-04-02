"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cvExportFormatOptions, type CvExportFormat } from "@/lib/cvs/types"

type CvExportLinksProps = {
  cvId: string
  disabled?: boolean
  onBeforeExport?: () => Promise<void> | void
}

function buildExportHref(cvId: string, format: CvExportFormat) {
  if (format === "pdf") {
    return `/cv-print/${cvId}?autoprint=1`
  }

  return `/api/cvs/${cvId}/export?format=${format}`
}

export function CvExportLinks({ cvId, disabled = false, onBeforeExport }: CvExportLinksProps) {
  const [busyFormat, setBusyFormat] = useState<CvExportFormat | null>(null)

  const handleExport = async (format: CvExportFormat) => {
    try {
      setBusyFormat(format)
      await onBeforeExport?.()
      const href = buildExportHref(cvId, format)

      if (format === "pdf") {
        window.open(href, "_blank", "noopener,noreferrer")
        return
      }

      const link = document.createElement("a")
      link.href = href
      link.rel = "noopener noreferrer"
      document.body.append(link)
      link.click()
      link.remove()
    } catch {
      // The editor shows save errors. We only stop the export attempt here.
    } finally {
      setBusyFormat(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cvExportFormatOptions.map((format) => (
        <Button
          key={format.value}
          type="button"
          variant={format.value === "pdf" ? "default" : "outline"}
          disabled={disabled || busyFormat !== null}
          onClick={() => void handleExport(format.value)}
        >
          {busyFormat === format.value ? `Preparing ${format.label}…` : `Export ${format.label}`}
        </Button>
      ))}
    </div>
  )
}
