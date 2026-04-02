export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function buildHtmlDocument(title: string, bodyMarkup: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title></head><body>${bodyMarkup}</body></html>`
}

export function getDisplayNameParts(fullName: string, mode: "preview" | "print") {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return mode === "preview"
      ? { primary: "Your", secondary: "Name" }
      : { primary: "", secondary: "" }
  }

  if (parts.length === 1) {
    return { primary: "", secondary: parts[0] }
  }

  return {
    primary: parts.slice(0, -1).join(" "),
    secondary: parts.at(-1) ?? "",
  }
}
