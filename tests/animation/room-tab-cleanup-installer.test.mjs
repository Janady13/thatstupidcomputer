import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanupWorkshop, removeRoomNavigation } from '../../scripts/apply-room-tab-cleanup.mjs';

const before = `// Claude's edited full-room layout — é🤖\r\nexport const Workshop = () => <div style={{top:96}}><RoomScene />\r\n<nav className="room-navigation" aria-label="Explore">{items.map(item => <a onMouseEnter={openDrawer}>{item.tip}</a>)}</nav>\r\n<ComputerConversation /><a href="/contact/">Demo</a></div>;\r\n`;
const fragment = '<nav className="room-navigation" aria-label="Explore">{items.map(item => <a onMouseEnter={openDrawer}>{item.tip}</a>)}</nav>';
function fixture(t) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'tsc-room-cleanup-')); t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'apps/web/src/components'), { recursive: true });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'thatstupidcomputer' }));
  const path = join(root, 'apps/web/src/components/Workshop.tsx'); writeFileSync(path, before);
  return { targetRoot: root, path };
}
test('AST removal preserves all surrounding Claude edits, line endings and remaining navigation byte-for-byte', () => {
  const result = removeRoomNavigation(before);
  assert.equal(result.source, before.replace(fragment, ''));
  assert.match(result.source, /top:96/); assert.match(result.source, /<RoomScene \/>/);
  assert.match(result.source, /<ComputerConversation \/>/); assert.match(result.source, /href="\/contact\/"/);
  assert.doesNotMatch(result.source, /onMouseEnter|item.tip/);
  assert.equal(removeRoomNavigation(result.source).status, 'already-clean');
});
test('literal class expressions and expression-valued navs are removed without invalid TSX', () => {
  assert.equal(removeRoomNavigation('export const x = show && <nav className={"room-navigation extra"}>Tabs</nav>;').source, 'export const x = show && null;');
  assert.equal(removeRoomNavigation('export const x = <><nav className={`room-navigation`}/><nav className="main-navigation"/></>;').source, 'export const x = <><nav className="main-navigation"/></>;');
});
test('malformed, duplicate, spread and dynamic matching markup blocks rather than guessing', () => {
  for (const source of [
    'const x = <nav',
    'const x = <><nav className="room-navigation"/><nav className="room-navigation"/></>;',
    'const x = <nav {...props} className="room-navigation"/>;',
    'const x = <nav className="room-navigation" className="other"/>;',
    'const x = <nav className={`room-navigation ${extra}`}/>;',
    'const roomClass="room-navigation";const x=<nav className={roomClass}/>;',
  ]) assert.throws(() => removeRoomNavigation(source));
});
test('dry run writes nothing; apply backs up actual edited bytes and repeat is a no-op', t => {
  const f = fixture(t); const backupBase = join(f.targetRoot, '.room-tab-cleanup-backups');
  assert.equal(cleanupWorkshop(f).status, 'ready'); assert.equal(existsSync(backupBase), false); assert.equal(readFileSync(f.path, 'utf8'), before);
  const result = cleanupWorkshop({ ...f, apply: true }); assert.equal(result.status, 'applied');
  assert.equal(readFileSync(join(result.backupRoot, 'Workshop.tsx'), 'utf8'), before);
  assert.equal(readFileSync(f.path, 'utf8'), before.replace(fragment, ''));
  assert.equal(JSON.parse(readFileSync(join(result.backupRoot, 'restoration.json'))).status, 'applied');
  assert.equal(cleanupWorkshop({ ...f, apply: true }).status, 'already-clean');
});
test('an intervening operator edit blocks replacement and creates no backup directory', t => {
  const f = fixture(t), edit = `${before}\n// new operator edit`;
  assert.throws(() => cleanupWorkshop({ ...f, apply: true, beforeCommit: () => writeFileSync(f.path, edit) }), /changed after preflight/);
  assert.equal(readFileSync(f.path, 'utf8'), edit); assert.equal(existsSync(join(f.targetRoot, '.room-tab-cleanup-backups')), false);
});
test('wrong project and symlinked Workshop paths cannot be changed', t => {
  const f = fixture(t);
  writeFileSync(join(f.targetRoot, 'package.json'), JSON.stringify({ name: 'unrelated' })); assert.throws(() => cleanupWorkshop({ ...f, apply: true }), /package.name/);
  writeFileSync(join(f.targetRoot, 'package.json'), JSON.stringify({ name: 'thatstupidcomputer' }));
  const saved = join(f.targetRoot, 'saved.tsx'); writeFileSync(saved, before); rmSync(f.path); symlinkSync(saved, f.path);
  assert.throws(() => cleanupWorkshop({ ...f, apply: true }), /Symlink traversal/); assert.equal(readFileSync(saved, 'utf8'), before);
});
