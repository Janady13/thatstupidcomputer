/** Validates an upstream-selected public export. Does not read or reconstruct the private truth registry. */
import { readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateProjection } from '../packages/site/truth.ts';

export async function importTruth({ inputPath, outputPath, expectedCommit }: { inputPath: string; outputPath: string; expectedCommit: string }): Promise<{ sourceCommit: string; sha256: string; outputPath: string }> {
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(expectedCommit)) throw new Error('The approved full canonical source commit must be explicitly pinned');
  const output = resolve(outputPath);
  const privateRoot = resolve('private/truth');
  const destination = relative(privateRoot, output);
  if (destination.startsWith('..') || isAbsolute(destination) || !destination || !output.endsWith('.json')) throw new Error('Store imported projection JSON under private/truth, never a web/public output directory');
  const source = await readFile(inputPath);
  if (source.length > 64_000) throw new Error('Projection exceeds the public adapter size limit');
  const projection = validateProjection(JSON.parse(source.toString('utf8')), { expectedCommit });
  await mkdir(dirname(output), { recursive: true, mode: 0o700 });
  const actualPrivate = await realpath(privateRoot);
  if (actualPrivate !== resolve(await realpath(process.cwd()), 'private/truth')) throw new Error('The private projection directory must not redirect through a symlink');
  const actualParent = await realpath(dirname(output));
  if (actualParent !== actualPrivate && relative(actualPrivate, actualParent).startsWith('..')) throw new Error('Projection destination escapes the private directory');
  // Exclusive creation avoids overwriting a prior reviewed export or following a destination symlink.
  await writeFile(output, source, { flag: 'wx', mode: 0o600 });
  return { sourceCommit: projection.provenance.sourceCommit, sha256: createHash('sha256').update(source).digest('hex'), outputPath: output };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length !== 3) throw new Error('Usage: node scripts/import-truth.ts INPUT_JSON private/truth/REVIEWED_EXPORT.json FULL_CANONICAL_COMMIT');
  const result = await importTruth({ inputPath: args[0]!, outputPath: args[1]!, expectedCommit: args[2]! });
  console.log(JSON.stringify(result)); // Safe provenance only; no raw claim or identity data in logs.
}
