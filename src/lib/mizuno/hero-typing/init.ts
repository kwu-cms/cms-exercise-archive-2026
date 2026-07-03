import { MIZUNO_DIARIES } from '../../../data/mizuno/diaries';
import { withBase } from '../../base-url';
import { createMizunoHeroTypingSketch } from './sketch';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FONT_URL = withBase('/fonts/ShipporiMincho-Medium.woff2');

type ActiveInstance = {
  container: HTMLElement;
  destroy: () => void;
};

let active: ActiveInstance | null = null;
let initGeneration = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

async function waitForDocumentFonts(): Promise<void> {
  if (document.documentElement.classList.contains('fonts-ready')) return;
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
}

function destroyActive(): void {
  if (!active) return;
  active.destroy();
  active = null;
}

export function initMizunoHeroTyping(container: HTMLElement): void {
  destroyActive();
  initGeneration += 1;
  const generation = initGeneration;

  if (prefersReducedMotion()) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';

  void waitForDocumentFonts().then(() => {
    if (!container.isConnected || generation !== initGeneration) return;

    const { destroy } = createMizunoHeroTypingSketch({
      container,
      fontUrl: FONT_URL,
      diaries: MIZUNO_DIARIES,
      reducedMotion: prefersReducedMotion(),
    });

    if (generation !== initGeneration) {
      destroy();
      return;
    }

    active = { container, destroy };
  });
}

export function destroyMizunoHeroTyping(): void {
  initGeneration += 1;
  destroyActive();
}
