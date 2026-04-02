export async function parseJsonBody<T>(request: Request) {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return null
  }
}

export function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}
