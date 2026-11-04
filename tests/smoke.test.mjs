import test from 'node:test';
import assert from 'node:assert/strict';
import { facts } from '../src/data.js';
import { readFile } from 'node:fs/promises';

test('the experience contains the fifteen observed aviation facts', () => {
  assert.equal(facts.length, 15);
  assert.equal(facts[0].title, 'SKY BABIES');
  assert.equal(facts.at(-1).title, 'RAISE YOUR SHADE');
  assert.ok(facts.every((fact) => fact.source.startsWith('https://')));
});

test('readable fact inventory agrees with the captured runtime', async () => {
  const bundle = await readFile(new URL('../public/main.js', import.meta.url), 'utf8');
  for (const fact of facts) {
    assert.ok(bundle.includes(fact.title), fact.title);
    assert.ok(bundle.includes(fact.source), fact.source);
  }
});
