# Multi-Platform Deployment Guide

This guide explains how to deploy the Veronika Extra application to **Vercel**, **Netlify**, or **Railway**. All platforms use the same API proxy setup where frontend requests to `/api/*` are automatically forwarded to backend serverless functions.

## 📋 Prerequisites

Before deploying to any platform, ensure you have:

1. A GitHub repository with your code
2. The following environment variables ready:
   - `NEW_API_KEY` - Your image generation API key
   - `PROVIDER_MODEL` - Model identifier (default: `provider-4/imagen-3.5`)
   - `API_ENDPOINT` - API endpoint URL (default: `https://api.a4f.co/v1/images/generations`)
   - `PUBLIC_APP_BASE_URL` - Your app's public URL (set per platform)
   - Optional payment gateway variables: `OXAPAY_MERCHANT_ID`, `OXAPAY_API_ID`, `UPI_APP_ID`, `UPI_SECRET_KEY`

---

## 🚀 Netlify Deployment

Netlify is the **primary deployment platform** with full configuration already in place.

### Setup Steps

1. **Connect Repository**
   ```bash
   # Option 1: Use Netlify CLI
   npm install -g netlify-cli
   netlify login
   netlify init
   
   # Option 2: Use Netlify Dashboard
   # Go to https://app.netlify.com/start
   # Connect your GitHub repository
   ```

2. **Configure Build Settings** (auto-detected from `netlify.toml`)
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Functions Directory: `netlify/functions`

3. **Set Environment Variables**
   
   Navigate to: **Site Settings → Environment Variables**
   
   Add these variables:
   ```
   NEW_API_KEY=ddc-a4f-07842c4bb9ae4099b39833a26a4acf46
   PROVIDER_MODEL=provider-4/imagen-3.5
   API_ENDPOINT=https://api.a4f.co/v1/images/generations
   PUBLIC_APP_BASE_URL=https://your-app.netlify.app
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### How API Proxying Works

- Frontend requests: `https://your-app.netlify.app/api/system-status`
- Netlify redirects: `/.netlify/functions/system-status`
- Configuration: `netlify.toml` (lines 24-32)

### Testing

```bash
# Test locally
npm run dev:netlify

# Test API endpoint
curl https://your-app.netlify.app/api/system-status
```

---

## ⚡ Vercel Deployment

Vercel provides edge functions with automatic deployment from Git.

### Setup Steps

1. **Connect Repository**
   ```bash
   # Option 1: Use Vercel CLI
   npm install -g vercel
   vercel login
   vercel
   
   # Option 2: Use Vercel Dashboard
   # Go to https://vercel.com/new
   # Import your GitHub repository
   ```

2. **Configure Project Settings**
   
   Vercel auto-detects settings from `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   
   Navigate to: **Project Settings → Environment Variables**
   
   Add these variables for **Production**, **Preview**, and **Development**:
   ```
   NEW_API_KEY=ddc-a4f-07842c4bb9ae4099b39833a26a4acf46
   PROVIDER_MODEL=provider-4/imagen-3.5
   API_ENDPOINT=https://api.a4f.co/v1/images/generations
   PUBLIC_APP_BASE_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### How API Proxying Works

- Frontend requests: `https://your-app.vercel.app/api/system-status`
- Vercel routes to: `/api/system-status.ts` serverless function
- Configuration: `vercel.json` rewrites + `/api` directory functions

### Important Notes

> [!IMPORTANT]
> Vercel API functions are in the `/api` directory and use the `@vercel/node` runtime. They're automatically deployed as serverless functions.

### Testing

```bash
# Test locally
npm run dev

# Test API endpoint
curl https://your-app.vercel.app/api/system-status
```

---

## 🚂 Railway Deployment

Railway provides a simple deployment with Docker-like containers.

### Setup Steps

1. **Create New Project**
   
   Go to [Railway Dashboard](https://railway.app/dashboard)
   
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Choose your repository

2. **Configure Build Settings**
   
   Railway auto-detects from `railway.toml`:
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js`
   - Port: Auto-detected from `process.env.PORT`

3. **Set Environment Variables**
   
   Navigate to: **Project → Variables**
   
   Add these variables:
   ```
   NEW_API_KEY=ddc-a4f-07842c4bb9ae4099b39833a26a4acf46
   PROVIDER_MODEL=provider-4/imagen-3.5
   API_ENDPOINT=https://api.a4f.co/v1/images/generations
   PUBLIC_APP_BASE_URL=https://your-app.up.railway.app
   NODE_VERSION=18
   ```

4. **Deploy**
   
   Railway automatically deploys on every push to your main branch.

### How API Proxying Works

- Frontend requests: `https://your-app.up.railway.app/api/system-status`
- Express server (`server.js`) proxies to: Netlify function handlers
- Configuration: `railway.toml` + `server.js` Express middleware

### Important Notes

> [!IMPORTANT]
> Railway uses an Express server (`server.js`) that:
> - Serves static files from `dist/`
> - Proxies `/api/*` requests to Netlify function handlers
> - Handles SPA routing (all routes → `index.html`)

> [!TIP]
> Railway automatically exposes your service on a public URL. You can also add a custom domain in the project settings.

### Testing

```bash
# Test locally
npm install express
npm run build
npm start

# Test API endpoint
curl http://localhost:3000/api/system-status
```

---

## ☁️ Render Deployment

Render is a unified cloud to build and run all your apps and websites.

### Setup Steps

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Settings**
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Publish Directory:** `dist` (IMPORTANT: Default might be `build`, change it to `dist`)

3. **Set Environment Variables**
   - Add `NEW_API_KEY` and `PUBLIC_APP_BASE_URL`

### Troubleshooting

**Error: "Publish directory build does not exist!"**
- This happens because Vite outputs to `dist`, but Render defaults to looking for `build`.
- **Fix:** Go to Settings > Build & Deploy > Publish Directory and change it to `dist`.

---

## 🧪 Local Development

### Standard Vite Dev Server (Port 3000)

```bash
npm run dev
```

- URL: `http://localhost:3000`
- API proxy: Forwards `/api/*` to `http://localhost:8888/.netlify/functions/*`
- Requires Netlify Dev running separately

### Netlify Dev Server (Port 8888)

```bash
npm run dev:netlify
```

- URL: `http://localhost:8888`
- Combines Vite dev server + Netlify functions
- Recommended for testing API integrations

### Railway-style Server (Port 3000)

```bash
npm run build
npm start
```

- URL: `http://localhost:3000`
- Serves production build + Express API proxy
- Mimics Railway deployment locally

---

## 🔍 Testing Your Deployment

After deploying to any platform, verify the API proxy is working:

### 1. Test System Status Endpoint

```bash
curl https://your-app-url.com/api/system-status
```

Expected response:
```json
{
  "imageApiKeyPresent": true,
  "imageEndpoint": "https://api.a4f.co/v1/images/generations",
  "providerModel": "provider-4/imagen-3.5",
  "oxapayMerchantPresent": false,
  "oxapayApiPresent": false,
  "upiAppPresent": false,
  "upiSecretPresent": false,
  "publicAppBaseUrl": "https://your-app-url.com"
}
```

### 2. Test Image Generation (via browser)

1. Open your deployed app
2. Navigate to the image generation page
3. Enter a prompt and generate images
4. Check browser DevTools → Network tab
5. Verify `/api/generate-images` requests succeed

### 3. Check for CORS Issues

```bash
curl -H "Origin: https://your-app-url.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-app-url.com/api/generate-images
```

Should return CORS headers allowing cross-origin requests.

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEW_API_KEY` | ✅ Yes | - | Image generation API key |
| `PROVIDER_MODEL` | No | `provider-4/imagen-3.5` | AI model identifier |
| `API_ENDPOINT` | No | `https://api.a4f.co/v1/images/generations` | Image API endpoint |
| `PUBLIC_APP_BASE_URL` | ✅ Yes | - | Your app's public URL |
| `OXAPAY_MERCHANT_ID` | No | - | OxaPay merchant ID |
| `OXAPAY_API_ID` | No | - | OxaPay API key |
| `UPI_APP_ID` | No | - | UPI payment app ID |
| `UPI_SECRET_KEY` | No | - | UPI payment secret |
| `NODE_VERSION` | No | `18` | Node.js version (Railway) |
| `PORT` | No | `3000` | Server port (Railway) |

---

## 🐛 Troubleshooting

### Issue: API endpoints return 404

**Netlify:**
- Check `netlify.toml` redirects are configured
- Verify functions are in `netlify/functions/` directory

**Vercel:**
- Ensure API files are in `/api` directory
- Check `vercel.json` rewrites configuration

**Railway:**
- Verify `server.js` is running
- Check Express routes are registered correctly

### Issue: Environment variables not loading

- **All platforms:** Redeploy after adding environment variables
- **Netlify:** Check both build environment and function environment
- **Vercel:** Ensure variables are set for all environments (Production, Preview, Development)
- **Railway:** Verify variables in project settings, restart deployment

### Issue: CORS errors in browser

- Check CORS headers are set in function handlers
- Verify `Access-Control-Allow-Origin: *` is present
- Test with browser DevTools → Network tab

### Issue: Build fails

```bash
# Clear cache and rebuild
npm run build

# Check build logs for specific errors
# Netlify: Site → Deploys → [latest deploy] → Deploy log
# Vercel: Project → Deployments → [latest] → Build Logs  
# Railway: Project → Deployments → [latest] → Logs
```

---

## 📚 Additional Resources

- **Netlify Docs:** https://docs.netlify.com/functions/overview/
- **Vercel Docs:** https://vercel.com/docs/serverless-functions/introduction
- **Railway Docs:** https://docs.railway.app/

---

## 🎯 Quick Comparison

| Feature | Netlify ⭐ | Vercel | Railway |
|---------|-----------|--------|---------|
| **Setup Complexity** | Low | Low | Medium |
| **API Functions** | Netlify Functions | Vercel Functions | Express Proxy |
| **Build Time** | ~2-3 min | ~1-2 min | ~3-4 min |
| **Free Tier** | 300 build min/mo | 100 GB-hrs/mo | $5 credit/mo |
| **Best For** | Primary deployment | Edge functions | Custom server needs |

**Recommendation:** Use **Netlify** as your primary platform (already fully configured). Use **Vercel** for edge computing needs. Use **Railway** if you need custom server logic beyond serverless functions.
