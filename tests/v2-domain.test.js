import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCollection, groupInstances, createLocalIdentity } from '../v2/domain/collection.js';
import { collectionFixture } from './fixtures/v2/collection.js';

test('D: three real copies, improvement separates without mutation or composite', () => {
  const c = collectionFixture();
  const before = structuredClone(c);
  const [group] = groupInstances(c);
  assert.equal(group.count, 3);
  assert.deepEqual(group.members, c.instances);
  assert.equal(group.members[0], c.instances[0]);
  assert.equal(Object.hasOwn(group, 'progression'), false);
  assert.deepEqual(c, before);
  c.instances[0].progression.level++;
  assert.deepEqual(groupInstances(c).map(g => g.count).sort(), [1, 2]);
  assert.equal(c.instances[1].progression.level, 70);
  assert.equal(c.instances[1].progression.pillBonuses.hp, 0);
});

for (const [name, change] of [
  ['form', i => { i.formId = 'fiction:evolved'; }],
  ['level', i => { i.progression.level++; }],
  ['LB', i => { i.progression.unlockedLevelCap++; }],
  ['Luck', i => { i.progression.luck++; }],
  ['EXP', i => { i.progression.exp++; }],
  ['ability identities with equal count', i => { i.progression.activeAbilityIds[0] = 'ability:c'; }],
  ...['hp', 'attack', 'speed'].map(stat => [`pill ${stat}`, i => { i.progression.pillBonuses[stat]++; }]),
  ['total stats', i => { i.progression.totalStats.hp++; }],
]) test(`D: ${name} separates`, () => {
  const c = collectionFixture(); change(c.instances[0]);
  assert.deepEqual(groupInstances(c).map(g => g.count).sort(), [1, 2]);
});

test('D: order, ability order and technical metadata are neutral; long IDs survive JSON', () => {
  const c = JSON.parse(JSON.stringify(collectionFixture()));
  c.instances[0].technical = { syncedAt: 'fiction:date', revision: 7 };
  c.instances[0].provenance.observedAt = 'fiction:other-date';
  c.instances[0].progression.activeAbilityIds.reverse();
  const groups = groupInstances(c);
  assert.equal(groups[0].count, 3);
  c.instances.reverse(); c.forms.reverse();
  assert.deepEqual(groupInstances(c), groups);
  assert.equal(groups[0].members[0].instanceId, '900719925474099312340');
});

test('null, absent and zero stay distinct; unknowns never prove equality', () => {
  for (const field of ['level', 'exp', 'unlockedLevelCap', 'activeAbilityIds', 'luck', 'pillBonuses', 'totalStats']) {
    for (const missing of [false, true]) {
      const c = collectionFixture();
      for (const i of c.instances) { if (missing) delete i.progression[field]; else i.progression[field] = null; }
      const before = structuredClone(c);
      assert.equal(validateCollection(c).valid, true);
      assert.equal(groupInstances(c).length, 3);
      assert.deepEqual(c, before);
    }
  }
  const c = collectionFixture();
  c.instances[0].progression.pillBonuses.speed = null;
  delete c.instances[1].progression.pillBonuses.speed;
  assert.equal(groupInstances(c).length, 3);
  assert.equal(c.instances[2].progression.pillBonuses.speed, 0);
});

test('invalid values, rounded numeric IDs, duplicate identities and false form resolution rejected', () => {
  for (const change of [
    c => { c.instances[0].instanceId = 900719925474099312340; },
    c => { c.instances[0].instanceId = 12; },
    c => { c.instances[0].progression.luck = '0'; },
    ...[-1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1].map(v => c => { c.instances[0].progression.exp = v; }),
    c => { c.instances[0].progression.activeAbilityIds = ['a', 'a']; },
    c => { c.instances[0].progression.activeAbilityIds = Array(1); },
    c => { c.instances = Array(1); },
    c => { c.instances[0].instanceId = c.instances[1].instanceId; },
    c => { c.schemaVersion = 2; },
    c => { c.instances[0].progression.guessed = 0; },
    c => { c.instances[0].provenance.coverage = 'invented'; },
    c => { c.forms[0].versionId = 'other'; },
  ]) {
    const c = collectionFixture(); change(c);
    assert.equal(validateCollection(c).valid, false);
    assert.throws(() => groupInstances(c), TypeError);
  }
});

test('unresolved references retained verbatim and pending, no fallback or grouping', () => {
  for (const field of ['formId', 'versionId']) {
    const c = collectionFixture();
    for (const i of c.instances) i[field] = 'unknown:999999999999999999999999';
    if (field === 'versionId') c.instances.forEach(i => { i.formId = 'unknown:form'; });
    const before = structuredClone(c);
    const result = validateCollection(c);
    assert.equal(result.valid, true);
    assert.ok(result.pendingReferences.some(r => r.rawId === c.instances[0][field] && r.status === 'reference-to-complete'));
    assert.equal(groupInstances(c).length, 3);
    assert.deepEqual(c, before);
  }
});

test('local identity allocated once, serializable and independent of array position', () => {
  const a = createLocalIdentity(), b = createLocalIdentity();
  assert.notEqual(a.instanceId, b.instanceId);
  const c = collectionFixture(); Object.assign(c.instances[0], a);
  const saved = JSON.parse(JSON.stringify(c)); saved.instances.reverse();
  assert.ok(saved.instances.some(i => i.instanceId === a.instanceId && i.identityKind === 'local'));
  assert.equal(validateCollection(saved).valid, true);
});

test('runtime allowlist and application exclude domain and synthetic fixtures', async () => {
  const files = JSON.parse(await readFile(new URL('../SITE_FILES.json', import.meta.url), 'utf8'));
  assert.ok(files.every(f => !f.startsWith('v2/') && !f.startsWith('tests/')));
  for (const file of files.filter(f => f.endsWith('.js'))) {
    assert.doesNotMatch(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'), /fixtures\/v2|v2\/domain/);
  }
});
