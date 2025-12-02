## Dependency Alignment
- Keep React at `19.x` and remove `react-helmet-async` everywhere
- Use `@unhead/react` for head management and wrap the app with its provider context
- Ensure imports: `Head` from `@unhead/react`, provider utilities from `@unhead/react/client`

## Provider Context Setup
- Initialize Unhead provider with `createHead()` and wrap the Router/App inside `UnheadProvider`
- Remove old `HelmetProvider` usage and any residual references

## Dev Server & Routing
- Run the dev stack and verify:
  - Frontend at `http://localhost:3000/`
  - Functions via Netlify dev server at `http://localhost:8888/.netlify/functions/*`
- Ensure Vite proxy maps `/api/*` → `/.netlify/functions/*` for local development

## Netlify Build Configuration
- Use a clean install and build: `npm ci` (or `npm install`) then `npm run build`
- Avoid `--legacy-peer-deps` now that peer conflicts are removed
- Keep `netlify.toml` function redirects for `/api/*` → `/.netlify/functions/:splat`

## Environment Variables
- Set server-side env vars in Netlify:
  - `NEW_API_KEY`
  - `PROVIDER_MODEL` (e.g., `provider-4/imagen-3.5`)
  - `API_ENDPOINT` (`https://api.a4f.co/v1/images/generations`)
- Ensure no client-side exposure of API keys; server function reads from `process.env`

## API Integration Validation
- POST to `/api/generate-images` with sample prompts
- Confirm images are returned with `data.url` from the provider and errors are formatted via `formatApiError`
- Verify parallel/serial image requests behave and timeouts are honored

## Frontend UX Checks
- Verify ImageGenerator flow: credit checks, success state, error state
- Confirm pages set SEO tags via `<Head>` and render without import map issues
- Validate admin and profile pages load without head errors

## Security Hardening
- Remove any remaining client references to secrets
- Confirm CORS headers are scoped correctly and methods limited to expected verbs

## Optional CI/Build Checks
- Add a basic smoke test (`npm run test:api`) to hit the local function
- Enable Netlify build logs monitoring for early detection of dependency mismatches

Confirm to proceed with these steps to finalize deployment and validation.