import type { ApiResponse } from "@/lib/career-data/types"
import type { ProfileData, ProfilePayload } from "@/lib/profiles/types"

async function requestProfiles<T>(input: string, init?: RequestInit) {
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
    throw new Error(payload?.error?.message ?? "We couldn’t complete that profile action.")
  }

  return payload.data
}

export function fetchProfiles() {
  return requestProfiles<ProfileData[]>("/api/profiles", { cache: "no-store" })
}

export function createProfile(profile: ProfilePayload) {
  return requestProfiles<ProfileData>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(profile),
  })
}

export function updateProfile(id: string, profile: ProfilePayload) {
  return requestProfiles<ProfileData>(`/api/profiles/${id}`, {
    method: "PUT",
    body: JSON.stringify(profile),
  })
}

export function deleteProfile(id: string) {
  return requestProfiles<{ id: string }>(`/api/profiles/${id}`, {
    method: "DELETE",
  })
}
