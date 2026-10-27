import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflowPath = new URL('../.github/workflows/ci.yml', import.meta.url);
const readWorkflow = () => readFileSync(workflowPath, 'utf8').replace(/\r\n/g, '\n');
const job = (workflow, name) => workflow.split(`  ${name}:\n`)[1]?.split(/^  [a-z]+:\n/m)[0] ?? '';

test('CI runs all frontend checks without production secrets', () => {
  const workflow = readWorkflow();
  const quality = job(workflow, 'quality');
  const browser = job(workflow, 'browser');
  for (const event of ['push:', 'pull_request:', 'workflow_dispatch:']) assert.ok(workflow.includes(event));
  assert.match(workflow, /permissions:\n  contents: read/);
  for (const command of ['npm ci', 'npm run lint', 'npm test', 'npm run test:chatbot:unit', 'npm run test:chatbot:check', 'npm run build']) assert.ok(quality.includes(command), command);
  assert.ok(browser.includes('playwright install --with-deps chromium'));
  assert.ok(browser.includes('npm run test:chatbot:component'));
  assert.ok(browser.includes('test --workers=1'));
  assert.ok(browser.indexOf('test:chatbot:component') < browser.indexOf('test --workers=1'));
  assert.doesNotMatch(quality + browser, /secrets\./);
  assert.doesNotMatch(workflow, /pull_request_target|continue-on-error: true/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /retention-days: 7/);
  for (const reference of workflow.matchAll(/uses: ([^\s]+)/g)) assert.match(reference[1], /@[a-f0-9]{40}$/);
});

test('production deployment requires passing CI, main push and explicit activation', () => {
  const deploy = job(readWorkflow(), 'deploy');
  assert.match(deploy, /needs: \[quality, browser\]/);
  assert.match(deploy, /github.event_name == 'push'/);
  assert.match(deploy, /github.ref == 'refs\/heads\/main'/);
  assert.match(deploy, /vars.ENABLE_VERCEL_DEPLOY == 'true'/);
  assert.match(deploy, /environment: production/);
  for (const name of ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID']) assert.ok(deploy.includes(`secrets.${name}`));
  assert.match(deploy, /Missing required deployment secret/);
  assert.match(deploy, /vercel pull --yes --environment=production/);
  assert.match(deploy, /vercel build --prod/);
  assert.match(deploy, /vercel deploy --prebuilt --prod/);
  assert.doesNotMatch(deploy, /chatbot-test|test-only-anon-key/);
});
