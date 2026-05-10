/**
 * WHAT: One-off batch compressor for the dish images in public/images/.
 *       Iterates every dish-*.jpeg / dish-*.jpg, resizes to a max
 *       1200×1200 (preserving aspect), re-encodes as progressive JPEG
 *       at quality 78 with mozjpeg, and overwrites the source file.
 * WHY:  Source images shipped at 2–4 MB each. With 70 dishes that's
 *       hundreds of MB in the build bundle and a real Lighthouse
 *       penalty even with next/image. Target per master prompt:
 *       ~600 KB per image.
 * IF REMOVED: nothing — the site keeps working with whatever sizes
 *       are in /public. This is a build-tool, not a runtime artefact.
 *
 * Usage: node scripts/compress-images.mjs
 */
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const PUBLIC_IMAGES = path.resolve("public/images");
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 78;
const SKIP_BELOW_BYTES = 700 * 1024; // 700 KB

async function compressOne(filename) {
  const fullPath = path.join(PUBLIC_IMAGES, filename);
  const before = (await fs.stat(fullPath)).size;
  if (before < SKIP_BELOW_BYTES) {
    console.log(
      `skip   ${filename.padEnd(36)} ${(before / 1024).toFixed(0).padStart(5)} KB (already small)`,
    );
    return { skipped: true, before, after: before };
  }

  // Read entire file into a buffer first — sharp can't safely write to
  // the same path it's reading from in streaming mode.
  const original = await fs.readFile(fullPath);
  const transformed = await sharp(original)
    .rotate() // honour EXIF orientation, then strip it
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(fullPath, transformed);
  const after = transformed.length;
  console.log(
    `done   ${filename.padEnd(36)} ${(before / 1024).toFixed(0).padStart(5)} KB → ${(after / 1024).toFixed(0).padStart(5)} KB  (${Math.round(100 - (after / before) * 100)}% smaller)`,
  );
  return { skipped: false, before, after };
}

async function main() {
  const entries = await fs.readdir(PUBLIC_IMAGES);
  const targets = entries
    .filter((f) => /^dish-.*\.(jpe?g)$/i.test(f))
    .sort();

  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;
  for (const name of targets) {
    const r = await compressOne(name);
    totalBefore += r.before;
    totalAfter += r.after;
    if (r.skipped) skipped++;
    else processed++;
  }
  const mb = (b) => (b / 1024 / 1024).toFixed(2);
  console.log(
    `\nProcessed ${processed} of ${targets.length} (${skipped} skipped)\n` +
      `Total:  ${mb(totalBefore)} MB → ${mb(totalAfter)} MB  ` +
      `(${Math.round(100 - (totalAfter / totalBefore) * 100)}% smaller)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
