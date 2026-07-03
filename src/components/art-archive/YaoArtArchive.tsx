import { useEffect, useState } from 'react';
import { fetchArtworks, getArtworksDataUrl } from '../../lib/art-archive/load-artworks';
import type { Artwork } from '../../lib/art-archive/types';
import MapApp from './MapApp';

interface Props {
  mapboxToken: string;
  initialArtworks: Artwork[];
}

export default function YaoArtArchive({ mapboxToken, initialArtworks }: Props) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    initialArtworks.length > 0 ? 'ready' : 'loading',
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialArtworks.length > 0) return;

    let cancelled = false;

    fetchArtworks(getArtworksDataUrl())
      .then((items) => {
        if (cancelled) return;
        setArtworks(items);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (initialArtworks.length > 0) {
          setStatus('ready');
          return;
        }
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : '作品データの読み込みに失敗しました');
      });

    return () => {
      cancelled = true;
    };
  }, [initialArtworks]);

  if (status === 'loading') {
    return (
      <div className="flex h-[min(70vh,640px)] min-h-[420px] items-center justify-center bg-paper-dim">
        <p className="font-mono text-xs text-ink-soft">作品データを読み込み中…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-[min(70vh,640px)] min-h-[420px] items-center justify-center bg-paper-dim p-6 text-center">
        <p className="text-sm text-ink-soft">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-[min(70vh,640px)] min-h-[420px]">
      <MapApp artworks={artworks} mapboxToken={mapboxToken} />
    </div>
  );
}
