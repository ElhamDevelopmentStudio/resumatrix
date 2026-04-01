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
- `POST /api/auth/login` — login endpoint

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
