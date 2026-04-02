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
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Auth configuration

Set these environment variables in `.env.local` for a production-style login setup:

| Variable | Description |
| --- | --- |
| `RESUMATRIX_AUTH_USERNAME` | The only username allowed to sign in |
| `RESUMATRIX_AUTH_PASSWORD` | The password for that user |
| `RESUMATRIX_SESSION_SECRET` | A long random string used to sign the session cookie |

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

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
