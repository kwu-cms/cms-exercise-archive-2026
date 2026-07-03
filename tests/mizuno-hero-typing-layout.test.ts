import { describe, expect, it } from 'vitest';
import {
  getDurationByLength,
  wrapJapaneseText,
  type TextLayoutContext,
} from '../src/lib/mizuno/hero-typing/layout';
import { MAX_DURATION_MS, MIN_DURATION_MS } from '../src/lib/mizuno/hero-typing/constants';

function mockContext(charWidthRatio = 0.55): TextLayoutContext {
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
