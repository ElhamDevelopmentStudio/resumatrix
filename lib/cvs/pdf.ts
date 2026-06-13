import { constants } from "node:fs"
import { access } from "node:fs/promises"
import path from "node:path"
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

import type { CvRenderModel } from "@/lib/cvs/types"
import type { CvTemplateDefinition } from "@/lib/templates/types"

const windowsChromeCandidates = [
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe")
    : null,
  process.env.PROGRAMFILES
    ? path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe")
    : null,
  process.env["PROGRAMFILES(X86)"]
    ? path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe")
    : null,
]

const executablePathCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_BIN,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ...windowsChromeCandidates,
]
  .map((value) => value?.trim())
  .filter((value): value is string => Boolean(value))

const pdfDocumentHeadMarkup = `
<style>
  @page {
    size: A4;
    margin: 0;
  }

  html {
    background: #ffffff;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  p,
  li {
    orphans: 3;
    widows: 3;
  }

  .cv-header,
  .cv-item,
  .split-header-top-line,
  .split-header-hero,
  .split-header-entry,
  .editorial-sidebar-header,
  .editorial-sidebar-education-item,
  .editorial-sidebar-experience-item,
  .editorial-sidebar-project-item,
  .editorial-sidebar-skill-group,
  .teal-timeline-header,
  .teal-timeline-entry,
  .teal-timeline-education-row {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .cv-section-title,
  .split-header-section-title,
  .editorial-sidebar-section-title,
  .teal-timeline-section-title {
    break-after: avoid;
    page-break-after: avoid;
  }
</style>
`

function injectPdfDocumentHeadMarkup(markup: string) {
  if (!markup.includes("</head>")) {
    return markup
  }

  return markup.replace("</head>", `${pdfDocumentHeadMarkup}</head>`)
}

async function fileExists(pathname: string) {
  try {
    await access(pathname, constants.F_OK)
    return true
  } catch {
    return false
  }
}

type BrowserLaunchConfig = {
  args: string[]
  executablePath: string
  headless: true | "shell"
}

async function resolveLocalChromeExecutablePath() {
  for (const candidate of executablePathCandidates) {
    if (await fileExists(candidate)) {
      return candidate
    }
  }

  return null
}

function getLocalLaunchArgs() {
  const args = ["--disable-dev-shm-usage"]

  if (process.platform === "linux" && process.getuid?.() === 0) {
    args.push("--no-sandbox", "--disable-setuid-sandbox")
  }

  return args
}

async function resolveBrowserLaunchConfig(): Promise<BrowserLaunchConfig | null> {
  const localExecutablePath = await resolveLocalChromeExecutablePath()

  if (localExecutablePath) {
    return {
      args: getLocalLaunchArgs(),
      executablePath: localExecutablePath,
      headless: true,
    }
  }

  if (process.platform !== "linux") {
    return null
  }

  chromium.setGraphicsMode = false

  return {
    args: puppeteer.defaultArgs({
      args: chromium.args,
      headless: "shell",
    }),
    executablePath: await chromium.executablePath(),
    headless: "shell",
  }
}

export async function buildCvPdfExport(
  template: Pick<CvTemplateDefinition, "html_builder">,
  model: CvRenderModel
) {
  const launchConfig = await resolveBrowserLaunchConfig()

  if (!launchConfig) {
    throw new Error(
      "Chrome was not found for PDF export. Install Chrome or set PUPPETEER_EXECUTABLE_PATH."
    )
  }

  const browser = await puppeteer.launch({
    executablePath: launchConfig.executablePath,
    headless: launchConfig.headless,
    args: launchConfig.args,
  })

  try {
    const page = await browser.newPage()
    const html = injectPdfDocumentHeadMarkup(template.html_builder(model))

    await page.setViewport({ width: 1280, height: 1810, deviceScaleFactor: 1 })
    await page.emulateMediaType("print")
    await page.setContent(html, { waitUntil: "networkidle0" })

    return await page.pdf({
      format: "A4",
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    })
  } finally {
    await browser.close()
  }
}
