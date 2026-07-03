import { describe, expect, it } from 'vitest';
import submissions from '../src/data/takawo/notable-submissions.json';
import {
  PROJECT_CARD_BY_CODE,
  PROJECT_CARDS,
  SUBMISSION_CARD_CODES,
  getSubmissionCard,
} from '../src/lib/takawo/archetypes';

describe('takawo submission project cards', () => {
  it('maps every notable submission to a known project card', () => {
    for (const item of submissions) {
      const card = getSubmissionCard(item);
      expect(card, item.id).not.toBeNull();
      expect(PROJECT_CARD_BY_CODE[card!.code]).toBeDefined();
    }
  });

  it('uses each project card code exactly once', () => {
    const codes = Object.values(SUBMISSION_CARD_CODES);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.length).toBe(PROJECT_CARDS.length);
  });

  it('covers all notable submission ids', () => {
    const ids = submissions.map((item) => item.id);
    expect(Object.keys(SUBMISSION_CARD_CODES).sort()).toEqual(ids.sort());
  });
});
