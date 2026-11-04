import test from 'node:test';
import assert from 'node:assert/strict';
import { createStaticServer } from '../server.mjs';

test('serves local assets, refuses escapes and does not expose source tooling', async (t) => {
  const server = createStaticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(await page.text(), /高兵兵/);
  assert.equal((await fetch(`${base}/server.mjs`)).status, 404);
  assert.equal((await fetch(`${base}/%2e%2e%2fpackage.json`)).status, 403);
  assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
  const model = await fetch(`${base}/models/planeur.glb`);
  assert.equal(model.status, 200);
  assert.equal(model.headers.get('content-type'), 'model/gltf-binary');
  const head = await fetch(`${base}/main.js`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
