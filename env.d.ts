/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEW_API_KEY: string;
  readonly PROVIDER_MODEL: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}