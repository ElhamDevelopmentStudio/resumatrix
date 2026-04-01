import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { DynamicList } from "@/components/ui/dynamic-list"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { contactTypeOptions } from "@/lib/personal/types"

export type ContactDraft = {
  clientId: string
  id: string | null
  type: string
  value: string
}

type ContactListEditorProps = {
  contacts: ContactDraft[]
  errors: Record<string, { type?: string; value?: string }>
  onAdd: () => void
  onRemove: (contact: ContactDraft) => void
  onChange: (clientId: string, field: "type" | "value", nextValue: string) => void
}

export function ContactListEditor({
  contacts,
  errors,
  onAdd,
  onRemove,
  onChange,
}: ContactListEditorProps) {
  return (
    <div>
      <DynamicList
        items={contacts}
        getKey={(contact) => contact.clientId}
        className="space-y-4"
        itemClassName="pb-4"
        getItemClassName={(_, index) =>
          index === contacts.length - 1 ? undefined : "border-b border-outline-variant/30"
        }
        emptyState={
          <p className="text-sm font-medium text-on-surface-variant/70">
            No contacts yet. Add one to help recruiters reach you.
          </p>
        }
        renderItem={(contact) => {
          const contactError = errors[contact.clientId] ?? {}

          return (
            <div className="grid gap-4 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] md:items-start">
              <div className="space-y-2">
                <FieldLabel className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase">
                  Type
                </FieldLabel>
                <NativeSelect
                  value={contact.type}
                  onChange={(event) => onChange(contact.clientId, "type", event.target.value)}
                  aria-invalid={Boolean(contactError.type)}
                  className="w-full"
                >
                  <NativeSelectOption value="">Select type</NativeSelectOption>
                  {contactTypeOptions.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {option}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError>{contactError.type}</FieldError>
              </div>

              <div className="space-y-2">
                <FieldLabel className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/55 uppercase">
                  Value
                </FieldLabel>
                <Input
                  type="text"
                  value={contact.value}
                  onChange={(event) => onChange(contact.clientId, "value", event.target.value)}
                  aria-invalid={Boolean(contactError.value)}
                  placeholder="Add the contact value"
                  className="h-12 w-full rounded-none border-outline-variant/50 bg-surface-subtle px-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus-visible:border-primary focus-visible:ring-primary/20"
                />
                <FieldError>{contactError.value}</FieldError>
              </div>

              <div className="pt-[1.625rem]">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemove(contact)}
                  aria-label="Remove contact"
                  className="size-12 rounded-none border-outline-variant/60 text-on-surface-variant hover:border-destructive hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-5" />
                </Button>
              </div>
            </div>
          )
        }}
      />

      <Button
        type="button"
        variant="ghost"
        onClick={onAdd}
        className="mt-6 h-auto rounded-none px-0 py-0 text-sm font-bold text-primary hover:bg-transparent hover:text-primary/80"
      >
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center bg-primary-soft text-primary">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          </span>
          <span>Add Contact</span>
        </span>
      </Button>
    </div>
  )
}
