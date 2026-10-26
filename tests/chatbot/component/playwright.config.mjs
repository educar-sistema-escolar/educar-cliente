import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: '.', testMatch: '*.spec.mjs', workers: 1, retries: 0, timeout: 15000,
  expect: { timeout: 2000 },
  outputDir: '../../../test-results/component',
  reporter: [['list'], ['json', { outputFile: fileURLToPath(new URL('../../../test-results/component-results.json', import.meta.url)) }]],
  use: { baseURL: 'http://127.0.0.1:4180', trace: 'retain-on-failure' },
  webServer: {
    cwd: fileURLToPath(new URL('../../../', import.meta.url)),
    command: 'npx vite build --config tests/chatbot/component/vite.config.mjs && npx vite preview --config tests/chatbot/component/vite.config.mjs --host 127.0.0.1 --port 4180 --strictPort',
    url: 'http://127.0.0.1:4180/tests/chatbot/component/', timeout: 60000, reuseExistingServer: false,
  },
});
