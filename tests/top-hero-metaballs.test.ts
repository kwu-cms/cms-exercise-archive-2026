import { describe, expect, it } from 'vitest';
import { PAPER_RGB, THEME_COLORS } from '../src/lib/top-hero-metaballs/constants';
import { TIER_SETTINGS, detectPerformanceTier } from '../src/lib/top-hero-metaballs/performance';

describe('top hero metaballs colors', () => {
  it('3テーマ色と紙色が定義されている', () => {
    expect(THEME_COLORS.takawo).toHaveLength(3);
    expect(THEME_COLORS.mizuno).toHaveLength(3);
    expect(THEME_COLORS.yao).toHaveLength(3);
    expect(PAPER_RGB).toHaveLength(3);
  });
});

describe('top hero metaballs performance', () => {
  it('低スペック向けティアが定義されている', () => {
    expect(TIER_SETTINGS.low.fieldScale).toBeLessThan(TIER_SETTINGS.normal.fieldScale);
    expect(TIER_SETTINGS.low.targetFps).toBeLessThanOrEqual(TIER_SETTINGS.normal.targetFps);
  });

  it('detectPerformanceTier が low または normal を返す', () => {
    expect(['low', 'normal']).toContain(detectPerformanceTier());
  });
});
