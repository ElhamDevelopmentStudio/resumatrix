import { makeFunctionReference } from "convex/server"

import type {
  CareerWorkspaceData,
  ContactData,
  ContactPayload,
  EducationData,
  EducationPayload,
  ExperienceData,
  ExperiencePayload,
  PersonalData,
  ProjectData,
  ProjectPayload,
  SkillData,
  SkillPayload,
} from "@/lib/career-data/types"
import type { CvData, CvPayload } from "@/lib/cvs/types"
import type { ProfileData, ProfilePayload } from "@/lib/profiles/types"

type EmptyArgs = Record<string, never>

export const convexFunctionReferences = {
  careerData: {
    getWorkspace: makeFunctionReference<"query", EmptyArgs, CareerWorkspaceData>(
      "career_data:getWorkspace"
    ),
    getPersonal: makeFunctionReference<"query", EmptyArgs, PersonalData>("career_data:getPersonal"),
    setPersonal: makeFunctionReference<"mutation", PersonalData, PersonalData>("career_data:setPersonal"),
    listContacts: makeFunctionReference<"query", EmptyArgs, ContactData[]>("career_data:listContacts"),
    createContact: makeFunctionReference<"mutation", ContactData, ContactData>("career_data:createContact"),
    updateContact: makeFunctionReference<
      "mutation",
      { id: string; payload: ContactPayload },
      ContactData | null
    >("career_data:updateContact"),
    deleteContact: makeFunctionReference<"mutation", { id: string }, ContactData | null>(
      "career_data:deleteContact"
    ),
    listExperiences: makeFunctionReference<"query", EmptyArgs, ExperienceData[]>(
      "career_data:listExperiences"
    ),
    createExperience: makeFunctionReference<"mutation", ExperienceData, ExperienceData>(
      "career_data:createExperience"
    ),
    updateExperience: makeFunctionReference<
      "mutation",
      { id: string; payload: ExperiencePayload },
      ExperienceData | null
    >("career_data:updateExperience"),
    deleteExperience: makeFunctionReference<"mutation", { id: string }, ExperienceData | null>(
      "career_data:deleteExperience"
    ),
    listProjects: makeFunctionReference<"query", EmptyArgs, ProjectData[]>("career_data:listProjects"),
    createProject: makeFunctionReference<"mutation", ProjectData, ProjectData>(
      "career_data:createProject"
    ),
    updateProject: makeFunctionReference<
      "mutation",
      { id: string; payload: ProjectPayload },
      ProjectData | null
    >("career_data:updateProject"),
    deleteProject: makeFunctionReference<"mutation", { id: string }, ProjectData | null>(
      "career_data:deleteProject"
    ),
    listEducation: makeFunctionReference<"query", EmptyArgs, EducationData[]>(
      "career_data:listEducation"
    ),
    createEducation: makeFunctionReference<"mutation", EducationData, EducationData>(
      "career_data:createEducation"
    ),
    updateEducation: makeFunctionReference<
      "mutation",
      { id: string; payload: EducationPayload },
      EducationData | null
    >("career_data:updateEducation"),
    deleteEducation: makeFunctionReference<"mutation", { id: string }, EducationData | null>(
      "career_data:deleteEducation"
    ),
    listSkills: makeFunctionReference<"query", EmptyArgs, SkillData[]>("career_data:listSkills"),
    createSkill: makeFunctionReference<"mutation", SkillData, SkillData>("career_data:createSkill"),
    updateSkill: makeFunctionReference<
      "mutation",
      { id: string; payload: SkillPayload },
      SkillData | null
    >("career_data:updateSkill"),
    deleteSkill: makeFunctionReference<"mutation", { id: string }, SkillData | null>(
      "career_data:deleteSkill"
    ),
  },
  profiles: {
    list: makeFunctionReference<"query", EmptyArgs, ProfileData[]>("profiles:list"),
    get: makeFunctionReference<"query", { id: string }, ProfileData | null>("profiles:get"),
    create: makeFunctionReference<"mutation", ProfileData, ProfileData>("profiles:create"),
    update: makeFunctionReference<
      "mutation",
      { id: string; payload: ProfilePayload; updated_at: string },
      ProfileData | null
    >("profiles:update"),
    remove: makeFunctionReference<"mutation", { id: string }, ProfileData | null>("profiles:remove"),
  },
  cvs: {
    list: makeFunctionReference<"query", EmptyArgs, CvData[]>("cvs:list"),
    get: makeFunctionReference<"query", { id: string }, CvData | null>("cvs:get"),
    create: makeFunctionReference<"mutation", CvData, CvData>("cvs:create"),
    update: makeFunctionReference<
      "mutation",
      { id: string; payload: CvPayload; updated_at: string },
      CvData | null
    >("cvs:update"),
    remove: makeFunctionReference<"mutation", { id: string }, CvData | null>("cvs:remove"),
  },
}
