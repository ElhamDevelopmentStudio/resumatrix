# Deploy Resumatrix on Vercel

This project is a **Next.js 16 + Convex** app. The most reliable way to deploy it on Vercel is to:

1. import the repository into Vercel,
2. override the Vercel build command so it runs `convex deploy`, and
3. set the required production environment variables in Vercel Project Settings.

## Recommended deployment path

Use **Vercel Git integration** for the first deployment.

That matches Vercel's standard Next.js workflow and Convex's official Vercel guide, which recommends a custom build command so the frontend and backend deploy together.

## Before you start

You will need:

- a Vercel account,
- a Convex project with a **production deployment**,
- this repository pushed to GitHub, GitLab, or Bitbucket,
- production values for these app secrets:
  - `RESUMATRIX_AUTH_USERNAME`
  - `RESUMATRIX_AUTH_PASSWORD`
  - `RESUMATRIX_SESSION_SECRET`

> This app supports **one authenticated user only**. There is no signup flow in production.

## PDF export

PDF export uses `puppeteer-core` with bundled `@sparticuz/chromium` for the Vercel/Linux runtime.

Local development can still use a system Chrome or Chromium binary. If Chrome is installed outside a standard location, set `PUPPETEER_EXECUTABLE_PATH` in `.env` or `.env.local`.

## 1. Create a Convex production deploy key

1. Open the **Convex dashboard**.
2. Open your project's **production deployment**.
3. Go to the deployment settings page.
4. Generate a **Production Deploy Key**.
5. Copy the key.

You will add this key to Vercel as `CONVEX_DEPLOY_KEY`.

## 2. Import the repository into Vercel

1. Go to **https://vercel.com/new**.
2. Import this repository.
3. Keep the project rooted at the repository root.
4. Let Vercel detect the framework as **Next.js**.

## 3. Configure Build & Deployment settings

In the new Vercel project, open:

**Settings → Build and Deployment**

Use these settings:

- **Framework Preset:** `Next.js`
- **Root Directory:** repository root (`.`)
- **Install Command:** leave on automatic detection
- **Output Directory:** leave on automatic detection
- **Build Command:**

```bash
npx convex deploy --cmd 'npm run build'
```

Why this command matters:

- it deploys your Convex functions,
- it injects the correct Convex deployment URL for the frontend build,
- it builds the Next.js app against the production Convex backend.

> Do **not** store the app's secrets in `vercel.json`. Vercel recommends using Project Settings for environment variables.

## 4. Add the required environment variables in Vercel

Open:

**Settings → Environment Variables**

Add these variables:

| Variable | Environment | Required | Purpose |
| --- | --- | --- | --- |
| `CONVEX_DEPLOY_KEY` | `Production` | Yes | Lets `npx convex deploy` push backend changes and inject the correct Convex URL during the Vercel build |
| `RESUMATRIX_AUTH_USERNAME` | `Production` | Yes | Production login username |
| `RESUMATRIX_AUTH_PASSWORD` | `Production` | Yes | Production login password |
| `RESUMATRIX_SESSION_SECRET` | `Production` | Yes | Signs the auth session cookie. Use a long random value. |

### Should you set `NEXT_PUBLIC_CONVEX_URL` manually?

Usually, **no**.

With the Convex-recommended build command above, `npx convex deploy` sets the frontend build to the correct Convex deployment URL automatically.

## 5. Deploy

After the settings and environment variables are in place:

1. Click **Deploy** in Vercel.
2. Wait for the build to finish.
3. Open the generated `*.vercel.app` URL.

After the first deployment, future pushes to your connected branch will redeploy automatically.

## 6. Verify the production deployment

Run these checks after deploy:

1. Open the deployed home page.
2. Confirm the login screen loads.
3. Sign in with the production username and password you configured.
4. Open `/dashboard` and confirm the app loads.
5. Open profiles and CV pages to confirm Convex-backed data loads correctly.
6. Test export formats:
   - PDF
   - HTML
   - Markdown
   - JSON

## Optional: enable Preview Deployments with Convex

Vercel can create Preview Deployments automatically for pull requests. If you want each preview to use its own fresh Convex backend too:

1. Generate a **Preview Deploy Key** in Convex.
2. Add `CONVEX_DEPLOY_KEY` in Vercel again, but target **Preview** instead of Production.
3. If you want sign-in to work on preview URLs, also add these app secrets for the **Preview** environment:
   - `RESUMATRIX_AUTH_USERNAME`
   - `RESUMATRIX_AUTH_PASSWORD`
   - `RESUMATRIX_SESSION_SECRET`

You can keep the same build command unless you later add a Convex preview seed function.

## Troubleshooting

### Build fails because `NEXT_PUBLIC_CONVEX_URL` is missing

Check these first:

- `CONVEX_DEPLOY_KEY` exists in Vercel,
- it is assigned to the correct environment,
- the build command is exactly:

```bash
npx convex deploy --cmd 'npm run build'
```

### Login returns “Sign-in is not configured yet.”

You are missing one or more of these production variables in Vercel:

- `RESUMATRIX_AUTH_USERNAME`
- `RESUMATRIX_AUTH_PASSWORD`
- `RESUMATRIX_SESSION_SECRET`

### PDF export fails in production

Check the Vercel function logs first. The app bundles `@sparticuz/chromium` for Vercel/Linux, while local development can use `PUPPETEER_EXECUTABLE_PATH` when Chrome is installed outside a standard location.

## References

- Vercel: Next.js on Vercel — https://vercel.com/docs/frameworks/full-stack/nextjs
- Vercel: Project settings — https://vercel.com/docs/project-configuration/project-settings
- Vercel: Custom domains — https://vercel.com/docs/domains/set-up-custom-domain
- Vercel Knowledge Base: Deploying Puppeteer with Next.js on Vercel — https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel
- Convex: Using Convex with Vercel — https://docs.convex.dev/production/hosting/vercel
- Convex: Configuring Deployment URL — https://docs.convex.dev/client/react/deployment-urls
