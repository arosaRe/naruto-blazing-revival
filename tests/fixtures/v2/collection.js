// Synthetic only. Not imported by the application or included in SITE_FILES.json.
export function collectionFixture() {
  const provenance = { source: 'synthetic-test', coverage: 'complete', observedAt: null };
  return {
    schemaVersion: 1,
    versions: [{ versionId: 'fiction:version', provenance }],
    forms: ['fiction:form', 'fiction:evolved'].map(formId => ({ formId, versionId: 'fiction:version', provenance })),
    instances: ['900719925474099312340', '900719925474099312341', '900719925474099312342'].map(instanceId => ({
      instanceId, identityKind: 'external', versionId: 'fiction:version', formId: 'fiction:form', provenance,
      progression: { level: 70, exp: 0, unlockedLevelCap: 100, activeAbilityIds: ['ability:b', 'ability:a'], luck: 0,
        pillBonuses: { hp: 0, attack: 0, speed: 0 }, totalStats: { hp: 1000, attack: 500, speed: 100 } },
    })),
  };
}
