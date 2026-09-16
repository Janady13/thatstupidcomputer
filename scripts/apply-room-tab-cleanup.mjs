#!/usr/bin/env node
/** One AST-selected JSX deletion; never replace the edited live Workshop file. */
import { parseSync } from 'rolldown/utils';
import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, readFileSync, mkdirSync, openSync, writeFileSync, closeSync, fsyncSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = 'apps/web/src/components/Workshop.tsx';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const stat = path => { try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } };

function parse(source) {
  const result = parseSync('Workshop.tsx', source, { lang: 'tsx' });
  if (result.errors.length) throw new Error('Workshop.tsx contains parse errors; review the file before cleanup');
  return result.program;
}

/** Returns an exact byte-preserving edit range (UTF-16 string offsets). No AST
 * printer, formatting, import cleanup, symbol execution or layout rewrite. */
export function removeRoomNavigation(source) {
  if (typeof source !== 'string') throw new TypeError('Expected TSX source text');
  const file = parse(source), matches = [];
  let ambiguous = false;
  function visit(node, parent) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'JSXElement') {
      const opening = node.openingElement;
      if (opening.name.type === 'JSXIdentifier' && opening.name.name === 'nav') {
        const attributes = opening.attributes;
        const classes = attributes.filter(attribute => attribute.type === 'JSXAttribute' && attribute.name.name === 'className');
        let matching = false;
        for (const attribute of classes) {
          let value = attribute.value;
          if (value?.type === 'JSXExpressionContainer') value = value.expression;
          const literal = value?.type === 'Literal' && typeof value.value === 'string' ? value.value
            : value?.type === 'TemplateLiteral' && value.expressions.length === 0 ? value.quasis[0].value.cooked : null;
          if (typeof literal === 'string') {
            if (literal.split(/\s+/).includes('room-navigation')) matching = true;
          } else if (source.slice(attribute.start, attribute.end).includes('room-navigation')) ambiguous = true;
        }
        if (matching) {
          // A spread or duplicate may override the apparent class at runtime.
          if (classes.length !== 1 || attributes.some(attribute => attribute.type === 'JSXSpreadAttribute')) ambiguous = true;
          matches.push({ node, parent });
        }
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) for (const child of value) visit(child, node);
      else if (value && typeof value === 'object') visit(value, node);
    }
  }
  visit(file);
  if (ambiguous || matches.length > 1) throw new Error('Ambiguous room-navigation markup; manual review required');
  if (matches.length === 0) {
    if (source.includes('room-navigation')) throw new Error('Room-navigation marker exists outside a supported literal nav; manual review required');
    return { status: 'already-clean', source, edit: null };
  }
  const { node, parent } = matches[0], { start, end } = node;
  const replacement = parent?.type === 'JSXElement' || parent?.type === 'JSXFragment' ? '' : 'null';
  const cleaned = source.slice(0, start) + replacement + source.slice(end);
  parse(cleaned);
  return { status: 'ready', source: cleaned, edit: { start, end, replacement, removedCharacters: end - start } };
}

function safePath(path, { directory = false, optional = false } = {}) {
  const absolute = resolve(path);
  let current = absolute.startsWith(sep) ? sep : absolute.slice(0, 3);
  const parts = relative(current, absolute).split(sep).filter(Boolean);
  for (let index = 0; index < parts.length; index++) {
    current = join(current, parts[index]); const info = stat(current);
    if (!info) { if (optional) return null; throw new Error(`Missing path: ${current}`); }
    if (info.isSymbolicLink()) throw new Error(`Symlink traversal rejected: ${current}`);
    const expectsDirectory = index < parts.length - 1 || directory;
    if (expectsDirectory ? !info.isDirectory() : !info.isFile()) throw new Error(`Unexpected file type: ${current}`);
  }
  return stat(absolute);
}

function atomicWrite(path, bytes, mode) {
  const temporary = join(dirname(path), `.room-tab-cleanup-${randomUUID()}.tmp`);
  let fd;
  try {
    fd = openSync(temporary, 'wx', mode); writeFileSync(fd, bytes); fsyncSync(fd); closeSync(fd); fd = undefined;
    renameSync(temporary, path);
  } finally {
    if (fd !== undefined) closeSync(fd);
    try { unlinkSync(temporary); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

/** beforeCommit is a test-only in-process seam; no CLI hook is accepted. */
export function cleanupWorkshop({ targetRoot, apply = false, beforeCommit }) {
  if (typeof targetRoot !== 'string' || !isAbsolute(targetRoot)) throw new Error('--target must be an absolute project directory');
  targetRoot = resolve(targetRoot); safePath(targetRoot, { directory: true });
  const packagePath = join(targetRoot, 'package.json'); safePath(packagePath);
  if (JSON.parse(readFileSync(packagePath, 'utf8')).name !== 'thatstupidcomputer') throw new Error('Wrong target package.name');
  const path = join(targetRoot, FILE), info = safePath(path);
  const before = readFileSync(path), source = before.toString('utf8');
  if (!Buffer.from(source, 'utf8').equals(before)) throw new Error('Workshop.tsx must be valid UTF-8');
  const result = removeRoomNavigation(source), after = Buffer.from(result.source, 'utf8');
  const report = { schema: 'tsc-room-tab-cleanup/v4', status: result.status, mode: apply ? 'apply' : 'dry-run', targetRoot, file: FILE, beforeSha256: hash(before), afterSha256: hash(after), edit: result.edit };
  if (!apply || result.status === 'already-clean') return report;
  const backupBase = join(targetRoot, '.room-tab-cleanup-backups');
  safePath(backupBase, { directory: true, optional: true });
  beforeCommit?.();
  safePath(path);
  if (hash(readFileSync(path)) !== report.beforeSha256) throw new Error('Workshop.tsx changed after preflight; no file was replaced');
  safePath(backupBase, { directory: true, optional: true });
  if (!stat(backupBase)) mkdirSync(backupBase, { mode: 0o700 });
  const backupRoot = join(backupBase, randomUUID()); mkdirSync(backupRoot, { mode: 0o700 });
  const backupPath = join(backupRoot, 'Workshop.tsx'); writeFileSync(backupPath, before, { flag: 'wx', mode: 0o600 });
  const journalPath = join(backupRoot, 'restoration.json');
  const journal = { ...report, status: 'prepared', originalMode: info.mode & 0o777, backup: 'Workshop.tsx' };
  writeFileSync(journalPath, `${JSON.stringify(journal, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  let committed = false;
  try {
    safePath(path);
    if (hash(readFileSync(path)) !== report.beforeSha256) throw new Error('Workshop.tsx changed while the backup was prepared');
    atomicWrite(path, after, info.mode & 0o777); committed = true;
    atomicWrite(journalPath, `${JSON.stringify({ ...journal, status: 'applied' }, null, 2)}\n`, 0o600);
    return { ...report, status: 'applied', backupRoot };
  } catch (error) {
    let status = 'not-applied';
    if (committed) {
      try {
        safePath(path);
        if (hash(readFileSync(path)) !== report.afterSha256) throw new Error('Later edit detected');
        atomicWrite(path, before, info.mode & 0o777); status = 'rolled-back';
      } catch { status = 'manual-restoration-required'; }
    }
    try { atomicWrite(journalPath, `${JSON.stringify({ ...journal, status, error: error.message }, null, 2)}\n`, 0o600); } catch { /* The original backup remains readable. */ }
    throw new Error(`${error.message}; ${status}. Original backup: ${backupPath}`);
  }
}

function main(args) {
  let targetRoot, apply = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--target' && targetRoot === undefined && args[index + 1] && !args[index + 1].startsWith('--')) targetRoot = args[++index];
    else if (args[index] === '--apply' && !apply) apply = true;
    else throw new Error('Usage: node scripts/apply-room-tab-cleanup.mjs --target ABSROOT [--apply]');
  }
  process.stdout.write(`${JSON.stringify(cleanupWorkshop({ targetRoot, apply }), null, 2)}\n`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { process.stderr.write(`${JSON.stringify({ status: 'blocked', error: error.message })}\n`); process.exitCode = 1; }
}
