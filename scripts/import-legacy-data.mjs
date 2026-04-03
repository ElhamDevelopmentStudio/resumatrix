import nextEnv from "@next/env"
import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"
import { constants as fsConstants } from "node:fs"
import { access, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const convexFunctions = {
  careerData: {
    getWorkspace: makeFunctionReference("career-data:getWorkspace"),
    setPersonal: makeFunctionReference("career-data:setPersonal"),
    createContact: makeFunctionReference("career-data:createContact"),
    deleteContact: makeFunctionReference("career-data:deleteContact"),
    createExperience: makeFunctionReference("career-data:createExperience"),
    deleteExperience: makeFunctionReference("career-data:deleteExperience"),
    createProject: makeFunctionReference("career-data:createProject"),
    deleteProject: makeFunctionReference("career-data:deleteProject"),
    createEducation: makeFunctionReference("career-data:createEducation"),
    deleteEducation: makeFunctionReference("career-data:deleteEducation"),
    createSkill: makeFunctionReference("career-data:createSkill"),
    deleteSkill: makeFunctionReference("career-data:deleteSkill"),
  },
  profiles: {
    list: makeFunctionReference("profiles:list"),
    create: makeFunctionReference("profiles:create"),
    remove: makeFunctionReference("profiles:remove"),
  },
  cvs: {
    list: makeFunctionReference("cvs:list"),
    create: makeFunctionReference("cvs:create"),
    remove: makeFunctionReference("cvs:remove"),
  },
}

function printHelp() {
  console.log(`
Import legacy local Resumatrix data into Convex.

Usage:
  npm run import:legacy-data
  npm run import:legacy-data -- --dry-run
  npm run import:legacy-data -- --replace
  npm run import:legacy-data -- --source-dir=/path/to/resumatrix

Options:
  --dry-run       Read the legacy files and print what would be imported.
  --replace       Clear existing Convex data before importing.
  --source-dir    Directory containing workspace.json, profiles.json, and cvs.json.
  --help          Show this help text.

Defaults:
  source dir = RESUMATRIX_DATA_DIR or ${path.join(tmpdir(), "resumatrix")}
  convex url = CONVEX_URL or NEXT_PUBLIC_CONVEX_URL
`.trim())
}

function parseArguments(argv) {
  const options = {
    dryRun: false,
    help: false,
    replace: false,
    sourceDir: null,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === "--dry-run") {
      options.dryRun = true
      continue
    }

    if (argument === "--replace") {
      options.replace = true
      continue
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true
      continue
    }

    if (argument === "--source-dir") {
      options.sourceDir = argv[index + 1] ?? null
      index += 1
      continue
    }

    if (argument.startsWith("--source-dir=")) {
      options.sourceDir = argument.slice("--source-dir=".length)
      continue
    }

    throw new Error(`Unknown argument: ${argument}`)
  }

  return options
}

function readText(value) {
  return typeof value === "string" ? value.trim() : ""
}

function readTextArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function buildDefaultWorkspace() {
  return {
    personal: {
      full_name: "",
      title: "",
      summary: "",
    },
    contacts: [],
    experiences: [],
    projects: [],
    education: [],
    skills: [],
  }
}

function sanitizePersonal(value) {
  if (!value || typeof value !== "object") {
    return buildDefaultWorkspace().personal
  }

  return {
    full_name: readText(value.full_name),
    title: readText(value.title),
    summary: readText(value.summary),
  }
}

function sanitizeContacts(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (contact) =>
        typeof contact?.id === "string" &&
        typeof contact?.type === "string" &&
        typeof contact?.value === "string"
    )
    .map((contact) => ({
      id: contact.id,
      type: readText(contact.type),
      value: readText(contact.value),
    }))
}

function sanitizeExperiences(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (experience) =>
        typeof experience?.id === "string" &&
        typeof experience?.company === "string" &&
        typeof experience?.role === "string"
    )
    .map((experience) => ({
      id: experience.id,
      company: readText(experience.company),
      role: readText(experience.role),
      start_date: readText(experience.start_date),
      end_date: readText(experience.end_date),
      location: readText(experience.location),
      bullets: readTextArray(experience.bullets),
      tags: readTextArray(experience.tags),
    }))
}

function sanitizeProjects(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((project) => typeof project?.id === "string" && typeof project?.name === "string")
    .map((project) => ({
      id: project.id,
      name: readText(project.name),
      description: readText(project.description),
      tech_stack: readTextArray(project.tech_stack),
      bullets: readTextArray(project.bullets),
      tags: readTextArray(project.tags),
    }))
}

function sanitizeEducation(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (education) =>
        typeof education?.id === "string" &&
        typeof education?.institution === "string" &&
        typeof education?.degree === "string"
    )
    .map((education) => ({
      id: education.id,
      institution: readText(education.institution),
      degree: readText(education.degree),
      start_date: readText(education.start_date),
      end_date: readText(education.end_date),
      details: readText(education.details),
    }))
}

function sanitizeSkills(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((skill) => typeof skill?.id === "string" && typeof skill?.name === "string")
    .map((skill) => ({
      id: skill.id,
      name: readText(skill.name),
      category: readText(skill.category),
      level: readText(skill.level),
    }))
}

function sanitizeWorkspace(value) {
  if (!value || typeof value !== "object") {
    return buildDefaultWorkspace()
  }

  return {
    personal: sanitizePersonal(value.personal),
    contacts: sanitizeContacts(value.contacts),
    experiences: sanitizeExperiences(value.experiences),
    projects: sanitizeProjects(value.projects),
    education: sanitizeEducation(value.education),
    skills: sanitizeSkills(value.skills),
  }
}

function sanitizeProfiles(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((profile) => typeof profile?.id === "string" && typeof profile?.name === "string")
    .map((profile) => ({
      id: profile.id,
      name: readText(profile.name),
      include_tags: readTextArray(profile.include_tags),
      exclude_tags: readTextArray(profile.exclude_tags),
      config:
        profile.config && typeof profile.config === "object" && !Array.isArray(profile.config)
          ? profile.config
          : {},
      created_at:
        typeof profile.created_at === "string" && profile.created_at.trim()
          ? profile.created_at
          : new Date().toISOString(),
      updated_at:
        typeof profile.updated_at === "string" && profile.updated_at.trim()
          ? profile.updated_at
          : new Date().toISOString(),
    }))
}

function sanitizeCvs(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (cv) =>
        typeof cv?.id === "string" &&
        typeof cv?.name === "string" &&
        typeof cv?.profile_id === "string" &&
        typeof cv?.template_id === "string"
    )
    .map((cv) => ({
      id: cv.id,
      name: readText(cv.name),
      profile_id: readText(cv.profile_id),
      template_id: readText(cv.template_id),
      overrides: cv.overrides && typeof cv.overrides === "object" && !Array.isArray(cv.overrides) ? cv.overrides : {},
      created_at:
        typeof cv.created_at === "string" && cv.created_at.trim()
          ? cv.created_at
          : new Date().toISOString(),
      updated_at:
        typeof cv.updated_at === "string" && cv.updated_at.trim()
          ? cv.updated_at
          : new Date().toISOString(),
    }))
}

async function fileExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK)
    return true
  } catch {
    return false
  }
}

async function readJsonIfExists(filePath) {
  if (!(await fileExists(filePath))) {
    return {
      exists: false,
      value: null,
    }
  }

  const raw = await readFile(filePath, "utf8")

  return {
    exists: true,
    value: JSON.parse(raw),
  }
}

async function loadLegacySnapshot(sourceDir) {
  const files = {
    workspace: path.join(sourceDir, "workspace.json"),
    profiles: path.join(sourceDir, "profiles.json"),
    cvs: path.join(sourceDir, "cvs.json"),
  }

  const [workspaceResult, profilesResult, cvsResult] = await Promise.all([
    readJsonIfExists(files.workspace),
    readJsonIfExists(files.profiles),
    readJsonIfExists(files.cvs),
  ])

  const foundFileCount = [workspaceResult, profilesResult, cvsResult].filter((result) => result.exists).length

  if (foundFileCount === 0) {
    throw new Error(
      `No legacy data files were found in ${sourceDir}. Expected workspace.json, profiles.json, or cvs.json.`
    )
  }

  return {
    files,
    fileStatus: {
      workspace: workspaceResult.exists,
      profiles: profilesResult.exists,
      cvs: cvsResult.exists,
    },
    workspace: sanitizeWorkspace(workspaceResult.value),
    profiles: sanitizeProfiles(profilesResult.value),
    cvs: sanitizeCvs(cvsResult.value),
  }
}

function printSnapshotSummary(snapshot, sourceDir) {
  console.log(`Source directory: ${sourceDir}`)
  console.log("Found files:")
  console.log(`- workspace.json: ${snapshot.fileStatus.workspace ? "yes" : "no"}`)
  console.log(`- profiles.json: ${snapshot.fileStatus.profiles ? "yes" : "no"}`)
  console.log(`- cvs.json: ${snapshot.fileStatus.cvs ? "yes" : "no"}`)
  console.log("Import summary:")
  console.log(`- personal fields present: ${Object.values(snapshot.workspace.personal).filter(Boolean).length}/3`)
  console.log(`- contacts: ${snapshot.workspace.contacts.length}`)
  console.log(`- experiences: ${snapshot.workspace.experiences.length}`)
  console.log(`- projects: ${snapshot.workspace.projects.length}`)
  console.log(`- education entries: ${snapshot.workspace.education.length}`)
  console.log(`- skills: ${snapshot.workspace.skills.length}`)
  console.log(`- profiles: ${snapshot.profiles.length}`)
  console.log(`- CVs: ${snapshot.cvs.length}`)
}

function getConvexUrl() {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL

  if (!url) {
    throw new Error(
      "Missing Convex URL. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL before running the importer."
    )
  }

  return url
}

function createConvexClient() {
  return new ConvexHttpClient(getConvexUrl(), { logger: false })
}

function hasExistingPersonalData(personal) {
  return Boolean(readText(personal?.full_name) || readText(personal?.title) || readText(personal?.summary))
}

async function getExistingConvexData(client) {
  const [workspace, profiles, cvs] = await Promise.all([
    client.query(convexFunctions.careerData.getWorkspace, {}),
    client.query(convexFunctions.profiles.list, {}),
    client.query(convexFunctions.cvs.list, {}),
  ])

  return {
    workspace,
    profiles,
    cvs,
  }
}

function hasExistingConvexContent(snapshot) {
  return (
    hasExistingPersonalData(snapshot.workspace.personal) ||
    snapshot.workspace.contacts.length > 0 ||
    snapshot.workspace.experiences.length > 0 ||
    snapshot.workspace.projects.length > 0 ||
    snapshot.workspace.education.length > 0 ||
    snapshot.workspace.skills.length > 0 ||
    snapshot.profiles.length > 0 ||
    snapshot.cvs.length > 0
  )
}

function printExistingConvexSummary(snapshot) {
  console.log("Current Convex data:")
  console.log(`- personal present: ${hasExistingPersonalData(snapshot.workspace.personal) ? "yes" : "no"}`)
  console.log(`- contacts: ${snapshot.workspace.contacts.length}`)
  console.log(`- experiences: ${snapshot.workspace.experiences.length}`)
  console.log(`- projects: ${snapshot.workspace.projects.length}`)
  console.log(`- education entries: ${snapshot.workspace.education.length}`)
  console.log(`- skills: ${snapshot.workspace.skills.length}`)
  console.log(`- profiles: ${snapshot.profiles.length}`)
  console.log(`- CVs: ${snapshot.cvs.length}`)
}

async function clearExistingConvexData(client, existingData) {
  for (const cv of existingData.cvs) {
    await client.mutation(convexFunctions.cvs.remove, { id: cv.id })
  }

  for (const profile of existingData.profiles) {
    await client.mutation(convexFunctions.profiles.remove, { id: profile.id })
  }

  for (const contact of existingData.workspace.contacts) {
    await client.mutation(convexFunctions.careerData.deleteContact, { id: contact.id })
  }

  for (const experience of existingData.workspace.experiences) {
    await client.mutation(convexFunctions.careerData.deleteExperience, { id: experience.id })
  }

  for (const project of existingData.workspace.projects) {
    await client.mutation(convexFunctions.careerData.deleteProject, { id: project.id })
  }

  for (const education of existingData.workspace.education) {
    await client.mutation(convexFunctions.careerData.deleteEducation, { id: education.id })
  }

  for (const skill of existingData.workspace.skills) {
    await client.mutation(convexFunctions.careerData.deleteSkill, { id: skill.id })
  }

  await client.mutation(convexFunctions.careerData.setPersonal, {
    full_name: "",
    title: "",
    summary: "",
  })
}

async function importSnapshot(client, snapshot) {
  await client.mutation(convexFunctions.careerData.setPersonal, snapshot.workspace.personal)

  for (const contact of snapshot.workspace.contacts) {
    await client.mutation(convexFunctions.careerData.createContact, contact)
  }

  for (const experience of snapshot.workspace.experiences) {
    await client.mutation(convexFunctions.careerData.createExperience, experience)
  }

  for (const project of snapshot.workspace.projects) {
    await client.mutation(convexFunctions.careerData.createProject, project)
  }

  for (const education of snapshot.workspace.education) {
    await client.mutation(convexFunctions.careerData.createEducation, education)
  }

  for (const skill of snapshot.workspace.skills) {
    await client.mutation(convexFunctions.careerData.createSkill, skill)
  }

  for (const profile of snapshot.profiles) {
    await client.mutation(convexFunctions.profiles.create, profile)
  }

  for (const cv of snapshot.cvs) {
    await client.mutation(convexFunctions.cvs.create, cv)
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))

  if (options.help) {
    printHelp()
    return
  }

  const sourceDir =
    options.sourceDir || process.env.RESUMATRIX_DATA_DIR || path.join(tmpdir(), "resumatrix")

  const snapshot = await loadLegacySnapshot(sourceDir)
  printSnapshotSummary(snapshot, sourceDir)

  if (options.dryRun) {
    console.log("Dry run complete. No Convex data was changed.")
    return
  }

  const client = createConvexClient()
  const existingData = await getExistingConvexData(client)

  if (hasExistingConvexContent(existingData)) {
    printExistingConvexSummary(existingData)

    if (!options.replace) {
      throw new Error(
        "Convex already has data. Re-run with --replace to clear Convex first, or use a fresh Convex deployment."
      )
    }

    console.log("Clearing existing Convex data...")
    await clearExistingConvexData(client, existingData)
  }

  console.log("Importing legacy data into Convex...")
  await importSnapshot(client, snapshot)
  console.log("Import complete.")
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Import failed: ${message}`)
  process.exitCode = 1
})
