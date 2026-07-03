import { createTopHeroMetaballsSketch } from './sketch';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type ActiveInstance = {
  container: HTMLElement;
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

export function initTopHeroMetaballs(container: HTMLElement): void {
  destroyActive();
  initGeneration += 1;
  const generation = initGeneration;
  const reducedMotion = prefersReducedMotion();

  container.style.display = '';

  const { destroy } = createTopHeroMetaballsSketch({
    container,
    reducedMotion,
  });

  if (generation !== initGeneration) {
    destroy();
    return;
  }

  active = { container, destroy };
}

export function destroyTopHeroMetaballs(): void {
  initGeneration += 1;
  destroyActive();
}
