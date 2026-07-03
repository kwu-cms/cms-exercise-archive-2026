import { MIN_CHAR_DELAY_MS, PUNCTUATION_PAUSE_MS } from './constants';

const PUNCTUATION_PATTERN = /[、。，．,.!?！？…―ー「」『』（）【】：；\n]/;

export type TypingPhase = 'typing' | 'hold' | 'deleting' | 'gap';

export function isPunctuationPause(char: string): boolean {
  return PUNCTUATION_PATTERN.test(char);
}

export function delayBeforeNextChar(prevChar: string | undefined, baseDelayMs: number): number {
  if (!prevChar) return 0;
  if (isPunctuationPause(prevChar)) return PUNCTUATION_PAUSE_MS;
  return baseDelayMs;
}

export function estimateTypingDuration(text: string, baseDelayMs: number): number {
  const chars = [...text];
  let total = 0;
  for (let i = 1; i < chars.length; i += 1) {
    total += delayBeforeNextChar(chars[i - 1], baseDelayMs);
  }
  return total;
}

/** 句読点ウェイトを除いた残り時間を通常文字の間隔に配分する */
export function computeBaseCharDelay(text: string, targetTypingMs: number): number {
  const chars = [...text];
  if (chars.length <= 1) return Math.max(MIN_CHAR_DELAY_MS, targetTypingMs);

  let punctSlots = 0;
  for (let i = 0; i < chars.length - 1; i += 1) {
    if (isPunctuationPause(chars[i]!)) punctSlots += 1;
  }

  const charSlots = chars.length - 1;
  const normalSlots = charSlots - punctSlots;
  const punctPauseTotal = punctSlots * PUNCTUATION_PAUSE_MS;
  const remaining = Math.max(0, targetTypingMs - punctPauseTotal);

  if (normalSlots === 0) return MIN_CHAR_DELAY_MS;
  return Math.max(MIN_CHAR_DELAY_MS, Math.round(remaining / normalSlots));
}
