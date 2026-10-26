import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const demoValues = [];
const included = new Set();
for (const file of ['.env.local', '.env.demo.local']) {
  const text = await readFile(resolve(root, file), 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(VITE_DEMO_\w+_(?:EMAIL|PASSWORD))\s*=\s*(.*?)\s*$/);
    if (match?.[2]) demoValues.push([match[1], match[2].replace(/^['"]|['"]$/g, '')]);
  }
}
async function scan(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) count += await scan(path);
    else if (/\.(js|html|map)$/.test(entry.name)) {
      const text = await readFile(path, 'utf8');
      for (const [name, value] of demoValues) if (text.includes(value)) included.add(name);
      assert(!/sb_secret_[A-Za-z0-9_-]+/.test(text), `Server key leaked into ${entry.name}`);
      assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text), `Private key leaked into ${entry.name}`);
      for (const token of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
        const payload = JSON.parse(Buffer.from(token[1], 'base64url').toString());
        assert(payload.role !== 'service_role', `Supabase service_role leaked into ${entry.name}`);
      }
      count++;
    }
  }
  return count;
}
const files = await scan(resolve(root, 'dist'));
assert(files > 0, 'Build production before scanning');
assert(demoValues.length > 0, 'No configured DEMO values to verify');
for (const role of ['SUPERADMIN', 'TEACHER', 'FAMILY', 'STUDENT']) {
  for (const field of ['EMAIL', 'PASSWORD']) {
    const name = `VITE_DEMO_${role}_${field}`;
    assert(included.has(name), `${name} missing from production build`);
  }
}
console.log(`PASS: ${files} production files; all 8 public DEMO values included; no server/private/service_role key.`);
