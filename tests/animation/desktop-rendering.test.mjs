import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDesktopProofSession, rasterizeDesktop, sha256 } from '../../scripts/render-desktop-preview.mjs';
import { DESKTOP_PERFORMANCES } from '../../apps/web/src/animation/desktop/performances.mjs';

const rig = (session, id) => session.controller.nodes[id];

test('actual desktop geometry/controller renders all 32 distinct states with deterministic seeks', async () => {
  const beforeDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const beforeWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const session = await createDesktopProofSession();
  try {
    assert.equal(DESKTOP_PERFORMANCES.length, 32);
    assert.equal(Object.getOwnPropertyDescriptor(globalThis, 'window'), beforeWindow, 'No window or browser engine is constructed');
    const signatures = new Set();
    const shellIds = ['tower-front', 'optical-tray', 'side-intake-apertures', 'floppy-face', 'power-symbol'];
    const originalShell = shellIds.map(id => [id, rig(session, id).getAttribute('d')]);
    for (const performance of DESKTOP_PERFORMANCES) {
      const frame = session.render(performance.id, performance.peakSeconds);
      assert.equal(frame.snapshot.state, performance.id);
      assert.equal(frame.snapshot.age, performance.peakSeconds);
      assert(!/NaN|Infinity|undefined/.test(frame.svg));
      assert(frame.svg.includes('data-rig-id="cable-path"'));
      signatures.add(frame.sha256);
      for (const [id, d] of originalShell) assert.equal(rig(session, id).getAttribute('d'), d, `${performance.id} preserves ${id}`);
      session.render('idle', 0.2);
      assert.equal(session.render(performance.id, performance.peakSeconds).sha256, frame.sha256, `${performance.id} resets deterministically`);
    }
    assert.equal(signatures.size, 32);
    assert.throws(() => requestAnimationFrame(() => {}), /external controller clock/);
  } finally { session.close(); }
  assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, 'document'), beforeDocument);
  assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, 'window'), beforeWindow);
});

test('actual desktop SVG rasterization keeps all 32 peak poses inside the frame with distinct gestures', async () => {
  const session = await createDesktopProofSession();
  try {
    const hashes = new Set();
    for (const performance of DESKTOP_PERFORMANCES) {
      const id = performance.id;
      const frame = session.render(id, performance.peakSeconds);
      const canvas = await rasterizeDesktop(frame.svg, { width: 640, height: 640, background: null });
      const data = canvas.getContext('2d').getImageData(0, 0, 640, 640).data;
      let visible = 0;
      for (let pixel = 3; pixel < data.length; pixel += 4) if (data[pixel] > 0) visible++;
      assert(visible > 50000, `${id}: original CRT drawing must occupy a substantial frame area`);
      let clipped = 0;
      for (let edge = 0; edge < 640; edge++) {
        for (const pixel of [edge, 639 * 640 + edge, edge * 640, edge * 640 + 639]) if (data[pixel * 4 + 3] > 0) clipped++;
      }
      assert.equal(clipped, 0, `${id}: no art may touch the capture boundary at the authored peak`);
      if (['idle', 'facepalm', 'rude-flip-off', 'double-flip-off', 'demo-invite'].includes(id)) hashes.add(sha256(data));
    }
    assert.equal(hashes.size, 5, 'Real raster outputs differ for selected actions');
  } finally { session.close(); }
});

test('offline proof keeps direct rude requests gated and the inherited browser policy blocked', async () => {
  const session = await createDesktopProofSession({ attitudeEnabled: false });
  try {
    for (const id of ['rude-flip-off', 'double-flip-off']) assert.equal(session.render(id, 2).snapshot.state, 'eye-roll');
  } finally { session.close(); }
  const boundary = JSON.parse(readFileSync(new URL('../../native/reports/browser-boundary.json', import.meta.url)));
  assert.equal(boundary.status, 'BLOCKED');
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../apps/web/src/animation/rive/verified-assets.json', import.meta.url))), {});
});
