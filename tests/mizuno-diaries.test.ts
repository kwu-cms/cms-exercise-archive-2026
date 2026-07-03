import { describe, expect, it } from 'vitest';
import { MIZUNO_DIARIES } from '../src/data/mizuno/diaries';

describe('MIZUNO_DIARIES', () => {
  it('5件以上の日記が定義されている', () => {
    expect(MIZUNO_DIARIES.length).toBeGreaterThanOrEqual(5);
  });

  it('各日記に id / title / text が非空で含まれる', () => {
    for (const diary of MIZUNO_DIARIES) {
      expect(diary.id.length).toBeGreaterThan(0);
      expect(diary.title.length).toBeGreaterThan(0);
      expect(diary.text.length).toBeGreaterThan(0);
    }
  });
});
