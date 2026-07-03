import { TOP_HERO_PHRASES } from '../../data/top/hero-phrases';
import { createTopHeroTypingDom } from './dom';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type ActiveInstance = {
  destroy: () => void;
};

let active: ActiveInstance | null = null;
let initGeneration = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function destroyActive(): void {
  if (!active) return;
  active.destroy();
  active = null;
}

export function initTopHeroTyping(root: HTMLElement): void {
  destroyActive();
  initGeneration += 1;
  const generation = initGeneration;

  const textEl = root.querySelector<HTMLElement>('[data-top-hero-typing-text]');
  const cursorEl = root.querySelector<HTMLElement>('[data-top-hero-typing-cursor]');
  const live = root.querySelector<HTMLElement>('[data-top-hero-typing-live]');

  if (!textEl || !cursorEl) return;

  const { destroy } = createTopHeroTypingDom({
    textEl,
    cursorEl,
    phrases: TOP_HERO_PHRASES,
    reducedMotion: prefersReducedMotion(),
    onPhraseChange: (text) => {
      if (live) live.textContent = text;
    },
  });

  if (generation !== initGeneration) {
    destroy();
    return;
  }

  active = { destroy };
}

export function destroyTopHeroTyping(): void {
  initGeneration += 1;
  destroyActive();
}
