import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { CharacterController, indexNodes, sampleClip } from '../../apps/web/src/animation/mobile/character-controller.mjs';
import * as core from '../../apps/web/src/animation/core/contracts.mjs';
import { ALL_ACTIONS, NEW_ACTIONS, LEGACY_ACTIONS, PERFORMANCES, CHARACTER_PERFORMANCES } from '../../apps/web/src/animation/performances/catalog.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = relative => JSON.parse(readFileSync(resolve(root, relative), 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
const baseline = read('tests/animation/fixtures/v1-baseline.json');
const slugs = ['smartphone', 'flip-phone', 'app-bot', 'pager', 'handheld'];
const oldNames = ['Idle', 'Happy', 'Excited', 'Sad', 'Angry', 'Confused', 'Searching', 'Sassy', 'EyeRoll', 'RudeFlipOff', 'Wave', 'Revived', 'WalkRight', 'WalkLeft'];
const newNames = ['Laugh', 'Proud', 'Shy', 'Suspicious', 'Startled', 'Frustrated', 'Sleepy', 'WakeUp', 'Think', 'Facepalm', 'Shrug', 'PointLeft', 'PointRight', 'Bow', 'Jump', 'Land', 'RunRight', 'RunLeft'];
const expectedNames = [...oldNames, ...newNames];
const assets = Object.fromEntries(slugs.map(slug => [slug, {
  model: read(`apps/web/public/animation/mobile/${slug}/scene.json`),
  clips: read(`apps/web/public/animation/mobile/${slug}/motion.json`),
}]));
const keyOf = track => `${track.target}:${track.property}`;
const near = (a, b, epsilon = 1e-7) => Math.abs(a - b) <= epsilon;
const baseValue = (node, property) => property === 'rotation' ? (node.rotation ?? 0) * Math.PI / 180
  : node[property] ?? (property === 'opacity' || property.startsWith('scale') ? 1 : 0);
const sampleTimes = clip => [...new Set([0, ...Array.from({ length: 40 }, (_, i) => clip.seconds * (i + 1) / 40), clip.seconds, clip.seconds + .5])];

test('portable original fixture contains all five source hashes and seventy original timelines', () => {
  assert.equal(baseline.schemaVersion, 1);
  assert.deepEqual(Object.keys(baseline.characters).sort(), [...slugs].sort());
  for (const source of Object.values(baseline.characters)) {
    assert.match(source.sceneSha256, /^[a-f0-9]{64}$/);
    assert.match(source.originalMotionSha256, /^[a-f0-9]{64}$/);
    assert.equal(source.originalClipCount, 14);
    assert.deepEqual(Object.keys(source.clips), oldNames);
    for (const clip of Object.values(source.clips)) {
      assert.ok(Object.keys(clip.tracks).length > 40);
      for (const sha of Object.values(clip.tracks)) assert.match(sha, /^[a-f0-9]{64}$/);
    }
  }
});

test('catalog, runtime, TypeScript union and public manifest agree on all thirty-two actions', () => {
  assert.deepEqual([...LEGACY_ACTIONS], oldNames);
  assert.deepEqual([...NEW_ACTIONS], newNames);
  assert.deepEqual([...ALL_ACTIONS], expectedNames);
  assert.deepEqual([...core.MOBILE_ACTIONS], expectedNames);
  assert.equal(new Set(ALL_ACTIONS).size, 32);
  const declaration = readFileSync(resolve(root, 'apps/web/src/animation/mobile/types.ts'), 'utf8');
  const union = declaration.match(/export type ActionName\s*=\s*([^;]+);/);
  assert.ok(union, 'ActionName declaration is present');
  assert.deepEqual([...union[1].matchAll(/['"]([A-Za-z]+)['"]/g)].map(match => match[1]), expectedNames);
  const manifest = read('apps/web/public/animation/manifest.json');
  assert.deepEqual(manifest.characters.map(character => character.slug).sort(), [...slugs].sort());
  for (const character of manifest.characters) {
    assert.deepEqual(character.clips.map(clip => clip.name), expectedNames);
    const actual = new Map(assets[character.slug].clips.map(clip => [clip.name, clip]));
    for (const declared of character.clips) {
      const clip = actual.get(declared.name);
      assert.ok(clip, `${character.slug}: ${declared.name} has actual tracks`);
      assert.equal(declared.seconds, clip.seconds);
      assert.equal(declared.loop, clip.loop);
    }
  }
  for (const action of newNames) assert.equal(core.safeAction(action, false), action);
  assert.equal(core.safeAction('RudeFlipOff', false), 'EyeRoll');
  assert.equal(core.safeAction('RudeFlipOff', true), 'RudeFlipOff');
});

for (const slug of slugs) {
  const { model, clips } = assets[slug];
  const nodes = indexNodes(model.root);
  const original = baseline.characters[slug];

  test(`${slug}: original scene bytes, IDs and vector geometry remain unchanged`, () => {
    const bytes = readFileSync(resolve(root, `apps/web/public/animation/mobile/${slug}/scene.json`));
    assert.equal(hash(bytes), original.sceneSha256);
    assert.equal(model.root.id, original.rootId);
    assert.equal(model.width, 720); assert.equal(model.height, 920);
    const visit = node => {
      assert.ok(['group', 'path'].includes(node.type));
      assert.equal(node.href, undefined); assert.equal(node.script, undefined);
      if (node.type === 'path') assert.equal(typeof node.d, 'string');
      for (const child of node.children ?? []) visit(child);
    };
    visit(model.root);
  });

  test(`${slug}: original fourteen clip identities, metadata and every existing track are preserved`, () => {
    for (const [name, saved] of Object.entries(original.clips)) {
      const clip = clips.find(candidate => candidate.name === name);
      assert.ok(clip, `${name} was removed`);
      for (const [key, value] of Object.entries(saved.metadata)) assert.deepEqual(clip[key], value, `${name}.${key} changed`);
      const tracks = new Map(clip.tracks.map(track => [keyOf(track), track]));
      for (const [key, expected] of Object.entries(saved.tracks)) {
        assert.ok(tracks.has(key), `${name}: missing original ${key}`);
        assert.equal(hash(JSON.stringify(tracks.get(key))), expected, `${name}: changed original ${key}`);
      }
      for (const track of clip.tracks) {
        if (Object.hasOwn(saved.tracks, keyOf(track))) continue;
        assert.ok(nodes[track.target], `${name}: reset target exists`);
        const neutral = baseValue(nodes[track.target], track.property);
        assert.ok(track.keys.every(([, value]) => near(value, neutral)), `${name}: additional ${keyOf(track)} must be a constant baseline reset`);
      }
    }
  });

  test(`${slug}: all thirty-two clips have full property resets, ordered keys and finite bounded poses`, () => {
    assert.ok(readFileSync(resolve(root, `apps/web/public/animation/mobile/${slug}/motion.json`)).length <= 2_000_000, 'Motion must fit the actual runtime loader transfer limit');
    core.validateCharacter(model, clips);
    assert.deepEqual(clips.map(clip => clip.name), expectedNames);
    const completeTargets = [...new Set(clips.flatMap(clip => clip.tracks.map(keyOf)))].sort();
    for (const clip of clips) {
      assert.deepEqual(clip.tracks.map(keyOf).sort(), completeTargets, `${clip.name}: stale properties could survive a transition`);
      for (const track of clip.tracks) {
        assert.equal(track.keys[0][0], 0);
        assert.equal(track.keys.at(-1)[0], clip.duration);
        for (let i = 0; i < track.keys.length; i++) {
          const [frame, value] = track.keys[i];
          assert.ok(Number.isFinite(frame) && Number.isFinite(value));
          if (i) assert.ok(frame > track.keys[i - 1][0]);
          if (track.property === 'opacity') assert.ok(value >= 0 && value <= 1, `${clip.name}: opacity range`);
          if (track.property.startsWith('scale')) assert.ok(value > 0 && value <= 2, `${clip.name}: scale must not mirror or collapse the drawing`);
          if (track.property === 'rotation') assert.ok(Math.abs(value) <= Math.PI * 4, `${clip.name}: rotation units/range`);
          if (track.property === 'x' || track.property === 'y') assert.ok(Math.abs(value) <= 1000, `${clip.name}: unbounded local translation`);
          if (newNames.includes(clip.name) && track.target === 'body-bob' && track.property === 'x') assert.ok(Math.abs(value) < 20, `${clip.name}: body drift exceeds the acting envelope`);
          if (newNames.includes(clip.name) && track.target === 'body-bob' && track.property === 'y') assert.ok(value > -75 && value < 35, `${clip.name}: body jump/compression exceeds the acting envelope`);
          if (['character', 'travel-root', 'rig-root'].includes(track.target) && track.property.startsWith('scale')) assert.equal(value, baseValue(nodes[track.target], track.property), 'Host travel must not mirror lettering');
        }
        if (newNames.includes(clip.name) && clip.loop) assert.ok(near(track.keys[0][1], track.keys.at(-1)[1], 1e-4), `${clip.name}: loop seam ${keyOf(track)}`);
      }
      for (const time of sampleTimes(clip)) for (const values of Object.values(sampleClip(clip, time))) for (const value of Object.values(values)) assert.ok(Number.isFinite(value));
    }
  });

  test(`${slug}: new gestures have visible pose changes at catalog peaks and different movement tracks`, () => {
    const signatures = new Set();
    for (const name of newNames) {
      const clip = clips.find(candidate => candidate.name === name);
      assert.ok(clip, `${name} is not generated yet`);
      const peak = PERFORMANCES[name].peakSeconds;
      assert.ok(peak > 0 && peak < clip.seconds, `${name}: representative time lies within actual clip`);
      const first = sampleClip(clip, 0), pose = sampleClip(clip, peak);
      let changedTargets = new Set();
      for (const [target, values] of Object.entries(pose)) for (const [property, value] of Object.entries(values)) {
        const start = first[target]?.[property] ?? baseValue(nodes[target], property);
        const threshold = property === 'rotation' ? .035 : property === 'opacity' ? .4 : property.startsWith('scale') ? .1 : 2;
        if (Math.abs(value - start) >= threshold) changedTargets.add(target);
      }
      assert.ok(changedTargets.size >= 2, `${name}: peak must change at least two rig layers materially`);
      const animated = clip.tracks.filter(track => track.keys.some(([, value]) => !near(value, track.keys[0][1], 1e-4)));
      assert.ok(animated.length >= 4, `${name}: actual multi-layer motion required`);
      signatures.add(movementSignature(model, clip));
    }
    assert.equal(signatures.size, 18, 'Action names must correspond to distinct motion, not relabeled copies');
    const sleepy = clips.find(clip => clip.name === 'Sleepy'), wake = clips.find(clip => clip.name === 'WakeUp');
    assert.deepEqual(sampleClip(sleepy, sleepy.seconds), sampleClip(wake, 0), 'The sleep-to-wake sequence must share its joining pose');
  });

  test(`${slug}: new actions keep limb connections and readable stage-space pivots`, () => {
    for (const clip of clips.filter(candidate => newNames.includes(candidate.name))) for (const time of sampleTimes(clip)) {
      const positions = worldTransforms(model.root, sampleClip(clip, time));
      for (const side of ['left', 'right']) for (const [joint, end] of [[`thigh-${side}`, `knee-${side}`], [`calf-${side}`, `ankle-${side}`], [`upper-arm-${side}`, `elbow-${side}`], [`forearm-${side}`, `wrist-${side}`]]) {
        const a = positions[joint], b = positions[end];
        const expectedLength = Math.hypot(nodes[end].x ?? 0, nodes[end].y ?? 0);
        assert.ok(near(Math.hypot(a[4] - b[4], a[5] - b[5]), expectedLength, .01), `${clip.name}@${time}: ${joint} length changed`);
      }
      for (const target of ['face', 'wrist-left', 'wrist-right', 'ankle-left', 'ankle-right']) {
        const [, , , , x, y] = positions[target];
        assert.ok(x >= -36 && x <= 756 && y >= -92 && y <= 1012, `${clip.name}@${time}: ${target} pivot is outside the stage guard band`);
      }
    }
  });

  test(`${slug}: action transitions clear imperative poses and destruction releases owned resources`, () => {
    withFakeBrowser(environment => {
      const svg = fakeSvg(model);
      const controller = new CharacterController(svg, model, clips, { externalClock: true });
      for (const name of [...newNames, ...oldNames]) {
        const clip = clips.find(candidate => candidate.name === name);
        assert.ok(clip);
        controller.setAction(name);
        for (let i = 0; i < 4; i++) controller.advance(.1);
        const freshSvg = fakeSvg(model);
        const fresh = new CharacterController(freshSvg, model, clips, { action: name, externalClock: true });
        fresh.seek(.4);
        assert.deepEqual(svg.snapshot(), freshSvg.snapshot(), `${name}: previous action left stale SVG attributes`);
        fresh.destroy();
        controller.seek(Math.min(clip.seconds * .6, 2));
      }
      controller.setLayerVisible('device-body', false);
      controller.destroy();
      assert.equal(svg.nodes['device-body'].style.display, '');
      assert.equal(environment.frames.size, 0);
      assert.ok(environment.observers.every(observer => observer.disconnected));
      assert.equal(environment.mediaListeners.size, 0);
      assert.equal(environment.documentListeners.size, 0);
      const snapshot = svg.snapshot();
      controller.advance(.1); controller.seek(3);
      assert.deepEqual(svg.snapshot(), snapshot, 'destroyed controller must not mutate its former SVG');
    });
  });
}

test('character personalities differ in sampled motion after geometry offsets and metadata are removed', () => {
  assert.deepEqual(Object.keys(CHARACTER_PERFORMANCES).sort(), [...slugs].sort());
  for (const action of newNames) {
    const signatures = slugs.map(slug => {
      const clip = assets[slug].clips.find(candidate => candidate.name === action);
      assert.ok(clip, `${slug}: ${action} is not generated yet`);
      return movementSignature(assets[slug].model, clip);
    });
    assert.equal(new Set(signatures).size, 5, `${action}: five labels must have five actual acting profiles`);
  }
});

test('completed one-shots stop scheduling frames and a fresh action rearms playback', () => {
  const { model, clips } = assets.smartphone;
  assert.ok(clips.some(clip => clip.name === 'Land'));
  withFakeBrowser(environment => {
    let completions = 0;
    const player = new CharacterController(fakeSvg(model), model, clips, { action: 'Land', onComplete: () => completions++ });
    let timestamp = 1000;
    for (let i = 0; i < 100 && environment.frames.size; i++) { environment.runFrame(timestamp); timestamp += 100; }
    assert.equal(completions, 1);
    assert.equal(player.complete, true);
    assert.equal(environment.frames.size, 0, 'A completed nonlooping action must stop requesting animation frames');
    player.seek(.2);
    assert.equal(player.complete, false);
    assert.equal(environment.frames.size, 1, 'Seeking back into a completed action rearms unpaused playback');
    player.setAction('RunRight');
    assert.equal(player.complete, false);
    assert.equal(environment.frames.size, 1);
    player.pause(); assert.equal(environment.frames.size, 0);
    player.setAction('Wave'); assert.equal(environment.frames.size, 0, 'changing action preserves explicit pause');
    player.resume(); assert.equal(environment.frames.size, 1);
    environment.media.matches = true;
    for (const listener of environment.mediaListeners) listener();
    assert.equal(environment.frames.size, 0, 'reduced motion stops scheduling');
    player.destroy();
  });
});

test('reduced motion displays the catalog Sleepy and Startled peaks without scheduling frames', () => {
  const { model, clips } = assets.smartphone;
  withFakeBrowser(environment => {
    environment.media.matches = true;
    const svg = fakeSvg(model);
    const rendered = [];
    const player = new CharacterController(svg, model, clips, { action: 'Sleepy', onRender: frame => rendered.push(frame) });
    for (const action of ['Sleepy', 'Startled']) {
      player.setAction(action);
      const clip = clips.find(candidate => candidate.name === action);
      const peak = PERFORMANCES[action].peakSeconds;
      assert.equal(rendered.at(-1).time, peak);
      assert.equal(svg.dataset.action, action);
      assert.deepEqual(player.pose, sampleClip(clip, peak), `${action}: reduced motion must show the expressive peak`);
      assert.equal(environment.frames.size, 0);
      const snapshot = svg.snapshot();
      player.advance(.1);
      assert.deepEqual(svg.snapshot(), snapshot, 'reduced pose remains still');
    }
    player.destroy();
    assert.equal(environment.frames.size, 0);
  });
});

test('upgraded native evidence, when supplied, names all thirty-two actions and binds to actual bytes', t => {
  const relative = 'native/canvas-verified-assets.json';
  if (!existsSync(resolve(root, relative))) { t.skip('BLOCKED: upgraded native runtime evidence has not been supplied'); return; }
  const records = read(relative);
  if (!Object.values(records).some(record => record.animations?.some(name => newNames.includes(name)))) {
    t.skip('BLOCKED: retained fourteen-action native evidence does not verify this upgrade'); return;
  }
  for (const slug of slugs) {
    const record = records[slug];
    assert.ok(record, `${slug}: missing upgraded native evidence`);
    assert.equal(record.status, 'canvas-runtime-verified');
    assert.deepEqual([...record.animations].sort(), [...expectedNames].sort());
    assert.equal(record.actionCount, expectedNames.length);
    assert.ok(Number.isInteger(record.sampleCount) && record.sampleCount >= expectedNames.length * 2);
    assert.match(record.sha256, /^[a-f0-9]{64}$/);
    assert.ok(record.runtimeVersion && record.testedAt);
    assert.ok(Number.isFinite(Date.parse(record.testedAt)));
    assert.notEqual(record.browserWebGLVerified, true, 'Node/Canvas evidence cannot claim the policy-blocked browser verification');
    assert.equal(record.src, `/animation/rive/${slug}.riv`);
    assert.equal(hash(readFileSync(resolve(root, `apps/web/public${record.src}`))), record.sha256);
    assert.equal(hash(readFileSync(resolve(root, `apps/web/public/animation/mobile/${slug}/motion.json`))), record.motionSHA256,
      `${slug}: native evidence must refer to the current motion source`);
  }
});

function movementSignature(model, clip) {
  const nodes = indexNodes(model.root);
  const targets = ['body-bob', 'torso-roll', 'device-body', 'upper-arm-left', 'upper-arm-right', 'forearm-left', 'forearm-right', 'brow-left', 'brow-right', 'eye-left', 'eye-right'];
  const values = [];
  for (const fraction of [.13, .29, .47, .68, .86]) {
    const pose = sampleClip(clip, clip.seconds * fraction);
    for (const target of targets) for (const property of ['x', 'y', 'rotation', 'scaleY']) {
      const neutral = baseValue(nodes[target], property);
      values.push(Math.round(((pose[target]?.[property] ?? neutral) - neutral) * 1000) / 1000);
    }
  }
  return hash(JSON.stringify(values));
}

function worldTransforms(rootNode, pose) {
  const result = {};
  const multiply = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  function visit(node, parent) {
    const p = pose[node.id] ?? {};
    const angle = p.rotation ?? baseValue(node, 'rotation');
    const sx = p.scaleX ?? node.scaleX ?? 1, sy = p.scaleY ?? node.scaleY ?? 1;
    const matrix = [Math.cos(angle) * sx, Math.sin(angle) * sx, -Math.sin(angle) * sy, Math.cos(angle) * sy, p.x ?? node.x ?? 0, p.y ?? node.y ?? 0];
    const world = multiply(parent, matrix);
    result[node.id] = world;
    for (const child of node.children ?? []) visit(child, world);
  }
  visit(rootNode, [1, 0, 0, 1, 0, 0]);
  return result;
}

function fakeSvg(model) {
  const nodes = Object.fromEntries(Object.entries(indexNodes(model.root)).map(([id, source]) => {
    const attributes = new Map([['transform', `translate(${source.x ?? 0} ${source.y ?? 0}) rotate(${source.rotation ?? 0}) scale(${source.scaleX ?? 1} ${source.scaleY ?? 1})`], ['opacity', String(source.opacity ?? 1)]]);
    return [id, { dataset: { rigId: id }, attributes, style: { display: '', removeProperty(name) { if (name === 'display') this.display = ''; } }, setAttribute(key, value) { attributes.set(key, String(value)); } }];
  }));
  return { localName: 'svg', dataset: {}, nodes, querySelectorAll: () => Object.values(nodes), snapshot: () => Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, Object.fromEntries(node.attributes)])) };
}

function withFakeBrowser(run) {
  const names = ['window', 'document', 'requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver'];
  const saved = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const frames = new Map(), mediaListeners = new Set(), documentListeners = new Set(), observers = [];
  let nextFrame = 1;
  const media = { matches: false, addEventListener: (_, callback) => mediaListeners.add(callback), removeEventListener: (_, callback) => mediaListeners.delete(callback) };
  class Observer { constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } }
  const values = {
    window: { matchMedia: () => media, IntersectionObserver: Observer },
    document: { hidden: false, addEventListener: (_, callback) => documentListeners.add(callback), removeEventListener: (_, callback) => documentListeners.delete(callback) },
    requestAnimationFrame: callback => { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id), IntersectionObserver: Observer,
  };
  for (const [name, value] of Object.entries(values)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  try {
    run({ frames, media, mediaListeners, documentListeners, observers, runFrame(timestamp) { const [id, callback] = frames.entries().next().value; frames.delete(id); callback(timestamp); } });
  } finally {
    for (const [name, descriptor] of saved) if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
  }
}
