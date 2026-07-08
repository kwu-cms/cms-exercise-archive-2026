import { describe, expect, it } from 'vitest';
import { buildHeroOrbitCards } from '../src/lib/takawo/hero-card-orbit/build-cards';
import type { NotableSubmission } from '../src/lib/takawo/submissions';

describe('buildHeroOrbitCards', () => {
  it('joins submission with tarot card image path', () => {
    const submissions = [
      {
        id: 'student-03',
        category: '出力形式',
        title: '創作モンスター診断',
        summary: 'レーダーチャート…',
      },
      {
        id: 'student-01',
        category: 'インサイト',
        title: '地図系',
        summary: 'マッピング',
      },
    ] as NotableSubmission[];

    const cards = buildHeroOrbitCards(submissions, '/');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({
      id: 'student-03',
      cardCode: 'BEST',
      cardName: '幻獣を育む者',
      imageUrl: '/works/takawo/cards/BEST.png',
    });
    expect(cards[1]?.cardCode).toBe('COMP');
  });

  it('skips submissions without card mapping', () => {
    const submissions = [
      {
        id: 'unknown-x',
        category: '振り返り',
        title: 'なし',
        summary: 'x',
      },
    ] as NotableSubmission[];
    expect(buildHeroOrbitCards(submissions, '/')).toEqual([]);
  });
});
