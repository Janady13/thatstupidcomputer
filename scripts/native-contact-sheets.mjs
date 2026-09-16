/** Exact-byte native/source contact sheets, paginated for complete readable review. */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('..', import.meta.url));
const reports = resolve(root, 'native/reports');
const report = JSON.parse(readFileSync(resolve(reports, 'native-canvas.json'), 'utf8'));
if (report.status !== 'PASS') throw new Error('Fresh passing native proof is required before contact-sheet generation');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const details = resolve(reports, 'contact-sheets'); mkdirSync(details, { recursive: true });
const output = { status: 'GENERATED_AWAITING_VISUAL_REVIEW', generatedAt: new Date().toISOString(), proofSHA256: digest(readFileSync(resolve(reports, 'native-canvas.json'))), capture: 'Authored peakSeconds from the performance catalog, native left / authoritative source right', files: [] };
async function sheet(file, checks, path, columns = 2, scale = 1, pageLabel = '') {
  const cellW = 520 * scale, cellH = 286 * scale, headerH = 65, width = Math.ceil(columns * cellW), height = Math.ceil(headerH + Math.ceil(checks.length / columns) * cellH + 20);
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4e5c4'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#29261f'; ctx.font = 'bold 21px sans-serif'; ctx.fillText(`${file.slug} · ${pageLabel || 'all actions'}`, 18, 27);
  ctx.font = '14px sans-serif'; ctx.fillText(`Native / source · authored peak · SHA-256 ${file.sha256.slice(0, 20)}…`, 18, 49);
  for (let index = 0; index < checks.length; index++) {
    const check = checks[index], x = (index % columns) * cellW, y = Math.floor(index / columns) * cellH + headerH;
    ctx.font = `bold ${Math.max(13, 16 * scale)}px sans-serif`; ctx.fillStyle = '#29261f';
    ctx.fillText(`${check.action} · ${check.captureSeconds.toFixed(2)}s · ${check.status}`, x + 18 * scale, y + 18 * scale);
    for (const [column, mode] of ['native', 'svg'].entries()) {
      const image = await loadImage(resolve(reports, `canvas/${file.slug}--${check.action}--${mode}.png`));
      ctx.drawImage(image, x + (25 + column * 240) * scale, y + 28 * scale, 188 * scale, 240 * scale);
    }
  }
  const bytes = canvas.toBuffer('image/png'); writeFileSync(path, bytes);
  return { path: path.slice(root.length), sha256: digest(bytes), width, height, actions: checks.map(check => check.action) };
}
for (const file of report.files) {
  if (digest(readFileSync(resolve(root, `native/compiled/${file.slug}.riv`))) !== file.sha256) throw new Error(`Native bytes changed before sheet creation: ${file.slug}`);
  const pages = [];
  for (let start = 0; start < file.checks.length; start += 8) pages.push(await sheet(file, file.checks.slice(start, start + 8), resolve(details, `${file.slug}-${String(start / 8 + 1).padStart(2, '0')}.png`), 2, 1, `actions ${start + 1}–${Math.min(start + 8, file.checks.length)} / ${file.checks.length}`));
  const overview = await sheet(file, file.checks, resolve(reports, `${file.slug}-parity.png`), 4, .8);
  output.files.push({ slug: file.slug, nativeSHA256: file.sha256, actionCount: file.checks.length, overview, pages });
}
writeFileSync(resolve(reports, 'contact-sheets.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Generated ${output.files.length} overview sheets and ${output.files.reduce((sum, file) => sum + file.pages.length, 0)} readable detail sheets; visual review remains a separate step.`);
