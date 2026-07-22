import assert from 'node:assert/strict';
import test from 'node:test';

import { validateReferenceTree, validateRegistry } from './validate.mjs';

function registryFor(screens) {
  return { version: 1, screenCount: screens.length, screens };
}

function screen(overrides = {}) {
  return {
    id: 'seeker-discover-card',
    role: 'seeker',
    sourceImage: '5.png',
    sourcePanel: 2,
    components: ['OpportunityCard'],
    referenceStatus: 'source-export-required',
    ...overrides,
  };
}

test('test_validate_registry_reports_source_export_gate', () => {
  const result = validateRegistry(registryFor([screen()]));

  assert.deepEqual(result.errors, []);
  assert.equal(result.status, 'source-export-required');
  assert.equal(result.sourceExportRequired, 1);
});

test('test_validate_registry_rejects_duplicate_id_and_invalid_panel', () => {
  const result = validateRegistry(registryFor([
    screen(),
    screen({ sourcePanel: 5 }),
  ]));

  assert.deepEqual(result.errors, [
    'Duplicate screen id: seeker-discover-card.',
    'Invalid source panel for seeker-discover-card: 5.',
  ]);
});

test('test_validate_registry_rejects_screen_count_drift', () => {
  const result = validateRegistry({
    ...registryFor([screen()]),
    screenCount: 2,
  });

  assert.deepEqual(result.errors, ['Registry screenCount does not match screens length.']);
});

test('test_validate_reference_tree_requires_flat_reference_for_ready_screen', async () => {
  const readyScreen = screen({ referenceStatus: 'ready' });
  const result = await validateReferenceTree([readyScreen], async () => false);

  assert.deepEqual(result, [
    'Missing specification for seeker-discover-card.',
    'Missing screen audit for seeker-discover-card.',
    'Missing flat reference for ready screen seeker-discover-card.',
  ]);
});

test('test_validate_reference_tree_allows_source_gated_screen_without_reference', async () => {
  const result = await validateReferenceTree([screen()], async () => true);

  assert.deepEqual(result, []);
});
