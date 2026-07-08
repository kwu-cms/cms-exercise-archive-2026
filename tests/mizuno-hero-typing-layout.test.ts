import { describe, expect, it } from 'vitest';
import {
  fontSizeFitsBox,
  getDurationByLength,
  resolveHeroFontSize,
  wrapJapaneseText,
  type TextLayoutContext,
} from '../src/lib/mizuno/hero-typing/layout';
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
} from '../src/lib/mizuno/hero-typing/constants';

function mockContext(charWidthRatio = 0.55, lineHeightRatio = 2.05): TextLayoutContext {
  let fontSize = 16;
  return {
    setFontSize(size: number) {
      fontSize = size;
    },
    measureWidth(text: string) {
      return [...text].length * fontSize * charWidthRatio;
    },
    measureBounds(text: string) {
      const w = [...text].length * fontSize * charWidthRatio;
      return { w, h: fontSize };
    },
    lineHeightFor(size: number) {
      return Math.ceil(size * lineHeightRatio);
    },
  };
}

describe('getDurationByLength', () => {
  it('120字未満は最短10秒', () => {
    expect(getDurationByLength(50)).toBe(MIN_DURATION_MS);
  });

  it('420字以上は最長20秒', () => {
    expect(getDurationByLength(500)).toBe(MAX_DURATION_MS);
  });

  it('中間の文字数は10〜20秒の間', () => {
    const d = getDurationByLength(270);
    expect(d).toBeGreaterThanOrEqual(MIN_DURATION_MS);
    expect(d).toBeLessThanOrEqual(MAX_DURATION_MS);
  });
});

describe('wrapJapaneseText', () => {
  it('幅を超えると折り返す', () => {
    const ctx = mockContext();
    const lines = wrapJapaneseText(ctx, 'あいうえおかきくけこ', 80);
    expect(lines.length).toBeGreaterThan(1);
  });

  it('空文字は空配列', () => {
    const ctx = mockContext();
    expect(wrapJapaneseText(ctx, '', 200)).toEqual([]);
  });
});

describe('resolveHeroFontSize', () => {
  it('大きいビューポートほどフォントサイズが大きくなる', () => {
    const ctx = mockContext(0.94, 2.05);
    const small = resolveHeroFontSize(ctx, 480, 520);
    const large = resolveHeroFontSize(ctx, 1280, 896);
    expect(large).toBeGreaterThan(small);
  });

  it('最小・最大の範囲に収まる', () => {
    const ctx = mockContext(0.94, 2.05);
    const tiny = resolveHeroFontSize(ctx, 200, 200);
    const huge = resolveHeroFontSize(ctx, 2400, 1400);
    expect(tiny).toBeGreaterThanOrEqual(FONT_SIZE_MIN);
    expect(huge).toBeLessThanOrEqual(FONT_SIZE_MAX);
  });

  it('高さが足りないと幅だけ広くてもサイズが抑えられる', () => {
    const ctx = mockContext(0.94, 2.05);
    const wideShort = resolveHeroFontSize(ctx, 1600, 320);
    const balanced = resolveHeroFontSize(ctx, 1280, 896);
    expect(wideShort).toBeLessThan(balanced);
  });
});

describe('fontSizeFitsBox', () => {
  it('行数・字数の両方を満たすサイズは true', () => {
    const ctx = mockContext(0.94, 2.05);
    expect(fontSizeFitsBox(ctx, 24, 900, 700)).toBe(true);
  });
});
