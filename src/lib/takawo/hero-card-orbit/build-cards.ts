import { withBase } from '../../base-url';
import {
  getSubmissionCard,
  getSubmissionCardCode,
  projectCardImagePath,
} from '../archetypes';
import type { NotableSubmission } from '../submissions';
import type { HeroOrbitCard } from './types';

/** 提出16件 × タロット画像をヒーロー用に join（順序はカード配置の円周順） */
export function buildHeroOrbitCards(
  submissions: NotableSubmission[],
  base = import.meta.env.BASE_URL,
): HeroOrbitCard[] {
  const byId = new Map(submissions.map((item) => [item.id, item]));

  // SUBMISSION_CARD_CODES の宣言順ではなく提出データの並びを尊重し、
  // 画像コードがあるものだけ円周に載せる
  return submissions
    .map((item) => {
      const card = getSubmissionCard(item);
      const code = getSubmissionCardCode(item);
      if (!card || !code) return null;
      const source = byId.get(item.id) ?? item;
      return {
        id: source.id,
        title: source.title,
        summary: source.summary,
        category: source.category,
        cardCode: code,
        cardName: card.name,
        imageUrl: withBase(projectCardImagePath(code), base),
      } satisfies HeroOrbitCard;
    })
    .filter((item): item is HeroOrbitCard => item !== null);
}
