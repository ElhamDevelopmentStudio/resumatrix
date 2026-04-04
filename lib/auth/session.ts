import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"

export const AUTH_SESSION_COOKIE = "resumatrix_session"
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 12

const DEV_USERNAME = "admin"
const DEV_PASSWORD = "password"
const DEV_SESSION_SECRET = "resumatrix-dev-session-secret"

type AuthCredentials = {
  username: string
  password: string
}

type SessionPayload = {
  exp: number
  nonce: string
  sub: string
}

export type AuthSession = {
  username: string
  expiresAt: number
}

export type LoginRequestBody = {
  username: string
  password: string
}

export type LoginError = {
  message: string
  code: string
}

export type LoginSuccessResponse = {
  success: true
  data: {
    token: string
  }
  error: null
}

export type LoginErrorResponse = {
  success: false
  data: null
  error: LoginError
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse

export function getConfiguredCredentials(): AuthCredentials | null {
  const username =
    process.env.RESUMATRIX_AUTH_USERNAME ??
    process.env.AUTH_USERNAME ??
    (process.env.NODE_ENV === "production" ? undefined : DEV_USERNAME)

  const password =
    process.env.RESUMATRIX_AUTH_PASSWORD ??
    process.env.AUTH_PASSWORD ??
    (process.env.NODE_ENV === "production" ? undefined : DEV_PASSWORD)

  if (!username || !password) {
    return null
  }

  return { username, password }
}

export function isValidCredentials(
  username: string,
  password: string,
  credentials: AuthCredentials
) {
  return safeCompare(username, credentials.username) && safeCompare(password, credentials.password)
}

export function buildLoginSuccess(token: string): LoginSuccessResponse {
  return {
    success: true,
    data: {
      token,
    },
    error: null,
  }
}

export function buildLoginError(message: string, code: string): LoginErrorResponse {
  return {
    success: false,
    data: null,
    error: {
      message,
      code,
    },
  }
}

export function createSessionToken(username: string) {
  const payload: SessionPayload = {
    exp: Date.now() + AUTH_SESSION_MAX_AGE * 1000,
    nonce: randomUUID(),
    sub: username,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = signPayload(encodedPayload)

  if (!signature) {
    throw new Error("Missing session secret")
  }

  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token: string | null | undefined): AuthSession | null {
  const [encodedPayload, signature] = token?.split(".") ?? []

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signPayload(encodedPayload)

  if (!expectedSignature || !safeCompare(signature, expectedSignature)) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<SessionPayload>

    if (
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null
    }

    return {
      username: payload.sub,
      expiresAt: payload.exp,
    }
  } catch {
    return null
  }
}

function signPayload(encodedPayload: string) {
  const sessionSecret = resolveSessionSecret()

  if (!sessionSecret) {
    return null
  }

  return createHmac("sha256", sessionSecret).update(encodedPayload).digest("hex")
}

function resolveSessionSecret() {
  return (
    process.env.RESUMATRIX_SESSION_SECRET ??
    process.env.AUTH_SESSION_SECRET ??
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : DEV_SESSION_SECRET)
  )
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
