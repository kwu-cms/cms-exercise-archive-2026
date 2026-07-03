/**
 * reference/card_image_new の学生成果カード画像を public に同期する。
 * 実行: node scripts/sync-takawo-archetypes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceDir = path.join(root, 'reference/card_image_new');
const targetDir = path.join(root, 'public/works/takawo/cards');

fs.mkdirSync(targetDir, { recursive: true });

const files = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.png'));
if (files.length === 0) {
  console.warn('sync-takawo-archetypes: reference/card_image_new に PNG がありません');
  process.exit(0);
}

for (const file of files) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log(`Synced ${files.length} project cards → public/works/takawo/cards/`);
