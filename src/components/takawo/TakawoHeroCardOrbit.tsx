import { useEffect, useRef, useState } from 'react';
import { initHeroOrbitScene } from '../../lib/takawo/hero-card-orbit/scene';
import {
  dispatchOpenSubmission,
  type HeroOrbitCard,
} from '../../lib/takawo/hero-card-orbit/types';

interface Props {
  cards: HeroOrbitCard[];
}

export default function TakawoHeroCardOrbit({ cards }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const focused = cards[focusedIndex] ?? cards[0] ?? null;

  useEffect(() => {
    const el = mountRef.current;
    if (!el || cards.length === 0) return;

    const scene = initHeroOrbitScene(el, cards);
    scene.onFocusChange((index) => setFocusedIndex(index));

    return () => scene.dispose();
  }, [cards]);

  if (cards.length === 0) return null;

  return (
    <div className="takawo-orbit absolute inset-0 z-0">
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {focused && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[var(--color-takawo-hero-bg)] via-[var(--color-takawo-hero-bg)]/94 to-transparent px-4 pb-5 pt-20 sm:px-8 sm:pb-7">
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-paper/55">
                {focused.category}
              </span>
              <span className="font-mono text-[0.625rem] tracking-wider text-takawo">
                {focused.cardCode} · {focused.cardName}
              </span>
            </div>
            <h2 className="font-display text-xl leading-snug text-paper sm:text-2xl">
              {focused.title}
            </h2>
            <p className="line-clamp-3 text-sm leading-relaxed text-paper/72">
              {focused.summary}
            </p>
            <div className="pointer-events-auto flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => dispatchOpenSubmission(focused.id)}
                className="border border-takawo bg-takawo px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-wider text-paper transition-colors hover:bg-transparent hover:text-takawo"
              >
                詳細を見る
              </button>
              <div className="flex flex-wrap gap-1.5" aria-hidden="true">
                {cards.map((card, i) => (
                  <span
                    key={card.id}
                    className={`inline-block h-1 w-1 ${
                      i === focusedIndex ? 'bg-takawo' : 'bg-paper/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
