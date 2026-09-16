import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {evidenceDirectory} from '../../packages/discovery/evidence.ts';
test('private evidence is anchored to a validated project root, never caller cwd or public output',()=>{
  const root=resolve(import.meta.dirname,'../..');
  assert.equal(evidenceDirectory(root),resolve(root,'.build/discovery'));
  assert.throws(()=>evidenceDirectory(resolve(root,'apps/web/dist')),/project root/);
});
