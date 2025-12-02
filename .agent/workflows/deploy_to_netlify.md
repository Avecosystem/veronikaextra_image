---
description: How to deploy the application to Netlify
---

# Deploy to Netlify

## Quick Deploy (Using Netlify CLI)

// turbo-all

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   ```bash
   netlify deploy
   ```
   - Choose "Create & configure a new site"
   - Publish directory: `dist`

3. **Deploy to production**:
   ```bash
   netlify deploy --prod
   ```

## Alternative: Git-Based Deployment

1. Push code to GitHub/GitLab
2. Go to [Netlify](https://app.netlify.com/) → "Add new site" → "Import from Git"
3. Connect repository
4. Netlify auto-detects settings from `netlify.toml`
5. Click "Deploy"

## Important Notes

- **GitHub Pages will NOT work** - this app needs serverless functions
- Environment variables are already in `netlify.toml`
- For security, you can move them to Netlify dashboard instead

See the implementation plan for detailed troubleshooting.

