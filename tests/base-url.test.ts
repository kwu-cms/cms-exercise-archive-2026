import { describe, expect, it } from 'vitest';
import { withBase } from '../src/lib/base-url';

describe('withBase', () => {
  it('ルートサイトではパスをそのまま返す', () => {
    expect(withBase('/takawo/', '/')).toBe('/takawo/');
    expect(withBase('/#themes', '/')).toBe('/#themes');
  });

  it('プロジェクトサイトでは base を付与する', () => {
    expect(withBase('/takawo/', '/mediahyogen-outcomes/')).toBe('/mediahyogen-outcomes/takawo/');
    expect(withBase('/data/yao/artworks.json', '/repo/')).toBe('/repo/data/yao/artworks.json');
  });

  it('takao → takawo リダイレクト用パス', () => {
    expect(withBase('/takawo/', '/cms-exercise-archive-2026/')).toBe(
      '/cms-exercise-archive-2026/takawo/',
    );
  });

  it('外部 URL は変更しない', () => {
    expect(withBase('https://example.com/foo', '/repo/')).toBe('https://example.com/foo');
  });
});
