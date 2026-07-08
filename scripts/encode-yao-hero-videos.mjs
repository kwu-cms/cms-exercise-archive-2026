import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const masterDir = path.join(root, 'public/images/hero/yao');
const worksDir = path.join(root, 'public/works/yao');
const outputDir = path.join(root, 'public/hero');
const manifestPath = path.join(root, 'src/data/yao/hero-videos.ts');

const VIDEO_EXT = /\.(mp4|mov|m4v)$/i;

function ensureFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  } catch {
    console.error('ffmpeg が見つかりません。Homebrew 等でインストールしてください。');
    process.exit(1);
  }
}

function studentIdFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base.toLowerCase();
}

function listMasterVideos() {
  /** @type {Map<string, string>} */
  const byId = new Map();

  const registerDir = (dir, prefer = false) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      if (!VIDEO_EXT.test(name)) continue;
      const studentId = studentIdFromFilename(name);
      if (prefer || !byId.has(studentId)) {
        byId.set(studentId, path.join(dir, name));
      }
    }
  };

  // アーカイブ作品の mp4 を広く拾い、hero 用マスターがあればそちらを優先
  registerDir(worksDir);
  registerDir(masterDir, true);

  if (byId.size === 0) {
    console.error(`マスター動画がありません: ${worksDir} または ${masterDir}`);
    process.exit(1);
  }

  return [...byId.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([studentId, inputPath]) => ({ studentId, inputPath }));
}

function outputNameFor(studentId) {
  return `hero_${studentId}.mp4`;
}

function shouldSkip(inputPath, outputPath) {
  if (!fs.existsSync(outputPath)) return false;
  return fs.statSync(outputPath).mtimeMs >= fs.statSync(inputPath).mtimeMs;
}

function encodeVideo(inputPath, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const args = [
    '-y',
    '-i',
    inputPath,
    '-an',
    '-vf',
    'scale=-2:720',
    '-c:v',
    'libx264',
    '-crf',
    '28',
    '-preset',
    'medium',
    '-movflags',
    '+faststart',
    outputPath,
  ];

  console.log(`encode: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
}

function writeManifest(webPaths) {
  const lines = [
    '/** 自動生成: npm run encode:hero-yao */',
    'export const YAO_HERO_VIDEOS = [',
    ...webPaths.map((p) => `  '${p}',`),
    '] as const;',
    '',
    'export type YaoHeroVideoPath = (typeof YAO_HERO_VIDEOS)[number];',
    '',
  ];

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, lines.join('\n'), 'utf8');
  console.log(`manifest: ${path.relative(root, manifestPath)} (${webPaths.length} 本)`);
}

ensureFfmpeg();
fs.mkdirSync(outputDir, { recursive: true });

const masters = listMasterVideos();
const webPaths = [];

for (const { studentId, inputPath } of masters) {
  const outputFilename = outputNameFor(studentId);
  const outputPath = path.join(outputDir, outputFilename);
  const webPath = `/hero/${outputFilename}`;

  if (shouldSkip(inputPath, outputPath)) {
    console.log(`skip (up to date): ${outputFilename}`);
  } else {
    encodeVideo(inputPath, outputPath);
  }

  webPaths.push(webPath);
}

writeManifest(webPaths);
console.log('完了');
