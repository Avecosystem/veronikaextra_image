## What’s Happening
- Vercel shows: `Environment Variable "NEW_API_KEY" references Secret "new_api_key", which does not exist`.
- This means your project configuration is pointing to a Vercel Secret name (e.g. `@new_api_key`). If that Secret hasn’t been created, deploys fail.

## Two Valid Fix Paths
### Option A — Use Plain Environment Variables (Recommended)
1. In your repository, ensure `vercel.json` does NOT include an `env` block that references secrets (e.g., `"NEW_API_KEY": "@new_api_key"`).
2. In Vercel → Project Settings → Environment Variables, add plain variables (for Development, Preview, and Production):
   - `NEW_API_KEY = ddc-a4f-07842c4bb9ae4099b39833a26a4acf46`
   - `PROVIDER_MODEL = provider-4/imagen-3.5`
   - `API_ENDPOINT = https://api.a4f.co/v1/images/generations`
   - Optional (payments): `UPI_APP_ID`, `UPI_SECRET_KEY`, `OXAPAY_MERCHANT_ID`, `OXAPAY_API_ID`, `PUBLIC_APP_BASE_URL = https://<your-app>.vercel.app`
3. Redeploy the project from Vercel.

### Option B — Keep Secret References and Create Secrets via CLI
1. Install and login to Vercel CLI:
   - `npm i -g vercel`
   - `vercel login`
2. Create the secrets Vercel expects:
   - `vercel secrets add new_api_key ddc-a4f-07842c4bb9ae4099b39833a26a4acf46`
   - `vercel secrets add provider_model provider-4/imagen-3.5`
   - `vercel secrets add api_endpoint https://api.a4f.co/v1/images/generations`
3. Keep the `env` block in `vercel.json` (it can reference `@new_api_key`, `@provider_model`, `@api_endpoint`).
4. Redeploy: `vercel --prod`.

## Clean-Up and Checks
- In Vercel → Environment Variables, remove any entries that still reference non-existent Secrets.
- Confirm no other env var (like `NEW_API_KEY`) is set twice (both Secret reference and plain value). Use one approach consistently.

## Verify After Deploy
- Image generation: POST `https://<your-app>.vercel.app/api/generate-images` with body `{"prompt":"A beautiful sunset","numberOfImages":1}` → expect 200 and an image URL.
- UPI (if configured): POST `https://<your-app>.vercel.app/api/upi-intent` with `{"orderId":"test-001","amount":199,"email":"user@example.com","name":"User","returnUrl":"https://<your-app>.vercel.app/#/profile"}`.

## Security Notes
- Keep `NEW_API_KEY` only on the server side; do not expose client `VITE_*` variables for secrets.
- Prefer Option A for simplicity unless your team standardizes on Secrets via `vercel.json`.

## My Next Steps (after your confirmation)
- If you choose Option A: I’ll verify `vercel.json` is clean, list the exact env vars to add, and guide the redeploy and endpoint tests.
- If you choose Option B: I’ll provide the precise CLI commands for your project and help run a verification against your deployed endpoints.