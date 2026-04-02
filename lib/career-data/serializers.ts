export function splitMultilineInput(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function joinMultilineInput(values: string[]) {
  return values.join("\n")
}

export function splitCommaInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

export function joinCommaInput(values: string[]) {
  return values.join(", ")
}
