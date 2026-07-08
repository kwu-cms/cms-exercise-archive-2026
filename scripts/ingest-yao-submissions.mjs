#!/usr/bin/env node
/**
 * 八尾担当 提出フォーム CSV と yao_data メディアを照合し、
 * public/ へ差分コピーして src/data/yao/artworks.json を生成する。
 *
 * npm run ingest:yao
 * npm run ingest:yao -- --dry-run
 * npm run ingest:yao -- --csv path --data-dir path
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildArtworksManifest } from './lib/yao-ingest/build-artworks.mjs';
import { publicDestPath } from './lib/yao-ingest/media.mjs';
import { parseYaoCsv } from './lib/yao-ingest/parse-csv.mjs';
import { hasAnyMedia, reconcileSubmissions } from './lib/yao-ingest/reconcile.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

const DEFAULTS = {
  csv: path.join(root, 'reference/2026-07-08/メディア表現発展演習I_八尾担当分提出フォーム(Sheet1).csv'),
  dataDir: path.join(root, 'reference/2026-07-08/yao_data'),
  outputJson: path.join(root, 'src/data/yao/artworks.json'),
  stateFile: path.join(root, 'reference/yao-ingest-state.json'),
  publicRoot: path.join(root, 'public'),
};

function parseArgs(argv) {
  const options = {
    csv: DEFAULTS.csv,
    dataDir: DEFAULTS.dataDir,
    outputJson: DEFAULTS.outputJson,
    stateFile: DEFAULTS.stateFile,
    publicRoot: DEFAULTS.publicRoot,
    dryRun: false,
    keepSamples: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--keep-samples') options.keepSamples = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--csv') options.csv = path.resolve(argv[++i]);
    else if (arg === '--data-dir') options.dataDir = path.resolve(argv[++i]);
    else if (arg === '--output') options.outputJson = path.resolve(argv[++i]);
  }

  return options;
}

function fileFingerprint(filePath) {
  const stat = fs.statSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return {
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    sha256: hash.digest('hex'),
  };
}

function loadState(stateFile) {
  if (!fs.existsSync(stateFile)) return { version: 1, files: {} };
  return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
}

function saveState(stateFile, state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
}

function listDataFilenames(dataDir) {
  if (!fs.existsSync(dataDir)) return [];
  return fs.readdirSync(dataDir).filter((name) => !name.startsWith('.'));
}

/** @param {import('./lib/yao-ingest/reconcile.mjs').StudentMedia} media */
function collectMediaFiles(media) {
  return [media.spz, media.ply, media.video].filter(Boolean);
}

function loadSampleArtworks(outputJson) {
  if (!fs.existsSync(outputJson)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
    const items = Array.isArray(data) ? data : data.artworks;
    return (items ?? []).filter((item) => String(item.id).startsWith('sample'));
  } catch {
    return [];
  }
}

function printReport(report) {
  console.log('\n=== Yao submission ingest ===\n');
  console.log(`CSV rows (with student ID): ${report.csvRowCount}`);
  console.log(`Data files scanned:       ${report.fileCount}`);
  console.log(`Matched (CSV + media):    ${report.matched.length}`);
  console.log(`CSV only (no media):      ${report.csvOnly.length}`);
  if (report.csvOnly.length) console.log(`  ${report.csvOnly.join(', ')}`);
  console.log(`File only (no CSV):       ${report.fileOnly.length}`);
  if (report.fileOnly.length) {
    console.log(`  ${report.fileOnly.map((f) => f.studentId).join(', ')}`);
  }
  console.log(`Unidentified files:       ${report.unidentified.length}`);
  if (report.unidentified.length) console.log(`  ${report.unidentified.join(', ')}`);
  if (report.skipped.length) {
    console.log(`Skipped extensions:       ${report.skipped.length}`);
    console.log(`  ${report.skipped.join(', ')}`);
  }
  if (!report.dryRun) {
    console.log(`Copied:                   ${report.copied}`);
    console.log(`Skipped (unchanged):      ${report.unchanged}`);
    console.log(`Wrote:                    ${report.outputJson} (${report.artworkCount} entries)`);
  } else {
    console.log('\n(dry-run: no files copied, JSON not written)');
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(options.csv)) {
    console.error(`CSV not found: ${options.csv}`);
    process.exit(1);
  }
  if (!fs.existsSync(options.dataDir)) {
    console.error(`Data directory not found: ${options.dataDir}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(options.csv, 'utf8');
  const { rows: csvRows } = parseYaoCsv(csvText);
  const filenames = listDataFilenames(options.dataDir);
  const reconciliation = reconcileSubmissions(csvRows, filenames);

  const manifest = buildArtworksManifest(csvRows, reconciliation);
  if (options.keepSamples) {
    const samples = loadSampleArtworks(options.outputJson);
    manifest.artworks = [...samples, ...manifest.artworks];
  }

  const state = loadState(options.stateFile);
  let copied = 0;
  let unchanged = 0;

  const copyTasks = [];
  for (const { media } of reconciliation.matched) {
    for (const file of collectMediaFiles(media)) {
      const destRel = publicDestPath(file.kind, file.studentId);
      if (!destRel) continue;
      copyTasks.push({
        source: path.join(options.dataDir, file.filename),
        dest: path.join(options.publicRoot, destRel),
        destRel,
        key: `${file.studentId}:${file.kind}`,
      });
    }
  }

  if (!options.dryRun) {
    for (const task of copyTasks) {
      if (!fs.existsSync(task.source)) continue;

      const fp = fileFingerprint(task.source);
      const prev = state.files[task.key];
      if (!options.force && prev && prev.sha256 === fp.sha256) {
        unchanged += 1;
        continue;
      }

      fs.mkdirSync(path.dirname(task.dest), { recursive: true });
      fs.copyFileSync(task.source, task.dest);
      state.files[task.key] = {
        source: path.relative(root, task.source),
        dest: task.destRel,
        ...fp,
      };
      copied += 1;
    }

    fs.mkdirSync(path.dirname(options.outputJson), { recursive: true });
    fs.writeFileSync(options.outputJson, JSON.stringify(manifest, null, 2) + '\n');
    state.csv = path.relative(root, options.csv);
    state.updatedAt = new Date().toISOString();
    saveState(options.stateFile, state);
  }

  printReport({
    dryRun: options.dryRun,
    csvRowCount: csvRows.length,
    fileCount: filenames.length,
    matched: reconciliation.matched,
    csvOnly: reconciliation.csvOnly,
    fileOnly: reconciliation.fileOnly,
    unidentified: reconciliation.unidentified,
    skipped: reconciliation.skipped,
    copied,
    unchanged,
    outputJson: path.relative(root, options.outputJson),
    artworkCount: manifest.artworks.length,
  });
}

main();
