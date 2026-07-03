import { describe, expect, it } from 'vitest';
import { PUNCTUATION_PAUSE_MS } from '../src/lib/mizuno/hero-typing/constants';
import {
  computeBaseCharDelay,
  delayBeforeNextChar,
  estimateTypingDuration,
  isPunctuationPause,
} from '../src/lib/mizuno/hero-typing/timing';

describe('isPunctuationPause', () => {
  it('句読点で true', () => {
    expect(isPunctuationPause('、')).toBe(true);
    expect(isPunctuationPause('。')).toBe(true);
  });

  it('通常文字で false', () => {
    expect(isPunctuationPause('あ')).toBe(false);
  });
});

describe('delayBeforeNextChar', () => {
  it('句読点の直後は長めのウェイト', () => {
    expect(delayBeforeNextChar('、', 40)).toBe(PUNCTUATION_PAUSE_MS);
    expect(delayBeforeNextChar('あ', 40)).toBe(40);
  });
});

describe('computeBaseCharDelay', () => {
  it('句読点が多いほど基本間隔は短くなる', () => {
    const plain = computeBaseCharDelay('あいうえおかきくけこ', 10_000);
    const punct = computeBaseCharDelay('あ、い。う、え。お、か。き、く。', 10_000);
    expect(punct).toBeLessThan(plain);
  });

  it('推定打鍵時間が目標に近い', () => {
    const text = '今日は、とても良い天気だった。散歩をした。';
    const target = 12_000;
    const base = computeBaseCharDelay(text, target);
    const estimated = estimateTypingDuration(text, base);
    expect(estimated).toBeGreaterThanOrEqual(target - PUNCTUATION_PAUSE_MS);
    expect(estimated).toBeLessThanOrEqual(target + PUNCTUATION_PAUSE_MS);
  });
});
