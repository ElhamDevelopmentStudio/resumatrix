import type { ApiResponse, ContactData, ContactPayload, PersonalData } from "@/lib/personal/types"

async function requestData<T>(input: string, init?: RequestInit) {
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
    throw new Error(payload?.error?.message ?? "We couldn’t save your changes right now.")
  }

  return payload.data
}

export function fetchPersonal() {
  return requestData<PersonalData>("/api/personal", { cache: "no-store" })
}

export function updatePersonal(personal: PersonalData) {
  return requestData<PersonalData>("/api/personal", {
    method: "PUT",
    body: JSON.stringify(personal),
  })
}

export function fetchContacts() {
  return requestData<ContactData[]>("/api/contacts", { cache: "no-store" })
}

export function createContact(contact: ContactPayload) {
  return requestData<ContactData>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(contact),
  })
}

export function updateContact(id: string, contact: ContactPayload) {
  return requestData<ContactData>(`/api/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(contact),
  })
}

export function deleteContact(id: string) {
  return requestData<{ id: string }>(`/api/contacts/${id}`, {
    method: "DELETE",
  })
}
