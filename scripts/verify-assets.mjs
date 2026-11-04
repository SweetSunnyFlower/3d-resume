import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile(new URL('../asset-manifest.json', import.meta.url)));
for (const item of manifest) {
  const bytes = await readFile(new URL(`../public/${item.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, `${item.path} digest`);
}
const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/main.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/main.css', import.meta.url), 'utf8');
assert.ok(!html.includes('googletagmanager'));
assert.ok(!html.includes('rocket-loader'));
assert.ok(!js.includes('https://unpkg.com/detect-gpu'));
assert.ok(!js.includes('https://fonts.gstatic.com'));
assert.ok(!css.includes('https://fonts.'));
console.log(`Verified ${manifest.length} asset hashes and local-only runtime resource URLs.`);
