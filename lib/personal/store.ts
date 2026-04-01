import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import {
  emptyPersonalData,
  type ContactData,
  type ContactPayload,
  type PersonalData,
} from "@/lib/personal/types"

type WorkspaceData = {
  personal: PersonalData
  contacts: ContactData[]
}

const dataDirectory = process.env.RESUMATRIX_DATA_DIR ?? path.join(tmpdir(), "resumatrix")
const dataFile = path.join(dataDirectory, "workspace.json")

function buildDefaultWorkspace(): WorkspaceData {
  return {
    personal: { ...emptyPersonalData },
    contacts: [],
  }
}

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true })
}

async function readWorkspace(): Promise<WorkspaceData> {
  try {
    const raw = await readFile(dataFile, "utf8")
    const parsed = JSON.parse(raw) as Partial<WorkspaceData>

    return {
      personal: {
        full_name:
          typeof parsed.personal?.full_name === "string" ? parsed.personal.full_name : "",
        title: typeof parsed.personal?.title === "string" ? parsed.personal.title : "",
        summary:
          typeof parsed.personal?.summary === "string" ? parsed.personal.summary : "",
      },
      contacts: Array.isArray(parsed.contacts)
        ? parsed.contacts
            .filter(
              (contact): contact is ContactData =>
                typeof contact?.id === "string" &&
                typeof contact?.type === "string" &&
                typeof contact?.value === "string"
            )
            .map((contact) => ({
              id: contact.id,
              type: contact.type,
              value: contact.value,
            }))
        : [],
    }
  } catch {
    return buildDefaultWorkspace()
  }
}

async function writeWorkspace(workspace: WorkspaceData) {
  await ensureDataDirectory()
  await writeFile(dataFile, JSON.stringify(workspace, null, 2), "utf8")
}

export async function getPersonalData() {
  const workspace = await readWorkspace()
  return workspace.personal
}

export async function updatePersonalData(personal: PersonalData) {
  const workspace = await readWorkspace()
  const nextWorkspace: WorkspaceData = {
    ...workspace,
    personal,
  }

  await writeWorkspace(nextWorkspace)

  return nextWorkspace.personal
}

export async function listContacts() {
  const workspace = await readWorkspace()
  return workspace.contacts
}

export async function createContactData(payload: ContactPayload) {
  const workspace = await readWorkspace()
  const nextContact: ContactData = {
    id: randomUUID(),
    ...payload,
  }

  const nextWorkspace: WorkspaceData = {
    ...workspace,
    contacts: [...workspace.contacts, nextContact],
  }

  await writeWorkspace(nextWorkspace)

  return nextContact
}

export async function updateContactData(id: string, payload: ContactPayload) {
  const workspace = await readWorkspace()
  const contactIndex = workspace.contacts.findIndex((contact) => contact.id === id)

  if (contactIndex === -1) {
    return null
  }

  const updatedContact: ContactData = {
    id,
    ...payload,
  }

  const nextContacts = [...workspace.contacts]
  nextContacts[contactIndex] = updatedContact

  const nextWorkspace: WorkspaceData = {
    ...workspace,
    contacts: nextContacts,
  }

  await writeWorkspace(nextWorkspace)

  return updatedContact
}

export async function deleteContactData(id: string) {
  const workspace = await readWorkspace()
  const removedContact = workspace.contacts.find((contact) => contact.id === id) ?? null

  if (!removedContact) {
    return null
  }

  const nextWorkspace: WorkspaceData = {
    ...workspace,
    contacts: workspace.contacts.filter((contact) => contact.id !== id),
  }

  await writeWorkspace(nextWorkspace)

  return removedContact
}
