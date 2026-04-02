import { create } from "zustand"

import {
  createContact,
  createEducation,
  createExperience,
  createProject,
  createSkill,
  deleteContact,
  deleteEducation,
  deleteExperience,
  deleteProject,
  deleteSkill,
  fetchCareerWorkspace,
  updateContact,
  updateEducation,
  updateExperience,
  updatePersonal,
  updateProject,
  updateSkill,
} from "@/lib/career-data/api"
import {
  buildBlankContact,
  buildBlankEducation,
  buildBlankExperience,
  buildBlankProject,
  buildBlankSkill,
  toContactDraft,
  toContactPayload,
  toEducationDraft,
  toEducationPayload,
  toExperienceDraft,
  toExperiencePayload,
  toProjectDraft,
  toProjectPayload,
  toSkillDraft,
  toSkillPayload,
  type ContactDraft,
  type EducationDraft,
  type ExperienceDraft,
  type ProjectDraft,
  type SkillDraft,
} from "@/lib/career-data/drafts"
import {
  emptyPersonalData,
  type ContactData,
  type ContactPayload,
  type EducationData,
  type EducationPayload,
  type ExperienceData,
  type ExperiencePayload,
  type PersonalData,
  type ProjectData,
  type ProjectPayload,
  type SectionKey,
  type SkillData,
  type SkillPayload,
  type SectionMeta,
} from "@/lib/career-data/types"
import {
  hasValidationError,
  isBlankContact,
  isBlankEducation,
  isBlankExperience,
  isBlankProject,
  isBlankSkill,
  validateContact,
  validateEducation,
  validateExperience,
  validatePersonal,
  validateProject,
  validateSkill,
  type ContactErrorState,
  type DraftErrorMap,
  type EducationErrorState,
  type ExperienceErrorState,
  type PersonalErrors,
  type ProjectErrorState,
  type SkillErrorState,
} from "@/lib/career-data/validation"

type DraftWithIdentity = {
  clientId: string
  id: string | null
}

type SavedWorkspaceState = {
  personal: PersonalData
  contacts: ContactData[]
  experiences: ExperienceData[]
  projects: ProjectData[]
  education: EducationData[]
  skills: SkillData[]
}

type ListSectionMeta = Record<SectionKey, SectionMeta>

type SyncOperation<Payload> =
  | {
      type: "create"
      clientId: string
      payload: Payload
    }
  | {
      type: "update"
      id: string
      payload: Payload
    }

type SyncListSectionParams<
  Draft extends DraftWithIdentity,
  SavedItem extends { id: string },
  Payload,
  ErrorState extends Record<string, string | undefined>,
> = {
  drafts: Draft[]
  savedItems: SavedItem[]
  validate: (draft: Draft) => ErrorState
  isBlank: (draft: Draft) => boolean
  toPayload: (draft: Draft) => Payload
  isEqual: (savedItem: SavedItem, payload: Payload) => boolean
  createItem: (payload: Payload) => Promise<SavedItem>
  updateItem: (id: string, payload: Payload) => Promise<SavedItem>
  setErrors: (errors: DraftErrorMap<ErrorState>) => void
  onCreate: (clientId: string, createdItem: SavedItem) => void
  onUpdate: (updatedItem: SavedItem) => void
  startSaving: () => void
  finishSaving: () => void
  failSaving: (message: string) => void
  fallbackErrorMessage: string
}

type CareerDataStore = {
  isLoading: boolean
  loadError: string | null
  expandedSections: SectionKey[]
  personal: PersonalData
  contacts: ContactDraft[]
  experiences: ExperienceDraft[]
  projects: ProjectDraft[]
  education: EducationDraft[]
  skills: SkillDraft[]
  saved: SavedWorkspaceState
  sectionMeta: ListSectionMeta
  personalErrors: PersonalErrors
  contactErrors: DraftErrorMap<ContactErrorState>
  experienceErrors: DraftErrorMap<ExperienceErrorState>
  projectErrors: DraftErrorMap<ProjectErrorState>
  educationErrors: DraftErrorMap<EducationErrorState>
  skillErrors: DraftErrorMap<SkillErrorState>
  hydrate: () => Promise<void>
  openSection: (section: SectionKey) => void
  toggleSection: (section: SectionKey) => void
  expandAllSections: () => void
  collapseAllSections: () => void
  updatePersonalField: (field: keyof PersonalData, value: string) => void
  addContact: () => void
  updateContactField: (clientId: string, field: keyof ContactDraft, value: string) => void
  removeContact: (clientId: string) => Promise<void>
  addExperience: () => void
  updateExperienceField: (clientId: string, field: keyof ExperienceDraft, value: string) => void
  removeExperience: (clientId: string) => Promise<void>
  addProject: () => void
  updateProjectField: (clientId: string, field: keyof ProjectDraft, value: string) => void
  removeProject: (clientId: string) => Promise<void>
  addEducation: () => void
  updateEducationField: (clientId: string, field: keyof EducationDraft, value: string) => void
  removeEducation: (clientId: string) => Promise<void>
  addSkill: () => void
  updateSkillField: (clientId: string, field: keyof SkillDraft, value: string) => void
  removeSkill: (clientId: string) => Promise<void>
  savePersonal: () => Promise<void>
  saveContacts: () => Promise<void>
  saveExperiences: () => Promise<void>
  saveProjects: () => Promise<void>
  saveEducation: () => Promise<void>
  saveSkills: () => Promise<void>
  saveAllSections: () => Promise<void>
}

const allSections: SectionKey[] = [
  "personal",
  "contacts",
  "experiences",
  "projects",
  "education",
  "skills",
]

const defaultExpandedSections: SectionKey[] = ["personal"]

function createSectionMeta(): ListSectionMeta {
  return {
    personal: { status: "idle", lastSavedAt: null, errorMessage: null },
    contacts: { status: "idle", lastSavedAt: null, errorMessage: null },
    experiences: { status: "idle", lastSavedAt: null, errorMessage: null },
    projects: { status: "idle", lastSavedAt: null, errorMessage: null },
    education: { status: "idle", lastSavedAt: null, errorMessage: null },
    skills: { status: "idle", lastSavedAt: null, errorMessage: null },
  }
}

function createEmptySavedState(): SavedWorkspaceState {
  return {
    personal: { ...emptyPersonalData },
    contacts: [],
    experiences: [],
    projects: [],
    education: [],
    skills: [],
  }
}

function buildExpandedSections(saved: SavedWorkspaceState): SectionKey[] {
  if (!saved.personal.full_name || !saved.personal.title || !saved.personal.summary) {
    return ["personal"]
  }

  if (!saved.contacts.length) {
    return ["contacts"]
  }

  if (!saved.experiences.length) {
    return ["experiences"]
  }

  if (!saved.projects.length) {
    return ["projects"]
  }

  if (!saved.education.length) {
    return ["education"]
  }

  if (!saved.skills.length) {
    return ["skills"]
  }

  return [...defaultExpandedSections]
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

function isPersonalEqual(left: PersonalData, right: PersonalData) {
  return (
    left.full_name === right.full_name &&
    left.title === right.title &&
    left.summary === right.summary
  )
}

function isContactEqual(saved: ContactData, payload: ContactPayload) {
  return saved.type === payload.type && saved.value === payload.value
}

function isExperienceEqual(saved: ExperienceData, payload: ExperiencePayload) {
  return JSON.stringify({ ...saved, id: undefined }) === JSON.stringify({ ...payload, id: undefined })
}

function isProjectEqual(saved: ProjectData, payload: ProjectPayload) {
  return JSON.stringify({ ...saved, id: undefined }) === JSON.stringify({ ...payload, id: undefined })
}

function isEducationEqual(saved: EducationData, payload: EducationPayload) {
  return JSON.stringify({ ...saved, id: undefined }) === JSON.stringify({ ...payload, id: undefined })
}

function isSkillEqual(saved: SkillData, payload: SkillPayload) {
  return JSON.stringify({ ...saved, id: undefined }) === JSON.stringify({ ...payload, id: undefined })
}

async function syncListSection<
  Draft extends DraftWithIdentity,
  SavedItem extends { id: string },
  Payload,
  ErrorState extends Record<string, string | undefined>,
>({
  drafts,
  savedItems,
  validate,
  isBlank,
  toPayload,
  isEqual,
  createItem,
  updateItem,
  setErrors,
  onCreate,
  onUpdate,
  startSaving,
  finishSaving,
  failSaving,
  fallbackErrorMessage,
}: SyncListSectionParams<Draft, SavedItem, Payload, ErrorState>) {
  const errors = {} as DraftErrorMap<ErrorState>
  const operations: Array<SyncOperation<Payload>> = []
  const savedItemsById = new Map(savedItems.map((item) => [item.id, item]))

  for (const draft of drafts) {
    const nextErrors = validate(draft)

    if (hasValidationError(nextErrors)) {
      errors[draft.clientId] = nextErrors
      continue
    }

    if (isBlank(draft)) {
      continue
    }

    const payload = toPayload(draft)

    if (!draft.id) {
      operations.push({
        type: "create",
        clientId: draft.clientId,
        payload,
      })
      continue
    }

    const savedItem = savedItemsById.get(draft.id)

    if (savedItem && isEqual(savedItem, payload)) {
      continue
    }

    operations.push({
      type: "update",
      id: draft.id,
      payload,
    })
  }

  setErrors(errors)

  if (!operations.length) {
    return
  }

  startSaving()

  try {
    for (const operation of operations) {
      if (operation.type === "create") {
        const createdItem = await createItem(operation.payload)
        onCreate(operation.clientId, createdItem)
        continue
      }

      const updatedItem = await updateItem(operation.id, operation.payload)
      onUpdate(updatedItem)
    }

    finishSaving()
  } catch (error) {
    failSaving(getErrorMessage(error, fallbackErrorMessage))
  }
}

export const useCareerDataStore = create<CareerDataStore>((set, get) => {
  const setSectionSaving = (section: SectionKey) => {
    set((state) => ({
      sectionMeta: {
        ...state.sectionMeta,
        [section]: {
          ...state.sectionMeta[section],
          status: "saving",
          errorMessage: null,
        },
      },
    }))
  }

  const setSectionSaved = (section: SectionKey) => {
    set((state) => ({
      sectionMeta: {
        ...state.sectionMeta,
        [section]: {
          ...state.sectionMeta[section],
          status: "saved",
          lastSavedAt: Date.now(),
          errorMessage: null,
        },
      },
    }))
  }

  const setSectionError = (section: SectionKey, message: string) => {
    set((state) => ({
      sectionMeta: {
        ...state.sectionMeta,
        [section]: {
          ...state.sectionMeta[section],
          status: "error",
          errorMessage: message,
        },
      },
    }))
  }

  const clearSectionError = (section: SectionKey) => {
    set((state) => ({
      sectionMeta: {
        ...state.sectionMeta,
        [section]: {
          ...state.sectionMeta[section],
          errorMessage: null,
          status:
            state.sectionMeta[section].status === "error"
              ? "idle"
              : state.sectionMeta[section].status,
        },
      },
    }))
  }

  const removeDraftError = <ErrorState,>(
    errors: DraftErrorMap<ErrorState>,
    clientId: string
  ) => {
    if (!(clientId in errors)) {
      return errors
    }

    const nextErrors = { ...errors }
    delete nextErrors[clientId]
    return nextErrors
  }

  return {
    isLoading: true,
    loadError: null,
    expandedSections: [...defaultExpandedSections],
    personal: { ...emptyPersonalData },
    contacts: [],
    experiences: [],
    projects: [],
    education: [],
    skills: [],
    saved: createEmptySavedState(),
    sectionMeta: createSectionMeta(),
    personalErrors: {},
    contactErrors: {},
    experienceErrors: {},
    projectErrors: {},
    educationErrors: {},
    skillErrors: {},

    async hydrate() {
      set({ isLoading: true, loadError: null })

      try {
        const workspace = await fetchCareerWorkspace()
        const savedState: SavedWorkspaceState = {
          personal: workspace.personal,
          contacts: workspace.contacts,
          experiences: workspace.experiences,
          projects: workspace.projects,
          education: workspace.education,
          skills: workspace.skills,
        }

        set({
          isLoading: false,
          loadError: null,
          personal: workspace.personal,
          contacts: workspace.contacts.map(toContactDraft),
          experiences: workspace.experiences.map(toExperienceDraft),
          projects: workspace.projects.map(toProjectDraft),
          education: workspace.education.map(toEducationDraft),
          skills: workspace.skills.map(toSkillDraft),
          saved: savedState,
          sectionMeta: createSectionMeta(),
          personalErrors: {},
          contactErrors: {},
          experienceErrors: {},
          projectErrors: {},
          educationErrors: {},
          skillErrors: {},
          expandedSections: buildExpandedSections(savedState),
        })
      } catch (error) {
        set({
          isLoading: false,
          loadError: getErrorMessage(error, "We couldn’t load your career data."),
        })
      }
    },

    openSection(section) {
      set({ expandedSections: [section] })
    },

    toggleSection(section) {
      set((state) => ({
        expandedSections:
          state.expandedSections.length === 1 && state.expandedSections[0] === section
            ? []
            : [section],
      }))
    },

    expandAllSections() {
      set({ expandedSections: [...allSections] })
    },

    collapseAllSections() {
      set({ expandedSections: [] })
    },

    updatePersonalField(field, value) {
      clearSectionError("personal")
      set((state) => ({
        personal: {
          ...state.personal,
          [field]: value,
        },
        personalErrors:
          field === "full_name"
            ? {
                ...state.personalErrors,
                full_name: undefined,
              }
            : state.personalErrors,
      }))
    },

    addContact() {
      clearSectionError("contacts")
      set((state) => ({
        contacts: [...state.contacts, buildBlankContact()],
      }))
    },

    updateContactField(clientId, field, value) {
      clearSectionError("contacts")
      set((state) => ({
        contacts: state.contacts.map((contact) =>
          contact.clientId === clientId ? { ...contact, [field]: value } : contact
        ),
        contactErrors: removeDraftError(state.contactErrors, clientId),
      }))
    },

    async removeContact(clientId) {
      const currentState = get()
      const contactToRemove = currentState.contacts.find((contact) => contact.clientId === clientId)

      if (!contactToRemove) {
        return
      }

      const previousContacts = currentState.contacts
      const previousErrors = currentState.contactErrors

      clearSectionError("contacts")
      set((state) => ({
        contacts: state.contacts.filter((contact) => contact.clientId !== clientId),
        contactErrors: removeDraftError(state.contactErrors, clientId),
      }))

      if (!contactToRemove.id) {
        return
      }

      setSectionSaving("contacts")

      try {
        await deleteContact(contactToRemove.id)
        set((state) => ({
          saved: {
            ...state.saved,
            contacts: state.saved.contacts.filter((contact) => contact.id !== contactToRemove.id),
          },
        }))
        setSectionSaved("contacts")
      } catch (error) {
        set({ contacts: previousContacts, contactErrors: previousErrors })
        setSectionError("contacts", getErrorMessage(error, "We couldn’t remove this contact."))
      }
    },

    addExperience() {
      clearSectionError("experiences")
      set((state) => ({
        experiences: [...state.experiences, buildBlankExperience()],
      }))
    },

    updateExperienceField(clientId, field, value) {
      clearSectionError("experiences")
      set((state) => ({
        experiences: state.experiences.map((experience) =>
          experience.clientId === clientId ? { ...experience, [field]: value } : experience
        ),
        experienceErrors: removeDraftError(state.experienceErrors, clientId),
      }))
    },

    async removeExperience(clientId) {
      const currentState = get()
      const experienceToRemove = currentState.experiences.find(
        (experience) => experience.clientId === clientId
      )

      if (!experienceToRemove) {
        return
      }

      const previousExperiences = currentState.experiences
      const previousErrors = currentState.experienceErrors

      clearSectionError("experiences")
      set((state) => ({
        experiences: state.experiences.filter((experience) => experience.clientId !== clientId),
        experienceErrors: removeDraftError(state.experienceErrors, clientId),
      }))

      if (!experienceToRemove.id) {
        return
      }

      setSectionSaving("experiences")

      try {
        await deleteExperience(experienceToRemove.id)
        set((state) => ({
          saved: {
            ...state.saved,
            experiences: state.saved.experiences.filter(
              (experience) => experience.id !== experienceToRemove.id
            ),
          },
        }))
        setSectionSaved("experiences")
      } catch (error) {
        set({ experiences: previousExperiences, experienceErrors: previousErrors })
        setSectionError(
          "experiences",
          getErrorMessage(error, "We couldn’t remove this experience.")
        )
      }
    },

    addProject() {
      clearSectionError("projects")
      set((state) => ({
        projects: [...state.projects, buildBlankProject()],
      }))
    },

    updateProjectField(clientId, field, value) {
      clearSectionError("projects")
      set((state) => ({
        projects: state.projects.map((project) =>
          project.clientId === clientId ? { ...project, [field]: value } : project
        ),
        projectErrors: removeDraftError(state.projectErrors, clientId),
      }))
    },

    async removeProject(clientId) {
      const currentState = get()
      const projectToRemove = currentState.projects.find((project) => project.clientId === clientId)

      if (!projectToRemove) {
        return
      }

      const previousProjects = currentState.projects
      const previousErrors = currentState.projectErrors

      clearSectionError("projects")
      set((state) => ({
        projects: state.projects.filter((project) => project.clientId !== clientId),
        projectErrors: removeDraftError(state.projectErrors, clientId),
      }))

      if (!projectToRemove.id) {
        return
      }

      setSectionSaving("projects")

      try {
        await deleteProject(projectToRemove.id)
        set((state) => ({
          saved: {
            ...state.saved,
            projects: state.saved.projects.filter((project) => project.id !== projectToRemove.id),
          },
        }))
        setSectionSaved("projects")
      } catch (error) {
        set({ projects: previousProjects, projectErrors: previousErrors })
        setSectionError("projects", getErrorMessage(error, "We couldn’t remove this project."))
      }
    },

    addEducation() {
      clearSectionError("education")
      set((state) => ({
        education: [...state.education, buildBlankEducation()],
      }))
    },

    updateEducationField(clientId, field, value) {
      clearSectionError("education")
      set((state) => ({
        education: state.education.map((education) =>
          education.clientId === clientId ? { ...education, [field]: value } : education
        ),
        educationErrors: removeDraftError(state.educationErrors, clientId),
      }))
    },

    async removeEducation(clientId) {
      const currentState = get()
      const educationToRemove = currentState.education.find(
        (education) => education.clientId === clientId
      )

      if (!educationToRemove) {
        return
      }

      const previousEducation = currentState.education
      const previousErrors = currentState.educationErrors

      clearSectionError("education")
      set((state) => ({
        education: state.education.filter((education) => education.clientId !== clientId),
        educationErrors: removeDraftError(state.educationErrors, clientId),
      }))

      if (!educationToRemove.id) {
        return
      }

      setSectionSaving("education")

      try {
        await deleteEducation(educationToRemove.id)
        set((state) => ({
          saved: {
            ...state.saved,
            education: state.saved.education.filter(
              (education) => education.id !== educationToRemove.id
            ),
          },
        }))
        setSectionSaved("education")
      } catch (error) {
        set({ education: previousEducation, educationErrors: previousErrors })
        setSectionError(
          "education",
          getErrorMessage(error, "We couldn’t remove this education entry.")
        )
      }
    },

    addSkill() {
      clearSectionError("skills")
      set((state) => ({
        skills: [...state.skills, buildBlankSkill()],
      }))
    },

    updateSkillField(clientId, field, value) {
      clearSectionError("skills")
      set((state) => ({
        skills: state.skills.map((skill) =>
          skill.clientId === clientId ? { ...skill, [field]: value } : skill
        ),
        skillErrors: removeDraftError(state.skillErrors, clientId),
      }))
    },

    async removeSkill(clientId) {
      const currentState = get()
      const skillToRemove = currentState.skills.find((skill) => skill.clientId === clientId)

      if (!skillToRemove) {
        return
      }

      const previousSkills = currentState.skills
      const previousErrors = currentState.skillErrors

      clearSectionError("skills")
      set((state) => ({
        skills: state.skills.filter((skill) => skill.clientId !== clientId),
        skillErrors: removeDraftError(state.skillErrors, clientId),
      }))

      if (!skillToRemove.id) {
        return
      }

      setSectionSaving("skills")

      try {
        await deleteSkill(skillToRemove.id)
        set((state) => ({
          saved: {
            ...state.saved,
            skills: state.saved.skills.filter((skill) => skill.id !== skillToRemove.id),
          },
        }))
        setSectionSaved("skills")
      } catch (error) {
        set({ skills: previousSkills, skillErrors: previousErrors })
        setSectionError("skills", getErrorMessage(error, "We couldn’t remove this skill."))
      }
    },

    async savePersonal() {
      const state = get()
      const personalErrors = validatePersonal(state.personal)
      set({ personalErrors })

      if (personalErrors.full_name || isPersonalEqual(state.personal, state.saved.personal)) {
        return
      }

      setSectionSaving("personal")

      try {
        const savedPersonal = await updatePersonal(state.personal)
        set((currentState) => ({
          personal: savedPersonal,
          saved: {
            ...currentState.saved,
            personal: savedPersonal,
          },
          personalErrors: {},
        }))
        setSectionSaved("personal")
      } catch (error) {
        setSectionError(
          "personal",
          getErrorMessage(error, "We couldn’t save your personal details.")
        )
      }
    },

    async saveContacts() {
      const state = get()

      await syncListSection({
        drafts: state.contacts,
        savedItems: state.saved.contacts,
        validate: validateContact,
        isBlank: isBlankContact,
        toPayload: toContactPayload,
        isEqual: isContactEqual,
        createItem: createContact,
        updateItem: updateContact,
        setErrors: (contactErrors) => set({ contactErrors }),
        onCreate: (clientId, createdContact) => {
          set((currentState) => ({
            contacts: currentState.contacts.map((contact) =>
              contact.clientId === clientId ? { ...contact, id: createdContact.id } : contact
            ),
            saved: {
              ...currentState.saved,
              contacts: [...currentState.saved.contacts, createdContact],
            },
          }))
        },
        onUpdate: (updatedContact) => {
          set((currentState) => ({
            saved: {
              ...currentState.saved,
              contacts: currentState.saved.contacts.map((contact) =>
                contact.id === updatedContact.id ? updatedContact : contact
              ),
            },
          }))
        },
        startSaving: () => setSectionSaving("contacts"),
        finishSaving: () => setSectionSaved("contacts"),
        failSaving: (message) => setSectionError("contacts", message),
        fallbackErrorMessage: "We couldn’t save your contacts.",
      })
    },

    async saveExperiences() {
      const state = get()

      await syncListSection({
        drafts: state.experiences,
        savedItems: state.saved.experiences,
        validate: validateExperience,
        isBlank: isBlankExperience,
        toPayload: toExperiencePayload,
        isEqual: isExperienceEqual,
        createItem: createExperience,
        updateItem: updateExperience,
        setErrors: (experienceErrors) => set({ experienceErrors }),
        onCreate: (clientId, createdExperience) => {
          set((currentState) => ({
            experiences: currentState.experiences.map((experience) =>
              experience.clientId === clientId ? { ...experience, id: createdExperience.id } : experience
            ),
            saved: {
              ...currentState.saved,
              experiences: [...currentState.saved.experiences, createdExperience],
            },
          }))
        },
        onUpdate: (updatedExperience) => {
          set((currentState) => ({
            saved: {
              ...currentState.saved,
              experiences: currentState.saved.experiences.map((experience) =>
                experience.id === updatedExperience.id ? updatedExperience : experience
              ),
            },
          }))
        },
        startSaving: () => setSectionSaving("experiences"),
        finishSaving: () => setSectionSaved("experiences"),
        failSaving: (message) => setSectionError("experiences", message),
        fallbackErrorMessage: "We couldn’t save your experience entries.",
      })
    },

    async saveProjects() {
      const state = get()

      await syncListSection({
        drafts: state.projects,
        savedItems: state.saved.projects,
        validate: validateProject,
        isBlank: isBlankProject,
        toPayload: toProjectPayload,
        isEqual: isProjectEqual,
        createItem: createProject,
        updateItem: updateProject,
        setErrors: (projectErrors) => set({ projectErrors }),
        onCreate: (clientId, createdProject) => {
          set((currentState) => ({
            projects: currentState.projects.map((project) =>
              project.clientId === clientId ? { ...project, id: createdProject.id } : project
            ),
            saved: {
              ...currentState.saved,
              projects: [...currentState.saved.projects, createdProject],
            },
          }))
        },
        onUpdate: (updatedProject) => {
          set((currentState) => ({
            saved: {
              ...currentState.saved,
              projects: currentState.saved.projects.map((project) =>
                project.id === updatedProject.id ? updatedProject : project
              ),
            },
          }))
        },
        startSaving: () => setSectionSaving("projects"),
        finishSaving: () => setSectionSaved("projects"),
        failSaving: (message) => setSectionError("projects", message),
        fallbackErrorMessage: "We couldn’t save your projects.",
      })
    },

    async saveEducation() {
      const state = get()

      await syncListSection({
        drafts: state.education,
        savedItems: state.saved.education,
        validate: validateEducation,
        isBlank: isBlankEducation,
        toPayload: toEducationPayload,
        isEqual: isEducationEqual,
        createItem: createEducation,
        updateItem: updateEducation,
        setErrors: (educationErrors) => set({ educationErrors }),
        onCreate: (clientId, createdEducation) => {
          set((currentState) => ({
            education: currentState.education.map((education) =>
              education.clientId === clientId ? { ...education, id: createdEducation.id } : education
            ),
            saved: {
              ...currentState.saved,
              education: [...currentState.saved.education, createdEducation],
            },
          }))
        },
        onUpdate: (updatedEducation) => {
          set((currentState) => ({
            saved: {
              ...currentState.saved,
              education: currentState.saved.education.map((education) =>
                education.id === updatedEducation.id ? updatedEducation : education
              ),
            },
          }))
        },
        startSaving: () => setSectionSaving("education"),
        finishSaving: () => setSectionSaved("education"),
        failSaving: (message) => setSectionError("education", message),
        fallbackErrorMessage: "We couldn’t save your education entries.",
      })
    },

    async saveSkills() {
      const state = get()

      await syncListSection({
        drafts: state.skills,
        savedItems: state.saved.skills,
        validate: validateSkill,
        isBlank: isBlankSkill,
        toPayload: toSkillPayload,
        isEqual: isSkillEqual,
        createItem: createSkill,
        updateItem: updateSkill,
        setErrors: (skillErrors) => set({ skillErrors }),
        onCreate: (clientId, createdSkill) => {
          set((currentState) => ({
            skills: currentState.skills.map((skill) =>
              skill.clientId === clientId ? { ...skill, id: createdSkill.id } : skill
            ),
            saved: {
              ...currentState.saved,
              skills: [...currentState.saved.skills, createdSkill],
            },
          }))
        },
        onUpdate: (updatedSkill) => {
          set((currentState) => ({
            saved: {
              ...currentState.saved,
              skills: currentState.saved.skills.map((skill) =>
                skill.id === updatedSkill.id ? updatedSkill : skill
              ),
            },
          }))
        },
        startSaving: () => setSectionSaving("skills"),
        finishSaving: () => setSectionSaved("skills"),
        failSaving: (message) => setSectionError("skills", message),
        fallbackErrorMessage: "We couldn’t save your skills.",
      })
    },

    async saveAllSections() {
      await get().savePersonal()
      await get().saveContacts()
      await get().saveExperiences()
      await get().saveProjects()
      await get().saveEducation()
      await get().saveSkills()
    },
  }
})
