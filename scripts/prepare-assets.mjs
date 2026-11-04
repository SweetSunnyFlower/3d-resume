/**
 * Reproduce the local distribution from the retained REA capture.
 * Transformations are deliberately small, checked, and recorded.
 * Never execute downloaded sources during this preparation step.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const evidence = path.resolve(root, '../evidence');
const publicRoot = path.join(root, 'public');
await mkdir(publicRoot, { recursive: true });
const manifest = [];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function store(relative, bytes, origin, original = bytes) {
  const destination = path.join(publicRoot, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  manifest.push({ path: relative, origin, bytes: Buffer.byteLength(bytes),
    sha256: digest(bytes), originalSha256: digest(original) });
}

const assets = [
  'models/cloud_11.glb', 'models/cloud_22.glb', 'models/planeur.glb',
  'models/elephant.glb', 'textures/radial-gradient.png', 'draco/draco_decoder.js',
  '69381a98ad5a279793da.woff', 'main.js.LICENSE.txt',
  'fav/apple-touch-icon.png', 'fav/favicon-32x32.png', 'fav/favicon-16x16.png',
  'fav/site.webmanifest',
];
async function download(relative, url = `https://atmos.leeroy.ca/${relative}`) {
  try {
    const existing = await readFile(path.join(publicRoot, relative));
    await store(relative, existing, url);
    console.log(`${relative}: reused ${existing.length} bytes`);
    return;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (relative.endsWith('.glb') && bytes.toString('ascii', 0, 4) !== 'glTF') {
    throw new Error(`Invalid GLB: ${relative}`);
  }
  await store(relative, bytes, url);
  console.log(`${relative}: ${bytes.length} bytes`);
}
for (let offset = 0; offset < assets.length; offset += 4) {
  const results = await Promise.allSettled(assets.slice(offset, offset + 4).map(p => download(p)));
  for (const result of results) if (result.status === 'rejected') throw result.reason;
}
await download('android-chrome-192x192.png', 'https://atmos.leeroy.ca/fav/android-chrome-192x192.png');
await download('android-chrome-512x512.png', 'https://atmos.leeroy.ca/fav/android-chrome-512x512.png');
for (const name of [
  '8069ffca34f7abec8f31.mp3', '6ca15b60fc13e83999ca.mp3',
  '152989251ccdc1b521b7.mp3', 'e123bb992ebe4c317c10.mp3',
  '4ee96395e07a04577aab.ttf', '86e747d8b10ce7e39527.otf',
  '446c446a8a06cd725832.svg', 'd7ca8e53d93f0c4d5484.json',
  'ff1931f754696ae28e15.json',
]) await store(name, await readFile(path.join(evidence, name)), `https://atmos.leeroy.ca/${name}`);
await store('737ac14dc52bbb901031.woff2', await readFile(path.join(evidence, 'atmos.woff2')), 'https://atmos.leeroy.ca/737ac14dc52bbb901031.woff2');
await store('e4b4f466a8acfa6ccf02.svg', await readFile(path.join(evidence, 'atmos.svg')), 'https://atmos.leeroy.ca/e4b4f466a8acfa6ccf02.svg');

await download('fonts/roboto-fallback.woff', 'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff');
const fontResponse = await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap');
if (!fontResponse.ok) throw new Error('Could not retrieve DM Sans');
let fontCSS = await fontResponse.text();
const fontURLs = [...new Set(fontCSS.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g))];
for (let i = 0; i < fontURLs.length; i++) {
  const local = `fonts/dm-sans-${i}${path.extname(new URL(fontURLs[i]).pathname)}`;
  await download(local, fontURLs[i]);
  fontCSS = fontCSS.replaceAll(fontURLs[i], local);
}
const originalCSS = await readFile(path.join(evidence, 'main.css'), 'utf8');
const css = originalCSS.replace(/^@import url\([^;]+;/, fontCSS);
await store('main.css', css, 'https://atmos.leeroy.ca/main.css', originalCSS);

const originalJS = await readFile(path.join(evidence, 'main.js'), 'utf8');
let js = originalJS;
// Keep the GPU detector and renderer intact, but supply a local benchmark directory.
js = js.replaceAll('https://unpkg.com/detect-gpu@4.0.25/dist/benchmarks', '/benchmarks');
js = js.replaceAll('https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff', '/fonts/roboto-fallback.woff');
// Ship exact upstream detect-gpu benchmark files, so no network is needed to start.
const listing = await fetch('https://unpkg.com/detect-gpu@4.0.25/dist/benchmarks/?meta');
if (!listing.ok) throw new Error('Could not list GPU benchmarks');
const benchmarkFiles = (await listing.json()).files.filter(f => f.path.endsWith('.json'));
for (let offset = 0; offset < benchmarkFiles.length; offset += 4) {
  const results = await Promise.allSettled(benchmarkFiles.slice(offset, offset + 4).map(f =>
    download(`benchmarks/${path.basename(f.path)}`, `https://unpkg.com/detect-gpu@4.0.25${f.path}`)));
  for (const result of results) if (result.status === 'rejected') throw result.reason;
}
if (js === originalJS || js.includes('https://unpkg.com/detect-gpu@')) throw new Error('Localization failed');
await store('main.js', js, 'https://atmos.leeroy.ca/main.js?1500c8f510f79dd7e2d4', originalJS);

let html = await readFile(path.join(evidence, 'index.html'), 'utf8');
html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g, '')
  .replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g, '')
  .replace(/<script src="\/cdn-cgi\/[^>]+><\/script>/g, '')
  .replace(/<link rel="mask-icon"[^>]+>/g, '')
  .replace(/type="[a-f0-9]+-text\/javascript"/g, 'type="text/javascript"')
  .replace(/<html>/, '<html lang="en">')
  .replace('<script defer src="main.js', '<script defer src="local.js"></script><script defer src="main.js')
  .replace('</head>', '<link rel="stylesheet" href="local.css"></head>');
await store('index.html', html, 'https://atmos.leeroy.ca/', await readFile(path.join(evidence, 'index.html')));
await writeFile(path.join(root, 'asset-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${manifest.length} local assets.`);
