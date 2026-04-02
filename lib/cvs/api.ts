import type { ApiResponse } from "@/lib/career-data/types"
import type { CvData, CvPayload } from "@/lib/cvs/types"

async function requestCvs<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : null),
      ...init?.headers,
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message ?? "We couldn’t complete that CV action.")
  }

  return payload.data
}

export function fetchCvs() {
  return requestCvs<CvData[]>("/api/cvs", { cache: "no-store" })
}

export function createCv(cv: CvPayload) {
  return requestCvs<CvData>("/api/cvs", {
    method: "POST",
    body: JSON.stringify(cv),
  })
}

export function updateCv(id: string, cv: CvPayload) {
  return requestCvs<CvData>(`/api/cvs/${id}`, {
    method: "PUT",
    body: JSON.stringify(cv),
  })
}

export function deleteCv(id: string) {
  return requestCvs<{ id: string }>(`/api/cvs/${id}`, {
    method: "DELETE",
  })
}
