import { describe, expect, it } from 'vitest';
import { pickSsrHeroVideos } from '../src/lib/hero-video-ssr';

describe('pickSsrHeroVideos', () => {
  const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

  it('3本を重複なく選ぶ', () => {
    const picked = pickSsrHeroVideos(pool, 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
  });

  it('プールより多くは選ばない', () => {
    expect(pickSsrHeroVideos(['a', 'b'], 3)).toEqual(['a', 'b']);
  });
});
