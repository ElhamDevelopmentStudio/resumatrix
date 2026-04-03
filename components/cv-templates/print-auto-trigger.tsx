"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

type PrintAutoTriggerProps = {
  autoPrint: boolean
}

export function PrintAutoTrigger({ autoPrint }: PrintAutoTriggerProps) {
  useEffect(() => {
    if (!autoPrint) {
      return
    }

    const timeout = window.setTimeout(() => {
      window.print()
    }, 150)

    return () => window.clearTimeout(timeout)
  }, [autoPrint])

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <Button type="button" onClick={() => window.print()}>
        Print or save as PDF
      </Button>
      <p className="text-sm text-on-surface-variant/75">
        Use your browser’s print dialog to save this exact preview as a PDF.
      </p>
    </div>
  )
}
