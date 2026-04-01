export type PersonalData = {
  full_name: string
  title: string
  summary: string
}

export type ContactData = {
  id: string
  type: string
  value: string
}

export type ContactPayload = Omit<ContactData, "id">

export type ApiError = {
  message: string
  code: string
}

export type ApiSuccess<T> = {
  success: true
  data: T
  error: null
}

export type ApiFailure = {
  success: false
  data: null
  error: ApiError
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export const emptyPersonalData: PersonalData = {
  full_name: "",
  title: "",
  summary: "",
}

export const contactTypeOptions = [
  "Email",
  "Phone",
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "X / Twitter",
] as const
