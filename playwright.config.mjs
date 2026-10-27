import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/chatbot/browser',
  outputDir: 'test-results/browser',
  fullyParallel: true,
  workers: 3,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 1200 },
  reporter: [['list'], ['json', { outputFile: 'test-results/chatbot-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4178', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
    timeout: 180000,
    // Synthetic project only: no developer credentials or production network.
    env: { VITE_SUPABASE_URL: 'https://chatbot-test.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-only-anon-key' },
  },
});
