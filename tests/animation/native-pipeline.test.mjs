import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { synchronizeTimelines, RML_PROPERTY_KEYS } from '../../scripts/sync-native-timelines.mjs';
import { CHARACTER_IDS } from '../../apps/web/src/animation/core/contracts.mjs';

const source = '<Rive version="1"><Artboard name="Demo" id="0:1" width="720" height="920"><Node id="0:12" name="body" x="32"><Shape id="0:14" name="shape"/></Node><LinearAnimation name="Old" duration="60"/><StateMachine name="Preserved" id="0:20"/></Artboard></Rive>';
const clip = { name: 'Jump', fps: 60, duration: 120, seconds: 2, loop: false, tracks: [
  { target: 'body', property: 'y', interpolation: 'linear', keys: [[0, 0], [60, -100], [120, 0]] },
  { target: 'body', property: 'opacity', interpolation: 'hold', keys: [[0, 1], [120, 1]] },
] };
const parse = value => new DOMParser().parseFromString(value, 'application/xml');
test('motion synchronization replaces timelines using actual named IDs and documented double property keys', () => {
  const result = synchronizeTimelines(source, [clip]), doc = parse(result.rml);
  const animations = Array.from(doc.getElementsByTagName('LinearAnimation'));
  assert.equal(animations.length, 1); assert.equal(animations[0].getAttribute('name'), 'Jump');
  assert.equal(animations[0].getAttribute('duration'), '120'); assert.equal(animations[0].getAttribute('loopValue'), '0');
  assert.equal(doc.getElementsByTagName('KeyedObject')[0].getAttribute('objectId'), '0:12');
  assert.deepEqual(Array.from(doc.getElementsByTagName('KeyedProperty')).map(node => node.getAttribute('propertyKey')), ['14', '18']);
  assert.equal(doc.getElementsByTagName('KeyFrameDouble')[1].getAttribute('value'), '-100');
  assert.deepEqual(result.stats, { animations: 1, tracks: 2, keyframes: 5 });
  assert.equal(new XMLSerializer().serializeToString(doc.getElementsByTagName('Node')[0]), new XMLSerializer().serializeToString(parse(source).getElementsByTagName('Node')[0]));
  assert.equal(doc.getElementsByTagName('StateMachine')[0].getAttribute('id'), '0:20');
  assert.equal(synchronizeTimelines(result.rml, [clip]).rml, result.rml);
  assert.deepEqual(RML_PROPERTY_KEYS, { x: 13, y: 14, rotation: 15, scaleX: 16, scaleY: 17, opacity: 18 });
});
test('ambiguous targets, unsupported channels, duplicate tracks and malformed timing fail before native compilation', () => {
  for (const modify of [
    c => { c.tracks[0].target = 'missing'; },
    c => { c.tracks[0].property = '__proto__'; },
    c => { c.tracks.push(c.tracks[0]); },
    c => { c.tracks[0].keys[1][0] = 0; },
    c => { c.tracks[0].keys[1][1] = Infinity; },
    c => { c.tracks[0].keys.pop(); },
    c => { c.seconds = 9; },
    c => { c.tracks[0].interpolation = 'unknown'; },
  ]) { const value = structuredClone(clip); modify(value); assert.throws(() => synchronizeTimelines(source, [value])); }
  assert.throws(() => synchronizeTimelines(source.replace('<Shape ', '<Node name="body" id="0:19"/><Shape '), [clip]), /Ambiguous/);
});
test('all authoritative mobile targets map to preserved supplied RML nodes', () => {
  for (const slug of CHARACTER_IDS) {
    const rml = readFileSync(new URL(`../../native/rml/${slug}/scene.rml`, import.meta.url), 'utf8');
    const clips = JSON.parse(readFileSync(new URL(`../../apps/web/public/animation/mobile/${slug}/motion.json`, import.meta.url), 'utf8'));
    const result = synchronizeTimelines(rml, clips);
    assert.equal(result.stats.animations, clips.length, slug);
    assert.equal(parse(result.rml).getElementsByTagName('LinearAnimation').length, clips.length, slug);
  }
});
test('WebGL activation remains empty while its browser policy boundary is blocked', () => {
  const boundary = JSON.parse(readFileSync(new URL('../../native/reports/browser-boundary.json', import.meta.url), 'utf8'));
  assert.equal(boundary.status, 'BLOCKED');
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../apps/web/src/animation/rive/verified-assets.json', import.meta.url), 'utf8')), {});
});
