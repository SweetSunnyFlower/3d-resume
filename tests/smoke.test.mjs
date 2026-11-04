import test from 'node:test';
import assert from 'node:assert/strict';
import { facts } from '../src/data.js';
import { readFile } from 'node:fs/promises';

test('the experience contains the fifteen resume highlights', () => {
  assert.equal(facts.length, 15);
  assert.equal(facts[0].title, '高兵兵');
  assert.equal(facts.at(-1).title, '感谢查看');
  assert.ok(facts.every((fact) => fact.source.startsWith('https://')));
});

test('readable fact inventory agrees with the captured runtime', async () => {
  const bundle = await readFile(new URL('../public/main.js', import.meta.url), 'utf8');
  for (const fact of facts) {
    assert.ok(bundle.includes(fact.title), fact.title);
    assert.ok(bundle.includes(fact.source), fact.source);
  }
});
