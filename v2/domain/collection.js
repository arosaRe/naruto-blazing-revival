// Internal contract only: these names do not describe an official game API.
export const SCHEMA_VERSION = 1;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = value => typeof value === 'string' && value.length > 0;
const integer = value => Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0);
const own = (value, key) => Object.hasOwn(value, key);
const progressionFields = ['level', 'exp', 'unlockedLevelCap', 'activeAbilityIds', 'luck', 'pillBonuses', 'totalStats'];
const stats = ['hp', 'attack', 'speed'];

/** Allocate once, then retain this ID with the instance. No anonymous-list reconciliation. */
export function createLocalIdentity() {
  return { instanceId: `local:${globalThis.crypto.randomUUID()}`, identityKind: 'local' };
}

/** Validate without rewriting the candidate. Unknown references are pending, not errors. */
export function validateCollection(value) {
  const errors = [];
  const pendingReferences = [];
  const fail = (path, message) => errors.push({ path, message });
  const checkId = (v, path) => { if (!id(v)) fail(path, 'Expected a nonempty opaque string ID'); };
  const fields = (v, allowed, path) => {
    for (const key of Object.keys(v)) if (!allowed.includes(key)) fail(`${path}.${key}`, 'Unsupported field');
  };
  const provenance = (v, path) => {
    if (!object(v) || !id(v.source) || !['complete', 'partial', 'unknown'].includes(v.coverage)) {
      fail(path, 'Expected source and explicit coverage');
    }
  };
  if (!object(value)) return { valid: false, errors: [{ path: '$', message: 'Expected object' }], pendingReferences };
  fields(value, ['schemaVersion', 'versions', 'forms', 'instances'], '$');
  if (value.schemaVersion !== SCHEMA_VERSION) fail('schemaVersion', 'Unsupported internal schema version');
  for (const key of ['versions', 'forms', 'instances']) {
    if (!Array.isArray(value[key]) || [...value[key]].some(entry => !object(entry))) fail(key, 'Expected array of objects without holes');
  }
  if (errors.length) return { valid: false, errors, pendingReferences };
  const maps = {};
  for (const [key, identity] of [['versions', 'versionId'], ['forms', 'formId'], ['instances', 'instanceId']]) {
    maps[key] = new Map();
    value[key].forEach((entry, index) => {
      const path = `${key}[${index}]`;
      if (!object(entry)) { fail(path, 'Expected object'); return; }
      checkId(entry[identity], `${path}.${identity}`);
      if (maps[key].has(entry[identity])) fail(path, 'Duplicate identity');
      maps[key].set(entry[identity], entry);
      provenance(entry.provenance, `${path}.provenance`);
    });
  }
  const reference = (key, rawId, path) => {
    if (rawId === null || rawId === undefined) {
      pendingReferences.push({ path, rawId, status: 'reference-to-complete' }); return;
    }
    checkId(rawId, path);
    if (id(rawId) && !maps[key].has(rawId)) pendingReferences.push({ path, rawId, status: 'reference-to-complete' });
  };
  value.versions.forEach((v, i) => { if (object(v)) fields(v, ['versionId', 'provenance'], `versions[${i}]`); });
  value.forms.forEach((f, i) => {
    if (!object(f)) return;
    fields(f, ['formId', 'versionId', 'provenance'], `forms[${i}]`);
    reference('versions', f.versionId, `forms[${i}].versionId`);
  });
  value.instances.forEach((instance, i) => {
    if (!object(instance)) return;
    const path = `instances[${i}]`;
    fields(instance, ['instanceId', 'identityKind', 'versionId', 'formId', 'progression', 'provenance', 'technical'], path);
    if (!['external', 'local'].includes(instance.identityKind)) fail(`${path}.identityKind`, 'Expected external or local');
    reference('versions', instance.versionId, `${path}.versionId`);
    reference('forms', instance.formId, `${path}.formId`);
    const form = maps.forms.get(instance.formId);
    if (form && id(form.versionId) && id(instance.versionId) && form.versionId !== instance.versionId) fail(path, 'Form belongs to another version');
    if (own(instance, 'technical') && !object(instance.technical)) fail(`${path}.technical`, 'Expected metadata object');
    const p = instance.progression;
    if (!object(p)) { fail(`${path}.progression`, 'Expected progression object'); return; }
    fields(p, progressionFields, `${path}.progression`);
    for (const key of progressionFields) {
      if (!own(p, key) || p[key] === null) continue;
      const v = p[key];
      if (key === 'activeAbilityIds') {
        if (!Array.isArray(v) || [...v].some(x => !id(x)) || new Set(v).size !== v.length) fail(`${path}.progression.${key}`, 'Expected unique opaque ability IDs');
      } else if (['pillBonuses', 'totalStats'].includes(key)) {
        if (!object(v)) { fail(`${path}.progression.${key}`, 'Expected stat object'); continue; }
        fields(v, stats, `${path}.progression.${key}`);
        for (const stat of stats) if (own(v, stat) && v[stat] !== null && !integer(v[stat])) fail(`${path}.progression.${key}.${stat}`, 'Expected safe nonnegative integer or null');
      } else if (!integer(v)) fail(`${path}.progression.${key}`, 'Expected safe nonnegative integer or null');
    }
    if (integer(p.level) && integer(p.unlockedLevelCap) && p.level > p.unlockedLevelCap) fail(path, 'Level exceeds unlocked cap');
  });
  return { valid: errors.length === 0, errors, pendingReferences };
}

/** Pure visual grouping. Members are the original real instances, never composites. */
export function groupInstances(collection) {
  const validation = validateCollection(collection);
  if (!validation.valid) throw new TypeError(`Invalid collection: ${JSON.stringify(validation.errors)}`);
  const versions = new Set(collection.versions.map(v => v.versionId));
  const forms = new Map(collection.forms.map(f => [f.formId, f]));
  const groups = new Map();
  for (const instance of collection.instances) {
    const p = instance.progression;
    const complete = versions.has(instance.versionId) && forms.get(instance.formId)?.versionId === instance.versionId &&
      progressionFields.every(key => own(p, key) && p[key] !== null &&
        (!['pillBonuses', 'totalStats'].includes(key) || stats.every(stat => own(p[key], stat) && p[key][stat] !== null)));
    const signature = complete ? JSON.stringify([instance.versionId, instance.formId,
      ...progressionFields.map(key => key === 'activeAbilityIds' ? [...p[key]].sort() :
        ['pillBonuses', 'totalStats'].includes(key) ? stats.map(stat => p[key][stat]) : p[key])]) : null;
    const key = JSON.stringify(signature === null ? ['instance', instance.instanceId] : ['equal', signature]);
    if (!groups.has(key)) groups.set(key, { groupId: key, members: [] });
    groups.get(key).members.push(instance);
  }
  return [...groups.values()].sort((a, b) => a.groupId.localeCompare(b.groupId)).map(group => ({
    ...group, members: [...group.members].sort((a, b) => a.instanceId.localeCompare(b.instanceId)), count: group.members.length,
  }));
}
