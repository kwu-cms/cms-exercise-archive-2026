import { describe, expect, it } from 'vitest';
import { TOP_HERO_PHRASES } from '../src/data/top/hero-phrases';
import {
  MAX_PHRASE_DURATION_MS,
  MIN_PHRASE_DURATION_MS,
} from '../src/lib/top-hero-typing/constants';
import { getPhraseDuration } from '../src/lib/top-hero-typing/duration';
import {
  TOP_HERO_LOOP_FROM_INDEX,
  TOP_HERO_PREFIX,
  TOP_HERO_PREFIX_WITH_SPACE,
  buildTopHeroKeyframes,
  getLongestTypingKeyframe,
  nextTopHeroKeyframeIndex,
} from '../src/lib/top-hero-typing/sequence';

describe('TOP_HERO_PHRASES', () => {
  it('3つのフレーズが定義されている', () => {
    expect(TOP_HERO_PHRASES).toHaveLength(3);
    for (const phrase of TOP_HERO_PHRASES) {
      expect(phrase.text.length).toBeGreaterThan(0);
      expect(phrase.text.startsWith(TOP_HERO_PREFIX_WITH_SPACE.trim())).toBe(true);
    }
  });
});

describe('getPhraseDuration', () => {
  it('短いフレーズ向けの打鍵時間になる', () => {
    expect(getPhraseDuration(5)).toBe(MIN_PHRASE_DURATION_MS);
    expect(getPhraseDuration(30)).toBe(MAX_PHRASE_DURATION_MS);
    const mid = getPhraseDuration(16);
    expect(mid).toBeGreaterThan(MIN_PHRASE_DURATION_MS);
    expect(mid).toBeLessThan(MAX_PHRASE_DURATION_MS);
  });
});

describe('buildTopHeroKeyframes', () => {
  it('共通プレフィックスを軸にキーフレーム列を作る', () => {
    const keyframes = buildTopHeroKeyframes(TOP_HERO_PHRASES);

    expect(keyframes).toEqual([
      '',
      TOP_HERO_PREFIX,
      TOP_HERO_PHRASES[0]!.text,
      TOP_HERO_PREFIX_WITH_SPACE,
      TOP_HERO_PHRASES[1]!.text,
      TOP_HERO_PREFIX_WITH_SPACE,
      TOP_HERO_PHRASES[2]!.text,
      TOP_HERO_PREFIX,
    ]);
  });

  it('最後のキーフレームの次は最初のフルフレーズに戻る', () => {
    const keyframes = buildTopHeroKeyframes(TOP_HERO_PHRASES);
    const lastIndex = keyframes.length - 1;
    expect(nextTopHeroKeyframeIndex(lastIndex, keyframes.length)).toBe(TOP_HERO_LOOP_FROM_INDEX);
    expect(keyframes[TOP_HERO_LOOP_FROM_INDEX]).toBe(TOP_HERO_PHRASES[0]!.text);
  });
});

describe('getLongestTypingKeyframe', () => {
  it('スロット確保用に最長キーフレームを返す', () => {
    const keyframes = buildTopHeroKeyframes(TOP_HERO_PHRASES);
    const longest = getLongestTypingKeyframe(TOP_HERO_PHRASES);
    expect(longest).toBe(keyframes.reduce((a, b) => (a.length >= b.length ? a : b)));
  });
});
