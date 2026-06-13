import type { JsonSchema } from "./output-schemas"

export function buildJsonOnlySystemPrompt(systemPrompt: string, schema: JsonSchema) {
  return `${systemPrompt}\n\nReturn only a JSON object that matches this schema exactly. Do not add markdown fences, explanations, or extra text.\nSchema: ${JSON.stringify(schema)}`
}
