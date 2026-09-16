import test from 'node:test';
import assert from 'node:assert/strict';
import { auditArchitecture } from '../../scripts/check-architecture.mjs';
import { WORKSHOP_STORIES } from '../../apps/web/src/animation/performances/workshop.ts';
import { STAGE_SHOWS } from '../../apps/web/src/animation/performances/stage-shows.ts';
import { MOBILE_ACTIONS, DESKTOP_STATES } from '../../apps/web/src/animation/core/contracts.mjs';
import { ROUTES } from '../../packages/site/content.ts';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('browser runtime, animation, shared content and API respect their source boundaries', () => {
  const result = auditArchitecture();
  assert.ok(result.checkedBrowserModules > 30);
  assert.deepEqual(result.violations, []);
});

test('browser import boundaries reject protected JSON and raw assets, not just executable modules', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'tsc-architecture-'));
  try {
    for (const directory of ['apps/web/src/animation', 'apps/web/src/styles', 'apps/web/public', 'apps/api/src', 'packages/site', 'private', 'native']) mkdirSync(join(fixture, directory), { recursive: true });
    writeFileSync(join(fixture, 'apps/web/src/entry-client.tsx'), "import secret from '../../../private/config.json'; import raw from '../../../native/candidate.riv?raw'; console.log(secret, raw);");
    writeFileSync(join(fixture, 'apps/web/src/styles/site.css'), '');
    writeFileSync(join(fixture, 'private/config.json'), '{}');
    writeFileSync(join(fixture, 'native/candidate.riv'), 'test fixture, not a renderer');
    const result = auditArchitecture(fixture);
    assert.equal(result.violations.length, 2);
    assert.ok(result.violations.some(message => message.includes('private/config.json')));
    assert.ok(result.violations.some(message => message.includes('native/candidate.riv')));
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

test('plain JavaScript and JSX bridges cannot hide private imports from the architecture gate', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'tsc-architecture-js-'));
  try {
    for (const directory of ['apps/web/src/animation', 'apps/web/src/styles', 'apps/web/public', 'apps/api/src', 'packages/site', 'private']) mkdirSync(join(fixture, directory), { recursive: true });
    writeFileSync(join(fixture, 'apps/web/src/entry-client.tsx'), "import { secret } from './bridge'; globalThis.fixture = secret;");
    writeFileSync(join(fixture, 'apps/web/src/bridge.js'), "export { secret } from './view.jsx';");
    writeFileSync(join(fixture, 'apps/web/src/view.jsx'), "import secret from '../../../private/config.json'; export { secret }; export const view = <div />;");
    writeFileSync(join(fixture, 'apps/web/src/styles/site.css'), '');
    writeFileSync(join(fixture, 'private/config.json'), '{}');
    const result = auditArchitecture(fixture);
    assert.ok(result.violations.some(message => message.includes('private/config.json')), 'An executable JavaScript bridge must not conceal a protected JSON import');
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

for (const [specifier, source] of [['bridge.jsx', 'bridge.tsx'], ['bridge.mjs', 'bridge.mts'], ['bridge.cjs', 'bridge.cts']]) {
  test(`TypeScript source behind ${specifier} cannot conceal a protected import`, () => {
    const fixture = mkdtempSync(join(tmpdir(), 'tsc-architecture-ts-output-'));
    try {
      for (const directory of ['apps/web/src/animation', 'apps/web/src/styles', 'apps/web/public', 'apps/api/src', 'packages/site', 'private']) mkdirSync(join(fixture, directory), { recursive: true });
      writeFileSync(join(fixture, 'apps/web/src/entry-client.tsx'), `import { secret } from './${specifier}'; globalThis.fixture = secret;`);
      writeFileSync(join(fixture, `apps/web/src/${source}`), "import secret from '../../../private/config.json'; export { secret };");
      writeFileSync(join(fixture, 'apps/web/src/styles/site.css'), '');
      writeFileSync(join(fixture, 'private/config.json'), '{}');
      const result = auditArchitecture(fixture);
      assert.ok(result.violations.some(message => message.includes('private/config.json')), `${specifier} must resolve to its TypeScript source before traversing dependencies`);
    } finally { rmSync(fixture, { recursive: true, force: true }); }
  });
}

test('browser imports of provider request adapters are rejected even when they contain no Node builtins', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'tsc-architecture-provider-'));
  try {
    for (const directory of ['apps/web/src/animation', 'apps/web/src/styles', 'apps/web/public', 'apps/api/src', 'packages/discovery/providers/openai']) mkdirSync(join(fixture, directory), { recursive: true });
    writeFileSync(join(fixture, 'apps/web/src/entry-client.tsx'), "import { adapter } from '../../../packages/discovery/providers/openai/answers.ts'; globalThis.fixture = adapter;");
    writeFileSync(join(fixture, 'packages/discovery/providers/openai/answers.ts'), "export const adapter = { build: () => ({ input: 'synthetic' }) };");
    writeFileSync(join(fixture, 'apps/web/src/styles/site.css'), '');
    const result = auditArchitecture(fixture);
    assert.ok(result.violations.some(message => message.includes('private discovery integration')), 'Provider request implementations belong exclusively to the private integration');
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

test('authored stories are finite, use real rig performances and link only to real pages', () => {
  const paths = new Set(ROUTES.map(page => page.path));
  for (const story of Object.values(WORKSHOP_STORIES)) {
    assert.ok(story.beats.length > 1 && story.beats.length <= 8);
    for (const beat of story.beats) {
      assert.ok(MOBILE_ACTIONS.includes(beat.mobile));
      assert.ok(DESKTOP_STATES.includes(beat.desktop));
      assert.ok(beat.seconds > 0 && beat.seconds <= 8);
      if ('destination' in beat) assert.ok(paths.has(beat.destination));
      assert.doesNotMatch(beat.desktop, /flip-off/);
    }
  }
  for (const show of Object.values(STAGE_SHOWS)) {
    assert.ok(show.steps.length <= 12);
    for (const step of show.steps) {
      assert.ok(MOBILE_ACTIONS.includes(step.action));
      assert.notEqual(step.action, 'RudeFlipOff');
      if ('target' in step) assert.ok(step.target >= 0 && step.target <= 1);
    }
  }
});
