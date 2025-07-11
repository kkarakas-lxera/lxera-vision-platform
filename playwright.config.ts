import { defineConfig, devices } from '@playwright/test';

// Playwright configuration to spin up the Vite dev server before tests.
// Running `pnpm exec playwright test` will now automatically start Vite on port 5173.
export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'pnpm run build:fresh && vite preview --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000, // 4 minutes to allow build
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
});