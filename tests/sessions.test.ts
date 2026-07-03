import { describe, expect, it } from 'vitest';
import {
  CLOSING_SESSION_NO,
  SESSION_HASHTAGS,
  SESSION_SETS,
  SESSIONS,
} from '../src/data/sessions';
import { MIZUNO_ROUNDS } from '../src/data/rounds/mizuno';
import { TAKAWO_ROUNDS } from '../src/data/rounds/takawo';
import { YAO_ROUNDS } from '../src/data/rounds/yao';

describe('SESSIONS', () => {
  it('全13回が定義されている', () => {
    expect(SESSIONS).toHaveLength(13);
    expect(SESSIONS.map((s) => s.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it('第1〜12回にハッシュタグがある', () => {
    for (let no = 1; no <= 12; no += 1) {
      expect(SESSION_HASHTAGS[no]?.length).toBeGreaterThan(0);
    }
    expect(SESSION_HASHTAGS[CLOSING_SESSION_NO]).toBeUndefined();
  });

  it('セットごとの担当回が一致する', () => {
    expect(SESSION_SETS).toEqual([
      { teacher: 'takawo', sessionNos: [1, 2, 3, 4] },
      { teacher: 'mizuno', sessionNos: [5, 6, 7, 8] },
      { teacher: 'yao', sessionNos: [9, 10, 11, 12] },
    ]);
  });
});

describe('rounds', () => {
  it('各教員ページの sessionNo が通し番号と一致する', () => {
    expect(TAKAWO_ROUNDS.map((r) => r.sessionNo)).toEqual([1, 2, 3, 4]);
    expect(MIZUNO_ROUNDS.map((r) => r.sessionNo)).toEqual([5, 6, 7, 8]);
    expect(YAO_ROUNDS.map((r) => r.sessionNo)).toEqual([9, 10, 11, 12]);
  });
});
