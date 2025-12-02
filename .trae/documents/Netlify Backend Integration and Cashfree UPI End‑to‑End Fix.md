## Goals
- Make image generation and payments work by running all backend via Netlify Functions.
- Ensure Cashfree UPI flow is live, secure, and fully automated (credits added on success).
- Enforce HTTPS `return_url` and never use localhost.
- Remove dependency on static `index.html` uploads (GitHub Pages) that don’t run a backend.

## Architecture
- Frontend: Vite SPA (hash routing) served by Netlify.
- Backend: Netlify Functions at `/api/*` for:
  - `generate-images` (image provider API)
  - `upi-intent` (Cashfree order creation)
  - `cashfree-webhook` + `cashfree-order-status` (verification)
  - `oxapay-intent` (crypto)
  - `global-settings` (admin content)
- Routing: `netlify.toml` redirects `/api/* → /.netlify/functions/:splat`, SPA fallback `/* → /index.html`.

## Backend Implementation (Cashfree UPI)
1. Server‑only credentials: read `UPI_APP_ID`, `UPI_SECRET_KEY` from env; never expose in client.
2. Customer ID generation: build an alphanumeric string with `_` or `-`, stripping `@` and `.`; truncate ≤45 chars.
3. Order creation (`upi-intent`):
   - Input: `orderId`, `amount`, `email`, `name`, `phone` (optional).
   - Compute `customer_id` and set `order_meta.return_url` using `PUBLIC_APP_BASE_URL` → `/#/profile?order_id={order_id}&status={order_status}`.
   - Call `https://api.cashfree.com/pg/orders`, return `payment_link` to frontend.
4. Verification:
   - Webhook (`cashfree-webhook`) or polling (`cashfree-order-status`).
   - On PAID/SUCCESS: add credits to user; persist transaction status; return new balance.
5. Auto redirect:
   - After payment, user lands on `/#/profile` with `order_id` & `status`; frontend calls verify endpoint; updates credits; shows “Payment Successful” with new balance.

## Backend Implementation (Image Generation)
- `generate-images` reads `NEW_API_KEY`, `PROVIDER_MODEL`, `API_ENDPOINT` from env.
- Use `Authorization: Bearer <NEW_API_KEY>` to call provider endpoint.
- Return images; handle errors cleanly with masked logs.

## Frontend Wiring
- Credits Page → UPI Button:
  - Calls `/api/upi-intent`, receives `payment_link`, redirects to Cashfree.
- Profile Page:
  - On load, parse `order_id`, `status` from URL; calls verify endpoint; updates credits; shows success message.
- Image Generation:
  - Always call `/api/generate-images` (Netlify Function) and render results or error.

## Environment & Deployment
- Netlify Site (connected to repo):
  - Build: `npm run build` | Publish dir: `dist` | Functions dir: `netlify/functions`.
- Set env vars in Netlify (Site settings → Environment):
  - `NEW_API_KEY`, `PROVIDER_MODEL`, `API_ENDPOINT`
  - `UPI_APP_ID`, `UPI_SECRET_KEY`
  - `PUBLIC_APP_BASE_URL` (e.g., `https://veronikaextra.netlify.app` or your custom HTTPS domain)
- Do not deploy as static `index.html`; GitHub Pages cannot run functions.

## HTTPS Return URL Fix
- Always derive `return_url` from `PUBLIC_APP_BASE_URL` and never accept `http` or localhost.
- Default to production HTTPS domain if env is missing.

## Testing & Verification
- Local: run `netlify dev` with envs; Vite proxies `/api` to functions; test flows:
  - Image generation: submit prompt → expect 200 and image URLs.
  - UPI: Select plan → “Pay with UPI” → complete payment → auto redirect → credits increased.
- Production: repeat tests; check Netlify functions logs.

## Edge Cases & Hardening
- Handle Cashfree pending/cancelled states with clear messages.
- Mask secrets in logs; no keys in client bundle.
- Retry/fallback for OxaPay with public pay link if API is slow.
- Guard against insufficient credits and unauthenticated actions.

## App.tsx Diagnostics
- Current file compiles; reported JSX errors are likely from an unsaved buffer.
- As part of the rollout, re-run typecheck/build to confirm clean status; if any real parsing error appears, fix JSX tags around the `PageTransition` component.

## What I’ll Do After Your Approval
1. Ensure `PUBLIC_APP_BASE_URL` is set to your final HTTPS domain.
2. Verify and, if needed, refine `upi-intent`, webhook, and status functions for Cashfree.
3. Validate image generation function with your `NEW_API_KEY`.
4. Confirm frontend flows and success UI.
5. Provide a short handoff checklist for Netlify deployment and environment setup.

Please confirm this plan, and share your production domain (if different from the default) so I can wire `PUBLIC_APP_BASE_URL` precisely.