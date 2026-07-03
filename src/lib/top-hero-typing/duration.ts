import {
  MAX_CHARS_FOR_PHRASE_DURATION,
  MAX_PHRASE_DURATION_MS,
  MIN_CHARS_FOR_PHRASE_DURATION,
  MIN_PHRASE_DURATION_MS,
} from './constants';

export function getPhraseDuration(length: number): number {
  const t = Math.min(
    1,
    Math.max(
      0,
      (length - MIN_CHARS_FOR_PHRASE_DURATION) /
        (MAX_CHARS_FOR_PHRASE_DURATION - MIN_CHARS_FOR_PHRASE_DURATION),
    ),
  );
  return Math.round(MIN_PHRASE_DURATION_MS + t * (MAX_PHRASE_DURATION_MS - MIN_PHRASE_DURATION_MS));
}
