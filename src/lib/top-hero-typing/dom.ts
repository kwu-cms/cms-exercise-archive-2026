import type { TopHeroPhrase } from '../../data/top/hero-phrases';
import { DELETE_CHAR_MS, HOLD_AFTER_TYPING_MS } from './constants';
import { getPhraseDuration } from './duration';
import {
  buildTopHeroKeyframes,
  isFullTopHeroPhrase,
  nextTopHeroKeyframeIndex,
} from './sequence';
import {
  computeBaseCharDelay,
  delayBeforeNextChar,
  type TypingPhase,
} from '../mizuno/hero-typing/timing';

export interface TopHeroTypingDomOptions {
  textEl: HTMLElement;
  cursorEl: HTMLElement;
  phrases: TopHeroPhrase[];
  reducedMotion: boolean;
  onPhraseChange?: (text: string) => void;
}

export function createTopHeroTypingDom(options: TopHeroTypingDomOptions): { destroy: () => void } {
  const { textEl, cursorEl, phrases, reducedMotion, onPhraseChange } = options;

  let keyframes: string[] = [];
  let keyframeIndex = 0;
  let pendingKeyframeIndex = 1;
  let displayedText = '';
  let targetText = '';
  let phase: TypingPhase = 'typing';
  let baseCharDelay = 50;
  let lastStepTime = 0;
  let phaseStartTime = 0;
  let rafId = 0;
  let running = false;

  function render(hideCursor: boolean) {
    textEl.textContent = displayedText;
    cursorEl.classList.toggle('is-hidden', hideCursor);
  }

  function notifyPhraseChange(text: string) {
    if (isFullTopHeroPhrase(text, phrases)) {
      onPhraseChange?.(text);
    }
  }

  function resetSequence() {
    keyframeIndex = 0;
    pendingKeyframeIndex = 1;
    displayedText = keyframes[0] ?? '';
    targetText = keyframes[pendingKeyframeIndex] ?? '';
    phase = displayedText.length < targetText.length ? 'typing' : 'hold';
    const time = performance.now();
    lastStepTime = time;
    phaseStartTime = time;
  }

  function advanceKeyframe() {
    pendingKeyframeIndex = nextTopHeroKeyframeIndex(keyframeIndex, keyframes.length);
    targetText = keyframes[pendingKeyframeIndex] ?? '';
    lastStepTime = performance.now();

    if (displayedText.length < targetText.length) {
      phase = 'typing';
      return;
    }
    if (displayedText.length > targetText.length) {
      phase = 'deleting';
      return;
    }
    phase = 'hold';
    phaseStartTime = lastStepTime;
    keyframeIndex = pendingKeyframeIndex;
  }

  function tick() {
    if (!running) return;

    const time = performance.now();

    if (phase === 'typing') {
      if (displayedText.length < targetText.length) {
        const prevChar =
          displayedText.length > 0 ? displayedText[displayedText.length - 1] : undefined;
        const wait = delayBeforeNextChar(prevChar, baseCharDelay);
        if (displayedText.length === 0 || time - lastStepTime >= wait) {
          displayedText = targetText.slice(0, displayedText.length + 1);
          lastStepTime = time;
        }
      } else {
        phase = 'hold';
        phaseStartTime = time;
        keyframeIndex = pendingKeyframeIndex;
        notifyPhraseChange(displayedText);
      }
      render(false);
    } else if (phase === 'hold') {
      render(true);
      if (time - phaseStartTime >= HOLD_AFTER_TYPING_MS) {
        advanceKeyframe();
      }
    } else if (phase === 'deleting') {
      if (displayedText.length > targetText.length && time - lastStepTime >= DELETE_CHAR_MS) {
        displayedText = displayedText.slice(0, -1);
        lastStepTime = time;
      }
      if (displayedText.length <= targetText.length) {
        phase = 'hold';
        phaseStartTime = time;
        keyframeIndex = pendingKeyframeIndex;
        displayedText = targetText;
        notifyPhraseChange(displayedText);
        render(true);
      } else {
        render(false);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    keyframes = buildTopHeroKeyframes(phrases);
    const longest = keyframes.reduce(
      (longestText, text) => (text.length > longestText.length ? text : longestText),
      '',
    );
    baseCharDelay = computeBaseCharDelay(longest, getPhraseDuration(longest.length));
    resetSequence();
    running = true;

    if (reducedMotion) {
      displayedText = phrases[0]?.text ?? '';
      render(true);
      onPhraseChange?.(displayedText);
      return;
    }

    render(false);
    rafId = requestAnimationFrame(tick);
  }

  function destroy() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  start();

  return { destroy };
}
