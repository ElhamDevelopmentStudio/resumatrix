"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { FormSection } from "@/components/ui/form-section"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  createContact,
  deleteContact,
  fetchContacts,
  fetchPersonal,
  updateContact,
  updatePersonal,
} from "@/lib/personal/api"
import { emptyPersonalData, type ContactData, type PersonalData } from "@/lib/personal/types"

import { ContactListEditor, type ContactDraft } from "./contact-list-editor"
import { SaveIndicator } from "./save-indicator"

type PersonalErrors = {
  full_name?: string
}

type ContactErrors = Record<string, { type?: string; value?: string }>

type SaveState = "idle" | "saving" | "saved" | "error"

const AUTOSAVE_DELAY_MS = 700

function toContactDraft(contact: ContactData): ContactDraft {
  return {
    clientId: contact.id,
    id: contact.id,
    type: contact.type,
    value: contact.value,
  }
}

function buildBlankContact(): ContactDraft {
  return {
    clientId: crypto.randomUUID(),
    id: null,
    type: "",
    value: "",
  }
}

function validatePersonal(personal: PersonalData): PersonalErrors {
  return {
    full_name: personal.full_name.trim() ? undefined : "Enter your full name.",
  }
}

function validateContact(contact: ContactDraft) {
  const hasType = Boolean(contact.type.trim())
  const hasValue = Boolean(contact.value.trim())

  if (!hasType && !hasValue) {
    return {}
  }

  return {
    type: hasValue && !hasType ? "Select a contact type." : undefined,
    value: hasType && !hasValue ? "Enter a contact value." : undefined,
  }
}

function isSamePersonal(left: PersonalData, right: PersonalData) {
  return (
    left.full_name === right.full_name &&
    left.title === right.title &&
    left.summary === right.summary
  )
}

export function PersonalInfoForm() {
  const [personal, setPersonal] = useState<PersonalData>(emptyPersonalData)
  const [contacts, setContacts] = useState<ContactDraft[]>([])
  const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({})
  const [contactErrors, setContactErrors] = useState<ContactErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)

  const hasLoadedRef = useRef(false)
  const personalSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contactSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedPersonalRef = useRef<PersonalData>(emptyPersonalData)
  const savedContactsRef = useRef<ContactData[]>([])
  const inFlightContactIdsRef = useRef<Set<string>>(new Set())
  const pendingSaveCountRef = useRef(0)

  const beginSaving = useCallback(() => {
    pendingSaveCountRef.current += 1
    setSaveState("saving")
    setSaveError(null)
  }, [])

  const finishSaving = useCallback((status: Exclude<SaveState, "idle">, message?: string) => {
    pendingSaveCountRef.current = Math.max(0, pendingSaveCountRef.current - 1)

    if (status === "error") {
      setSaveState("error")
      setSaveError(message ?? "We couldn’t save your changes right now.")
      return
    }

    if (pendingSaveCountRef.current === 0) {
      setSaveState(status)
      setLastSavedAt(Date.now())
      setSaveError(null)
    }
  }, [])

  const loadForm = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const [nextPersonal, nextContacts] = await Promise.all([fetchPersonal(), fetchContacts()])

      savedPersonalRef.current = nextPersonal
      savedContactsRef.current = nextContacts

      setPersonal(nextPersonal)
      setContacts(nextContacts.map(toContactDraft))
      setPersonalErrors({})
      setContactErrors({})
      setSaveState("idle")
      setLastSavedAt(null)
      hasLoadedRef.current = true
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "We couldn’t load your personal details."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadForm()

    return () => {
      if (personalSaveTimerRef.current) {
        clearTimeout(personalSaveTimerRef.current)
      }

      if (contactSaveTimerRef.current) {
        clearTimeout(contactSaveTimerRef.current)
      }
    }
  }, [loadForm])

  const syncPersonal = useCallback(
    async (nextPersonal: PersonalData) => {
      const nextErrors = validatePersonal(nextPersonal)
      setPersonalErrors(nextErrors)

      if (nextErrors.full_name || isSamePersonal(nextPersonal, savedPersonalRef.current)) {
        return
      }

      beginSaving()

      try {
        const savedPersonal = await updatePersonal(nextPersonal)
        savedPersonalRef.current = savedPersonal
        setPersonal(savedPersonal)
        setPersonalErrors({})
        finishSaving("saved")
      } catch (error) {
        finishSaving(
          "error",
          error instanceof Error ? error.message : "We couldn’t save your personal details."
        )
      }
    },
    [beginSaving, finishSaving]
  )

  const syncContacts = useCallback(
    async (nextContacts: ContactDraft[]) => {
      const nextErrors: ContactErrors = {}
      const operations: Array<Promise<void>> = []
      const savedContactsById = new Map(
        savedContactsRef.current.map((contact) => [contact.id, contact])
      )

      for (const contact of nextContacts) {
        const errors = validateContact(contact)

        if (errors.type || errors.value) {
          nextErrors[contact.clientId] = errors
          continue
        }

        const hasContent = Boolean(contact.type.trim() || contact.value.trim())

        if (!hasContent || inFlightContactIdsRef.current.has(contact.clientId)) {
          continue
        }

        if (!contact.id) {
          operations.push(
            (async () => {
              inFlightContactIdsRef.current.add(contact.clientId)
              beginSaving()

              try {
                const createdContact = await createContact({
                  type: contact.type.trim(),
                  value: contact.value.trim(),
                })

                savedContactsRef.current = [...savedContactsRef.current, createdContact]
                setContacts((currentContacts) =>
                  currentContacts.map((currentContact) =>
                    currentContact.clientId === contact.clientId
                      ? { ...currentContact, id: createdContact.id }
                      : currentContact
                  )
                )
                finishSaving("saved")
              } catch (error) {
                finishSaving(
                  "error",
                  error instanceof Error ? error.message : "We couldn’t add this contact."
                )
              } finally {
                inFlightContactIdsRef.current.delete(contact.clientId)
              }
            })()
          )

          continue
        }

        const savedContact = savedContactsById.get(contact.id)

        if (
          savedContact &&
          savedContact.type === contact.type &&
          savedContact.value === contact.value
        ) {
          continue
        }

        operations.push(
          (async () => {
            inFlightContactIdsRef.current.add(contact.clientId)
            beginSaving()

            try {
              const updatedContact = await updateContact(contact.id!, {
                type: contact.type.trim(),
                value: contact.value.trim(),
              })

              savedContactsRef.current = savedContactsRef.current.map((currentContact) =>
                currentContact.id === updatedContact.id ? updatedContact : currentContact
              )
              finishSaving("saved")
            } catch (error) {
              finishSaving(
                "error",
                error instanceof Error ? error.message : "We couldn’t update this contact."
              )
            } finally {
              inFlightContactIdsRef.current.delete(contact.clientId)
            }
          })()
        )
      }

      setContactErrors(nextErrors)

      if (!operations.length) {
        return
      }

      await Promise.all(operations)
    },
    [beginSaving, finishSaving]
  )

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }

    if (personalSaveTimerRef.current) {
      clearTimeout(personalSaveTimerRef.current)
    }

    personalSaveTimerRef.current = setTimeout(() => {
      void syncPersonal(personal)
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (personalSaveTimerRef.current) {
        clearTimeout(personalSaveTimerRef.current)
      }
    }
  }, [personal, syncPersonal])

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }

    if (contactSaveTimerRef.current) {
      clearTimeout(contactSaveTimerRef.current)
    }

    contactSaveTimerRef.current = setTimeout(() => {
      void syncContacts(contacts)
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (contactSaveTimerRef.current) {
        clearTimeout(contactSaveTimerRef.current)
      }
    }
  }, [contacts, syncContacts])

  const handlePersonalChange = useCallback(
    (field: keyof PersonalData, nextValue: string) => {
      setPersonal((currentPersonal) => ({
        ...currentPersonal,
        [field]: nextValue,
      }))

      if (field === "full_name" && personalErrors.full_name) {
        setPersonalErrors((currentErrors) => ({
          ...currentErrors,
          full_name: undefined,
        }))
      }
    },
    [personalErrors.full_name]
  )

  const handleAddContact = useCallback(() => {
    setContacts((currentContacts) => [...currentContacts, buildBlankContact()])
  }, [])

  const handleContactChange = useCallback(
    (clientId: string, field: "type" | "value", nextValue: string) => {
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.clientId === clientId ? { ...contact, [field]: nextValue } : contact
        )
      )

      setContactErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }

        if (!nextErrors[clientId]) {
          return currentErrors
        }

        nextErrors[clientId] = {
          ...nextErrors[clientId],
          [field]: undefined,
        }

        return nextErrors
      })
    },
    []
  )

  const handleRemoveContact = useCallback(
    async (contactToRemove: ContactDraft) => {
      const previousContacts = contacts
      const nextContacts = contacts.filter((contact) => contact.clientId !== contactToRemove.clientId)

      setContacts(nextContacts)
      setContactErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }
        delete nextErrors[contactToRemove.clientId]
        return nextErrors
      })

      if (!contactToRemove.id) {
        return
      }

      beginSaving()

      try {
        await deleteContact(contactToRemove.id)
        savedContactsRef.current = savedContactsRef.current.filter(
          (contact) => contact.id !== contactToRemove.id
        )
        finishSaving("saved")
      } catch (error) {
        setContacts(previousContacts)
        finishSaving(
          "error",
          error instanceof Error ? error.message : "We couldn’t remove this contact."
        )
      }
    },
    [beginSaving, contacts, finishSaving]
  )

  const handleDiscard = useCallback(() => {
    setPersonal(savedPersonalRef.current)
    setContacts(savedContactsRef.current.map(toContactDraft))
    setPersonalErrors({})
    setContactErrors({})
    setSaveState(lastSavedAt ? "saved" : "idle")
    setSaveError(null)
  }, [lastSavedAt])

  const handleSaveNow = useCallback(async () => {
    if (personalSaveTimerRef.current) {
      clearTimeout(personalSaveTimerRef.current)
    }

    if (contactSaveTimerRef.current) {
      clearTimeout(contactSaveTimerRef.current)
    }

    await Promise.all([syncPersonal(personal), syncContacts(contacts)])
  }, [contacts, personal, syncContacts, syncPersonal])

  const topAlert = useMemo(() => {
    if (loadError) {
      return {
        title: "We couldn’t load your information.",
        description: loadError,
      }
    }

    if (saveState === "error" && saveError) {
      return {
        title: "We couldn’t save one or more changes.",
        description: saveError,
      }
    }

    return null
  }, [loadError, saveError, saveState])

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center justify-center px-6 py-12 md:px-8">
        <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
          <Spinner className="size-5" />
          <span>Loading your personal details…</span>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:px-8">
      <div className="space-y-16">
        {topAlert ? (
          <Alert
            variant="destructive"
            className="rounded-sm border-outline-variant/60 px-4 py-3"
          >
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4" />
            <AlertTitle>{topAlert.title}</AlertTitle>
            <AlertDescription>{topAlert.description}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-16" onSubmit={(event) => event.preventDefault()}>
          <FormSection title="Basic Information" step="Step 01">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase">
                  Full Name
                </FieldLabel>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={personal.full_name}
                  onChange={(event) => handlePersonalChange("full_name", event.target.value)}
                  aria-invalid={Boolean(personalErrors.full_name)}
                  className="h-12 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"
                />
                <FieldError>{personalErrors.full_name}</FieldError>
              </div>

              <div className="space-y-2">
                <FieldLabel className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase">
                  Professional Title
                </FieldLabel>
                <Input
                  id="professional-title"
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={personal.title}
                  onChange={(event) => handlePersonalChange("title", event.target.value)}
                  className="h-12 rounded-sm border-outline-variant/50 bg-primary-soft px-4 text-sm font-medium text-on-surface focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase">
                Summary
              </FieldLabel>
              <Textarea
                id="summary"
                rows={5}
                placeholder="Briefly describe your career goals and key achievements…"
                value={personal.summary}
                onChange={(event) => handlePersonalChange("summary", event.target.value)}
                className="min-h-36 rounded-sm border-outline-variant/50 bg-surface-subtle px-4 py-3 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>
          </FormSection>

          <FormSection title="Contact Information" step="Step 02">
            <ContactListEditor
              contacts={contacts}
              errors={contactErrors}
              onAdd={handleAddContact}
              onRemove={(contact) => void handleRemoveContact(contact)}
              onChange={handleContactChange}
            />
          </FormSection>

          <div className="flex flex-col gap-4 border-t border-outline-variant/60 pt-8 md:flex-row md:items-center md:justify-between">
            <SaveIndicator
              status={saveState}
              lastSavedAt={lastSavedAt}
              errorMessage={saveError}
            />
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="h-11 rounded-sm px-6 text-sm font-bold"
              >
                Discard
              </Button>
              <Button
                onClick={() => void handleSaveNow()}
                className="h-11 rounded-sm px-6 text-sm font-bold"
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
