"use client"

import { useState } from "react"
import type { ComponentProps } from "react"
import { saveAs } from "file-saver"

import { Button } from "@/components/ui/button"
import { cvExportFormatOptions, type CvExportFormat } from "@/lib/cvs/types"

type CvExportLinksProps = {
  cvId: string
  disabled?: boolean
  onBeforeExport?: () => Promise<void> | void
  buttonSize?: ComponentProps<typeof Button>["size"]
}

function buildExportHref(cvId: string, format: CvExportFormat) {
  if (format === "pdf") {
    return `/cv-print/${cvId}?autoprint=1`
  }

  return `/api/cvs/${cvId}/export?format=${format}`
}

function getFallbackFileName(format: Exclude<CvExportFormat, "pdf">) {
  return format === "markdown" ? "cv.md" : `cv.${format}`
}

function getFileNameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) {
    return fallback
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return fallback
    }
  }

  const fileNameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i)
  return fileNameMatch?.[1] ?? fallback
}

export function CvExportLinks({
  cvId,
  disabled = false,
  onBeforeExport,
  buttonSize = "default",
}: CvExportLinksProps) {
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

      const response = await fetch(href, {
        method: "GET",
        credentials: "same-origin",
      })

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`)
      }

      const blob = await response.blob()
      const fileName = getFileNameFromDisposition(
        response.headers.get("content-disposition"),
        getFallbackFileName(format)
      )

      saveAs(blob, fileName)
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
          size={buttonSize}
          disabled={disabled || busyFormat !== null}
          onClick={() => void handleExport(format.value)}
        >
          {busyFormat === format.value ? `Preparing ${format.label}…` : `Export ${format.label}`}
        </Button>
      ))}
    </div>
  )
}
