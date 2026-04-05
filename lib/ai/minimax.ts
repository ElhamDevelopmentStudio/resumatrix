type CallMinimaxParams<T> = {
  systemPrompt: string
  userPrompt: string
  outputSchema: object
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function callMinimax<T>(params: CallMinimaxParams<T>): Promise<import("./types").AIResponse<T>> {
  const {
    systemPrompt,
    userPrompt,
    outputSchema,
    model = "Minimax-2.7-flash",
    temperature = 0.7,
    maxTokens = 1024,
  } = params

  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    return { ok: false, error: "MINIMAX_API_KEY is not set" }
  }

  try {
    const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_schema", json_schema: outputSchema },
      }),
    })

    if (!response.ok) {
      return { ok: false, error: `HTTP error: ${response.status} ${response.statusText}` }
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return { ok: false, error: "No content in response" }
    }

    // Strip markdown code blocks if present
    let jsonStr = content
    const codeBlockMatch = content.match(/^```json\s*\n([\s\S]*?)\n```$/i)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1]
    }

    const parsed = JSON.parse(jsonStr) as T
    return { ok: true, data: parsed }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}