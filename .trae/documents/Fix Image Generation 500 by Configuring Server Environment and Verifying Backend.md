## Root Cause
- The backend function returns 500 with “API Key is missing” because `process.env.NEW_API_KEY`/`process.env.API_KEY` is absent on the server (`netlify/functions/generate-images.ts:18–27`).
- Frontend is correctly calling `/api/generate-images` (`services/imageGenerationService.ts:10–28`). The error is purely server‑side configuration.

## What I Will Do
- Ensure Netlify deploys the full app (frontend + functions) rather than static `index.html`.
- Configure required environment variables in Netlify so serverless functions can authenticate to the image provider.
- Verify function wiring end‑to‑end and surface clear user feedback if providers are temporarily failing.

## Netlify Environment Setup
- In Netlify → Site settings → Environment, set:
  - `NEW_API_KEY`: image provider key
  - `PROVIDER_MODEL`: `provider-4/imagen-3.5`
  - `API_ENDPOINT`: `https://api.a4f.co/v1/images/generations`
  - `PUBLIC_APP_BASE_URL`: your HTTPS domain (for example `https://veronikaextra.netlify.app`)
- Redeploy the site so functions read the new env.

## Deployment
- Connect the GitHub repo and deploy with build:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Functions directory: `netlify/functions`
- Do not upload only `index.html`; GitHub Pages cannot run the backend.

## Local Development
- Run `netlify dev` and provide envs so the functions receive keys.
- Vite proxy is already set (`vite.config.ts:6–17`) to send `/api/*` to `/.netlify/functions` during dev.

## Verification Steps
- Call the status function to confirm backend envs:
  - `/.netlify/functions/system-status` should report `imageApiKeyPresent: true` and correct `imageEndpoint`.
- Generate an image from the UI and confirm a 200 response from `/.netlify/functions/generate-images`.
- If any error persists, check server logs for the function and confirm Bearer auth header is present (`netlify/functions/generate-images.ts:60–81`).

## Error Handling & UX
- Keep frontend messaging concise when provider fails and suggest retry.
- Log masked errors only; no secrets in logs.

## Security
- Keys remain only in backend environment; never in client bundle.

## Outcome
- Image generation requests succeed with valid API keys.
- Clear operational path for both local dev and production deployments.

Please confirm, and share your final production HTTPS domain so I can align `PUBLIC_APP_BASE_URL` precisely for consistent redirects.