export function getAiClientErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return "We couldn’t complete that AI request. Check your AI provider settings and try again."
}
