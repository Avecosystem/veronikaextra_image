## Problem Summary
- Frontend calls `/api/generate-images` correctly, but backend returns 500: “API Key is missing.”
- Root cause: Netlify Functions environment lacks `NEW_API_KEY`/`API_ENDPOINT`/`PROVIDER_MODEL` in production or during `netlify dev`.

## Diagnosis Steps
- Hit `/.netlify/functions/system-status` on your deployed site to confirm:
  - `imageApiKeyPresent` is true
  - `imageEndpoint` and `providerModel` are correct
- Review function logs for `generate-images` to see masked env status lines and any downstream provider errors.

## Configuration (Netlify)
- Deploy via repository (not static index.html) so Functions run.
- In Netlify → Site settings → Environment, set:
  - `NEW_API_KEY`: your provider API key (server only)
  - `PROVIDER_MODEL`: `provider-4/imagen-3.5`
  - `API_ENDPOINT`: `https://api.a4f.co/v1/images/generations`
  - `PUBLIC_APP_BASE_URL`: your HTTPS domain
- Save and redeploy.

## Local Dev
- Use `netlify dev` with envs set (via `netlify env:set` or shell exports) so functions receive keys.
- Vite proxy to functions is already configured, no frontend change required.

## Backend Verification
- Ensure `generate-images` sends `Authorization: Bearer <NEW_API_KEY>` and uses the selected endpoint.
- Confirm function handles 401/403 from provider with clear JSON errors.

## Frontend UX
- Keep current message for failures and log masked details; no secrets exposed.
- Optionally surface a friendly prompt: “Server temporarily unavailable. Please retry in a moment.” when 5xx.

## Test Plan
- Run a prompt in dev (`netlify dev`) and in production; expect 200 and images when envs are present.
- If provider returns 4xx, verify error handling and message propagation.

## Deliverables
- Working image generation in dev and production
- Verified env status via `system-status`
- Documented deployment checklist for Netlify envs

Please confirm this plan. If your production domain differs, share it so `PUBLIC_APP_BASE_URL` aligns with your HTTPS URL.