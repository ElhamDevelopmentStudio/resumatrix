"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { LoginResponse } from "@/lib/auth/session"

type LoginValues = {
  username: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>

const initialValues: LoginValues = {
  username: "",
  password: "",
}

function validateLoginForm(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {}

  if (!values.username.trim()) {
    errors.username = "Enter your username."
  }

  if (!values.password) {
    errors.password = "Enter your password."
  }

  return errors
}

export function LoginForm() {
  const router = useRouter()
  const [values, setValues] = useState<LoginValues>(initialValues)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange =
    (field: keyof LoginValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value

      setValues((currentValues) => ({
        ...currentValues,
        [field]: nextValue,
      }))

      if (errors[field]) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          [field]: undefined,
        }))
      }

      if (formError) {
        setFormError(null)
      }
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateLoginForm(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setFormError(null)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setFormError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          username: values.username.trim(),
          password: values.password,
        }),
      })

      const payload = (await response.json().catch(() => null)) as LoginResponse | null

      if (!response.ok || !payload?.success) {
        setFormError(
          payload?.error?.message ?? "We couldn't sign you in right now. Try again."
        )
        return
      }

      setValues((currentValues) => ({
        ...currentValues,
        password: "",
      }))
      router.refresh()
    } catch {
      setFormError("We couldn't sign you in right now. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8">
      <Field className="gap-2">
        <FieldLabel
          htmlFor="username"
          className="text-xs font-bold font-body tracking-[0.3em] text-outline uppercase"
        >
          Username
        </FieldLabel>
        <FieldContent>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoFocus
            disabled={isSubmitting}
            enterKeyHint="next"
            placeholder="Enter your username"
            required
            spellCheck={false}
            value={values.username}
            onChange={handleFieldChange("username")}
            aria-invalid={Boolean(errors.username)}
            className="h-14 rounded-lg border-white/50 bg-white/70 px-4 text-base text-on-surface shadow-none backdrop-blur-sm placeholder:text-outline focus-visible:border-primary/30 focus-visible:ring-primary/15 md:text-base"
          />
          <FieldError>{errors.username}</FieldError>
        </FieldContent>
      </Field>

      <Field className="gap-2">
        <FieldLabel
          htmlFor="password"
          className="text-xs font-bold font-body tracking-[0.3em] text-outline uppercase"
        >
          Password
        </FieldLabel>
        <FieldContent>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            enterKeyHint="go"
            placeholder="••••••••"
            required
            value={values.password}
            onChange={handleFieldChange("password")}
            aria-invalid={Boolean(errors.password || formError)}
            className="h-14 rounded-lg border-white/50 bg-white/70 px-4 text-base text-on-surface shadow-none backdrop-blur-sm placeholder:text-outline focus-visible:border-primary/30 focus-visible:ring-primary/15 md:text-base"
          />
          <FieldError>{errors.password}</FieldError>

          {formError ? (
            <div
              role="alert"
              className="mt-2 flex items-center gap-1 text-error animate-in fade-in-0 slide-in-from-top-1 duration-200"
            >
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 shrink-0" />
              <span className="text-xs font-medium">{formError}</span>
            </div>
          ) : null}
        </FieldContent>
      </Field>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full gap-2 rounded-lg text-lg font-semibold tracking-wide"
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-5" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  )
}
