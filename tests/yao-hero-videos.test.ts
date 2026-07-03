import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { YAO_HERO_VIDEOS } from '../src/data/yao/hero-videos';

const root = fileURLToPath(new URL('..', import.meta.url));

describe('YAO_HERO_VIDEOS', () => {
  it('1本以上の動画パスが定義されている', () => {
    expect(YAO_HERO_VIDEOS.length).toBeGreaterThan(0);
  });

  it('各パスに対応する Web 版 mp4 が public/hero に存在する', () => {
    for (const webPath of YAO_HERO_VIDEOS) {
      const filename = path.basename(webPath);
      const filePath = path.join(root, 'public/hero', filename);
      expect(fs.existsSync(filePath), `missing: ${filePath}`).toBe(true);
    }
  });
});
