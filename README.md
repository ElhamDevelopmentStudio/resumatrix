# Resumatrix

Resumatrix is a single-user resume workspace built with the Next.js App Router.

## Auth constraints

This project only supports one authenticated user.

- No signup
- No account creation
- No password reset
- No OAuth

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and update the values you want to use:

   ```bash
   cp .env.example .env
   ```

   `.env.local` also works if you prefer it.

3. Start Convex in a separate terminal:

   ```bash
   npm run convex:dev
   ```

   Convex usually writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local` when you configure a local or cloud development deployment.
   If you keep your settings in `.env`, copy that value there after setup.

4. Start the Next.js development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Data storage

Resumatrix stores career data, profiles, and CVs in Convex.

- Local development uses the Convex dev deployment you start with `npm run convex:dev`.
- The app needs `NEXT_PUBLIC_CONVEX_URL` set to the target Convex deployment.
- If Convex also gives you `CONVEX_DEPLOYMENT` or `NEXT_PUBLIC_CONVEX_SITE_URL`, you can keep them, but this app does not require them.

## Import legacy local data into Convex

If you used the older local-file storage, you can copy that data into Convex once.

1. Start Convex:

   ```bash
   npm run convex:dev
   ```

2. Run a dry run first to confirm the importer can see your old files:

   ```bash
   npm run import:legacy-data -- --dry-run
   ```

3. Import the data:

   ```bash
   npm run import:legacy-data
   ```

4. If your Convex deployment already has data and you want to overwrite it:

   ```bash
   npm run import:legacy-data -- --replace
   ```

By default, the importer reads from the old default temp directory, usually `/tmp/resumatrix`.

You can also point it at a specific folder:

```bash
npm run import:legacy-data -- --source-dir=/path/to/resumatrix
```

The importer looks for:

- `workspace.json`
- `profiles.json`
- `cvs.json`

## PDF export requirements

PDF export uses a local Chrome or Chromium installation through Puppeteer.

- If Chrome is installed in a standard location, no extra setup is needed.
- If it is installed elsewhere, set `PUPPETEER_EXECUTABLE_PATH` in `.env` or `.env.local`.

## Auth configuration

Set these environment variables in `.env` or `.env.local`:

| Variable | Description |
| --- | --- |
| `RESUMATRIX_AUTH_USERNAME` | The only username allowed to sign in |
| `RESUMATRIX_AUTH_PASSWORD` | The password for that user |
| `RESUMATRIX_SESSION_SECRET` | A long random string used to sign the session cookie |
| `NEXT_PUBLIC_CONVEX_URL` | The Convex deployment URL used for app data |

### Local development fallback

If you do not set auth credentials in development, the login route falls back to:

- Username: `admin`
- Password: `password`

This fallback is for local development only. Set real values before deploying.

## Main routes

- `/` — login page
- `/dashboard` — dashboard workspace
- `/career-data` — unified career data workspace
- `/profiles` — profile management workspace with search, filters, sorting, and multiple views
- `/profiles/new` — full-page profile creation flow
- `/profiles/:id` — full-page profile editing flow
- `/cvs` — CV library with recent exports and editor links
- `/cvs/new` — create a CV from a saved profile and template
- `/cvs/:id` — CV editor with live preview, section controls, and exports
- `/cv-print/:id` — print-friendly CV preview for manual inspection
- `/personal` — redirects to `/career-data`
- `POST /api/auth/login` — login endpoint
- `GET, PUT /api/personal` — personal details API
- `GET, POST /api/contacts` — contacts collection API
- `PUT, DELETE /api/contacts/:id` — single contact API
- `GET, POST /api/experiences` — experiences collection API
- `PUT, DELETE /api/experiences/:id` — single experience API
- `GET, POST /api/projects` — projects collection API
- `PUT, DELETE /api/projects/:id` — single project API
- `GET, POST /api/education` — education collection API
- `PUT, DELETE /api/education/:id` — single education API
- `GET, POST /api/skills` — skills collection API
- `PUT, DELETE /api/skills/:id` — single skill API
- `GET, POST /api/profiles` — profiles collection API
- `PUT, DELETE /api/profiles/:id` — single profile API
- `GET /api/templates` — available CV templates
- `GET, POST /api/cvs` — CV collection API
- `PUT, DELETE /api/cvs/:id` — single CV API
- `GET /api/cvs/:id/export?format=pdf|html|markdown|json` — CV export endpoint with server-generated PDF downloads

## Scripts

```bash
npm run dev
npm run convex:dev
npm run convex:deploy
npm run import:legacy-data
npm run lint
npm run build
npm run start
```
