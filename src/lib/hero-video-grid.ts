/** Hero 背景動画グリッド（ThemeHero 用） */
import { withBase } from './base-url';

const FADE_MS = 400;
const VIDEO_SELECTOR = '.hero-video';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 1.0;

type VideoSlot = {
  el: HTMLVideoElement;
  currentIndex: number;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistinctIndices(poolSize: number, count: number, exclude: Set<number> = new Set()): number[] {
  const candidates = Array.from({ length: poolSize }, (_, i) => i).filter((i) => !exclude.has(i));
  const picked = shuffle(candidates).slice(0, count);
  if (picked.length < count) {
    const extra = shuffle(Array.from({ length: poolSize }, (_, i) => i))
      .filter((i) => !picked.includes(i))
      .slice(0, count - picked.length);
    picked.push(...extra);
  }
  return picked.slice(0, count);
}

function randomPlaybackRate(): number {
  return MIN_PLAYBACK_RATE + Math.random() * (MAX_PLAYBACK_RATE - MIN_PLAYBACK_RATE);
}

function applyPlaybackRate(video: HTMLVideoElement): void {
  video.playbackRate = randomPlaybackRate();
}

function videoUrlAt(videos: readonly string[], index: number): string {
  return withBase(videos[index]);
}

function setVideoSource(video: HTMLVideoElement, videos: readonly string[], index: number) {
  const url = videoUrlAt(videos, index);
  if (video.dataset.src === url) return;
  video.dataset.src = url;
  video.src = url;
  applyPlaybackRate(video);
}

async function fade(video: HTMLVideoElement, to: number): Promise<void> {
  video.style.transition = `opacity ${FADE_MS}ms ease`;
  video.style.opacity = String(to);
  await new Promise((resolve) => setTimeout(resolve, FADE_MS));
}

async function swapVideo(
  slot: VideoSlot,
  videos: readonly string[],
  usedElsewhere: Set<number>,
): Promise<void> {
  const nextIndex = pickDistinctIndices(videos.length, 1, usedElsewhere)[0];
  await fade(slot.el, 0);
  slot.currentIndex = nextIndex;
  setVideoSource(slot.el, videos, nextIndex);
  slot.el.load();
  try {
    await slot.el.play();
  } catch {
    // autoplay 制限などは無視
  }
  await fade(slot.el, 1);
}

function initGrid(grid: HTMLElement, videos: readonly string[]): () => void {
  const poolSize = videos.length;
  if (poolSize === 0) return () => {};

  const videoEls = Array.from(grid.querySelectorAll<HTMLVideoElement>(VIDEO_SELECTOR));
  if (videoEls.length === 0) return () => {};

  const initialIndices = pickDistinctIndices(poolSize, videoEls.length);
  const slots: VideoSlot[] = videoEls.map((el, i) => {
    el.muted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.preload = 'metadata';
    el.style.opacity = '1';
    const currentIndex = initialIndices[i] ?? i % poolSize;
    setVideoSource(el, videos, currentIndex);
    return { el, currentIndex };
  });

  const onEndedHandlers: Array<() => void> = [];

  slots.forEach((slot) => {
    const handler = () => {
      const used = new Set(slots.map((s) => s.currentIndex));
      used.delete(slot.currentIndex);
      void swapVideo(slot, videos, used);
    };
    slot.el.addEventListener('ended', handler);
    onEndedHandlers.push(() => slot.el.removeEventListener('ended', handler));
  });

  const playAll = () => {
    slots.forEach((slot) => {
      void slot.el.play().catch(() => {});
    });
  };

  const pauseAll = () => {
    slots.forEach((slot) => slot.el.pause());
  };

  playAll();

  const section = grid.closest('.theme-hero');
  let observer: IntersectionObserver | undefined;

  if (section) {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) playAll();
        else pauseAll();
      },
      { threshold: 0.15 },
    );
    observer.observe(section);
  }

  return () => {
    onEndedHandlers.forEach((off) => off());
    observer?.disconnect();
    pauseAll();
  };
}

const cleanups = new Map<HTMLElement, () => void>();

export function initHeroVideoGrid(grid: HTMLElement, videos: readonly string[]): void {
  cleanups.get(grid)?.();

  if (prefersReducedMotion()) {
    grid.style.display = 'none';
    cleanups.delete(grid);
    return;
  }

  grid.style.display = '';
  cleanups.set(grid, initGrid(grid, videos));
}

export function initAllHeroVideoGrids(
  pools: Record<string, readonly string[]>,
): void {
  document.querySelectorAll<HTMLElement>('[data-hero-video-grid]').forEach((grid) => {
    const theme = grid.dataset.heroTheme;
    if (!theme) return;
    const videos = pools[theme];
    if (!videos?.length) return;
    initHeroVideoGrid(grid, videos);
  });
}
