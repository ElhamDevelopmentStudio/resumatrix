"use client"

import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { contactTypeOptions } from "@/lib/career-data/types"
import { isBlankContact } from "@/lib/career-data/validation"
import { useCareerDataStore } from "@/lib/career-data/workspace-store"

import {
  emptyStateClassName,
  fieldLabelClassName,
  selectClassName,
  textInputClassName,
} from "./career-form-styles"
import { CareerSectionCard } from "./career-section-card"
import { ItemCard } from "./item-card"
import { SectionAddButton } from "./section-add-button"

export function ContactsSection() {
  const contacts = useCareerDataStore((state) => state.contacts)
  const contactErrors = useCareerDataStore((state) => state.contactErrors)
  const expandedSections = useCareerDataStore((state) => state.expandedSections)
  const sectionMeta = useCareerDataStore((state) => state.sectionMeta.contacts)
  const addContact = useCareerDataStore((state) => state.addContact)
  const updateContactField = useCareerDataStore((state) => state.updateContactField)
  const removeContact = useCareerDataStore((state) => state.removeContact)
  const toggleSection = useCareerDataStore((state) => state.toggleSection)

  const isOpen = expandedSections.includes("contacts")
  const activeCount = contacts.filter((contact) => !isBlankContact(contact)).length
  const summary = activeCount ? `${activeCount} ${activeCount === 1 ? "entry" : "entries"}` : "No entries yet"

  return (
    <CareerSectionCard
      id="career-section-contacts"
      step="02"
      title="Contacts"
      description="Email, phone, portfolio, and professional links."
      summary={summary}
      meta={sectionMeta}
      isOpen={isOpen}
      onToggle={() => toggleSection("contacts")}
    >
      <DynamicList
        items={contacts}
        getKey={(contact) => contact.clientId}
        className="space-y-3"
        emptyState={
          <div className={emptyStateClassName}>
            Add the contact details recruiters should actually use.
          </div>
        }
        renderItem={(contact) => {
          const nextErrors = contactErrors[contact.clientId] ?? {}

          return (
            <ItemCard
              title={contact.type || "New contact"}
              subtitle={contact.value || "Choose a contact type and add the matching value."}
              onRemove={() => void removeContact(contact.clientId)}
              removeLabel={`Remove ${contact.type || "contact"}`}
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Type</FieldLabel>
                  <NativeSelect
                    value={contact.type}
                    onChange={(event) => updateContactField(contact.clientId, "type", event.target.value)}
                    aria-invalid={Boolean(nextErrors.type)}
                    className={selectClassName}
                  >
                    <NativeSelectOption value="">Select type</NativeSelectOption>
                    {contactTypeOptions.map((option) => (
                      <NativeSelectOption key={option} value={option}>
                        {option}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError>{nextErrors.type}</FieldError>
                </div>

                <div className="space-y-2">
                  <FieldLabel className={fieldLabelClassName}>Value</FieldLabel>
                  <Input
                    type="text"
                    value={contact.value}
                    onChange={(event) => updateContactField(contact.clientId, "value", event.target.value)}
                    aria-invalid={Boolean(nextErrors.value)}
                    placeholder="e.g. alex@example.com"
                    className={textInputClassName}
                  />
                  <FieldError>{nextErrors.value}</FieldError>
                </div>
              </div>
            </ItemCard>
          )
        }}
      />

      <SectionAddButton label="Add contact" onClick={addContact} />
    </CareerSectionCard>
  )
}
