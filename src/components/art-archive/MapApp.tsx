import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from './MapView';
import ArtworkModal from './ArtworkModal';
import type { Artwork } from '../../lib/art-archive/types';
import {
  findArtworkByWorkId,
  getWorkIdFromSearch,
  setWorkIdInUrl,
} from '../../lib/art-archive/artwork-url-params';
import { scrollToYaoMapSection } from '../../lib/art-archive/map-scroll';
import {
  YAO_ART_CATEGORIES,
  YAO_CATEGORY_COLORS,
  matchesCategoryFilter,
  shortCategoryLabel,
  type YaoArtCategory,
} from '../../lib/art-archive/categories';

interface Props {
  artworks: Artwork[];
  mapboxToken: string;
}

export default function MapApp({ artworks, mapboxToken }: Props) {
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<YaoArtCategory>>(new Set());
  const openedWithPushRef = useRef(false);

  const filteredArtworks = artworks.filter((a) =>
    matchesCategoryFilter(a.categories, activeCategories),
  );

  const openArtwork = useCallback((artwork: Artwork) => {
    setSelected(artwork);
    if (getWorkIdFromSearch() !== artwork.id) {
      setWorkIdInUrl(artwork.id, 'push');
      openedWithPushRef.current = true;
    }
  }, []);

  const closeArtwork = useCallback(() => {
    if (openedWithPushRef.current && getWorkIdFromSearch()) {
      openedWithPushRef.current = false;
      history.back();
      return;
    }

    setSelected(null);
    if (getWorkIdFromSearch()) {
      setWorkIdInUrl(null, 'replace');
    }
    requestAnimationFrame(() => scrollToYaoMapSection());
  }, []);

  useEffect(() => {
    const workId = getWorkIdFromSearch();
    const match = findArtworkByWorkId(artworks, workId) as Artwork | null;
    setSelected(match);
  }, [artworks]);

  useEffect(() => {
    const onPopState = () => {
      openedWithPushRef.current = false;
      const workId = getWorkIdFromSearch();
      const match = findArtworkByWorkId(artworks, workId) as Artwork | null;
      setSelected(match);
      if (!match) {
        requestAnimationFrame(() => scrollToYaoMapSection());
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [artworks]);

  const toggleCategory = (category: YaoArtCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  if (!mapboxToken) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-paper-dim p-6 text-center">
        <p className="text-sm leading-relaxed text-ink-soft">
          Mapboxトークンが未設定です。
          <br />
          <code className="font-mono text-xs">.env</code> に{' '}
          <code className="font-mono text-xs">PUBLIC_MAPBOX_TOKEN</code> を設定してください。
        </p>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-paper-dim p-6 text-center">
        <p className="text-sm text-ink-soft">公開中の作品がありません。</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] rounded border border-line bg-paper/95 p-2 shadow-sm backdrop-blur-sm">
        <p className="mb-1.5 font-mono text-[0.625rem] uppercase tracking-wider text-ink-soft">
          カテゴリで絞り込み
        </p>
        <div className="flex flex-wrap gap-1.5">
          {YAO_ART_CATEGORIES.map((category) => {
            const active = activeCategories.has(category);
            const color = YAO_CATEGORY_COLORS[category];
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCategory(category)}
                className="inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[0.625rem] transition-colors"
                style={{
                  borderColor: active ? color : 'var(--color-line)',
                  backgroundColor: active ? `${color}22` : 'transparent',
                  color: active ? color : 'var(--color-ink-soft)',
                }}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                {shortCategoryLabel(category)}
              </button>
            );
          })}
          {activeCategories.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategories(new Set())}
              className="rounded border border-line px-2 py-1 font-mono text-[0.625rem] text-ink-soft hover:bg-paper-dim"
            >
              すべて表示
            </button>
          )}
        </div>
        <p className="mt-1.5 font-mono text-[0.5625rem] text-ink-soft">
          {filteredArtworks.length} / {artworks.length} 件表示
        </p>
      </div>

      <MapView artworks={filteredArtworks} onSelect={openArtwork} mapboxToken={mapboxToken} />

      {selected && <ArtworkModal artwork={selected} onClose={closeArtwork} />}
    </div>
  );
}
