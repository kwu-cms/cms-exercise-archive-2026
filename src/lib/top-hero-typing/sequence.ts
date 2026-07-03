import type { TopHeroPhrase } from '../../data/top/hero-phrases';

export const TOP_HERO_PREFIX = 'メディア x';
export const TOP_HERO_PREFIX_WITH_SPACE = 'メディア x ';

/** ループ時に戻るキーフレーム（最初のフルフレーズ） */
export const TOP_HERO_LOOP_FROM_INDEX = 2;

/** アニメーションの表示キーフレーム列を構築する */
export function buildTopHeroKeyframes(phrases: TopHeroPhrase[]): string[] {
  if (phrases.length === 0) return [''];

  const sequence: string[] = ['', TOP_HERO_PREFIX];

  for (let i = 0; i < phrases.length; i += 1) {
    sequence.push(phrases[i]!.text);
    if (i < phrases.length - 1) {
      sequence.push(TOP_HERO_PREFIX_WITH_SPACE);
    } else {
      sequence.push(TOP_HERO_PREFIX);
    }
  }

  return sequence;
}

export function getLongestTypingKeyframe(phrases: TopHeroPhrase[]): string {
  return buildTopHeroKeyframes(phrases).reduce(
    (longest, text) => (text.length > longest.length ? text : longest),
    '',
  );
}

export function nextTopHeroKeyframeIndex(
  currentIndex: number,
  sequenceLength: number,
): number {
  const next = currentIndex + 1;
  if (next >= sequenceLength) return TOP_HERO_LOOP_FROM_INDEX;
  return next;
}

export function isFullTopHeroPhrase(text: string, phrases: TopHeroPhrase[]): boolean {
  return phrases.some((phrase) => phrase.text === text);
}
