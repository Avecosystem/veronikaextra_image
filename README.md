# VERONIKAextra Images

Welcome to VERONIKAextra Images, an advanced AI-powered image generation platform built with React, TypeScript, and Vite.

## ✅ UPDATE: Configuration Complete

Your application is now properly configured to work with a4f.co:
- API Key: ddc-a4f-07842c4bb9ae4099b39833a26a4acf46
- Model: provider-4/imagen-3.5
- Endpoint: https://api.a4f.co/v1/images/generations

However, there's a backend issue with a4f.co that needs to be resolved. See [HOW_TO_FIX_CONNECTION.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/HOW_TO_FIX_CONNECTION.md) for details.

## Features

- 🎨 AI Image Generation with customizable prompts
- 🖼️ Gallery view of generated images
- 💾 Easy image download functionality
- 🌙 Dark/Light mode toggle
- 📱 Fully responsive design
- 🔐 Admin dashboard for content management
- 🛡️ Secure API integration
- 🧾 Automatic watermarking ("VERONIKAextra" in bottom-right corner)
- 🖼️ Select number of images to generate (1-4)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd veronikaextra-images
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Your `.env.local` file is already properly configured with:
   ```env
   NEW_API_KEY=ddc-a4f-07842c4bb9ae4099b39833a26a4acf46
   PROVIDER_MODEL=provider-4/imagen-3.5
   API_ENDPOINT=https://api.a4f.co/v1/images/generations
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run verify:env` - Verify environment configuration
- `npm run verify:api` - Verify API configuration
- `npm run verify:endpoint` - Verify endpoint configuration
- `npm run test:api` - Test API connectivity
- `npm run test:watermark` - Test watermark functionality
- `npm run investigate:provider` - Investigate provider configuration

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEW_API_KEY` | Your provider API key | ✅ Yes |
| `PROVIDER_MODEL` | Model identifier | ✅ Yes |
| `API_ENDPOINT` | Actual API endpoint URL | ✅ Yes |

## Troubleshooting

### "Failed to connect to the image generation service"

See [HOW_TO_FIX_CONNECTION.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/HOW_TO_FIX_CONNECTION.md) for detailed instructions. Your configuration is correct, but there's a backend issue with a4f.co that needs to be resolved by their support team.

### "API Key is missing" on deployment

Ensure environment variables are properly configured on your deployment platform (Vercel, Netlify, etc.).

### "HTTP Error: 401 Unauthorized"

Verify your API key is correct and check which authentication method your provider uses.

## Deployment

### Vercel

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add environment variables in Vercel project settings:
   - `NEW_API_KEY`
   - `PROVIDER_MODEL`
   - `API_ENDPOINT`
4. The application includes a `vercel.json` file with proper routing configuration

### Netlify

1. Push your code to a GitHub repository
2. Connect the repository to Netlify
3. Add environment variables in Netlify project settings:
   - `NEW_API_KEY`
   - `PROVIDER_MODEL`
   - `API_ENDPOINT`
4. The application includes a `netlify.toml` file with proper routing configuration
5. If you encounter dependency conflicts during build, the project includes an `.npmrc` file that allows legacy peer dependencies to resolve compatibility issues with React 19

## Documentation

- [FIX_ALL_PROBLEMS.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/FIX_ALL_PROBLEMS.md) - Comprehensive guide to fix all problems (READ THIS FIRST)
- [HOW_TO_FIX_CONNECTION.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/HOW_TO_FIX_CONNECTION.md) - Fixing connection errors
- [FIX_CONNECTION_ERROR.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/FIX_CONNECTION_ERROR.md) - Detailed connection error guide
- [FIX_401_ERROR.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/FIX_401_ERROR.md) - Fixing 401 unauthorized errors
- [A4F_API_CONFIGURATION.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/A4F_API_CONFIGURATION.md) - A4F API configuration guide
- [docs/WATERMARK_FEATURE.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/docs/WATERMARK_FEATURE.md) - Watermark feature documentation
- [DEPLOYMENT.md](file:///c%3A/Users/ankan/Downloads/veronikaextra-images/docs/DEPLOYMENT.md) - Deployment guide

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.