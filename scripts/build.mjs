import { cp, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public');
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await cp(source, dist, { recursive: true });

const entries = [];
async function walk(dir, prefix = '') {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) {
      await walk(full, `${prefix}${name}/`);
    } else {
      entries.push({ path: `${prefix}${name}`, bytes: info.size });
    }
  }
}
await walk(dist);
const total = entries.reduce((sum, item) => sum + item.bytes, 0);
entries.sort((a, b) => b.bytes - a.bytes);

console.log(`Built ${entries.length} files into dist/ (${(total / 1024 / 1024).toFixed(2)} MB)`);
for (const item of entries.slice(0, 8)) {
  console.log(`  ${item.path}  ${(item.bytes / 1024).toFixed(1)} KB`);
}
