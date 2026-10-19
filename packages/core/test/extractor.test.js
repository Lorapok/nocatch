import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNotebookInput, NOTEBOOK_REGEX, UUID_REGEX } from '../src/extractor.js';

test('parseNotebookInput - full artifact URL', () => {
  const url = 'https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d';
  const result = parseNotebookInput(url);
  assert.equal(result.notebookId, '8b88ac32-9785-489b-a224-9d95864fddca');
  assert.equal(result.artifactId, '48e08424-d530-4d98-990c-a08dce8e015d');
});

test('parseNotebookInput - notebookLM domain URL with query params', () => {
  const url = 'https://notebooklm.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca?utm_source=nlmm_share';
  const result = parseNotebookInput(url);
  assert.equal(result.notebookId, '8b88ac32-9785-489b-a224-9d95864fddca');
  assert.ok(result.artifactId, 'artifactId should be resolved from known studios or fallback');
});

test('parseNotebookInput - direct UUID', () => {
  const uuid = '48e08424-d530-4d98-990c-a08dce8e015d';
  const result = parseNotebookInput(uuid);
  assert.equal(result.artifactId, uuid);
});

test('parseNotebookInput - invalid input throws', () => {
  assert.throws(() => parseNotebookInput('https://example.com/not-a-notebook'), /Unable to recognize Google Notebook/);
  assert.throws(() => parseNotebookInput(''), /Input URL or ID string is required/);
  assert.throws(() => parseNotebookInput(null), /Input URL or ID string is required/);
});
