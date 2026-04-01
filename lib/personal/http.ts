import type { ApiFailure, ApiSuccess } from "@/lib/personal/types"

export function buildApiSuccess<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
    error: null,
  }
}

export function buildApiError(message: string, code: string): ApiFailure {
  return {
    success: false,
    data: null,
    error: {
      message,
      code,
    },
  }
}
