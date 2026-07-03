import { useState } from 'react';
import MapView from './MapView';
import ArtworkModal from './ArtworkModal';
import type { Artwork } from '../../lib/art-archive/types';

interface Props {
  artworks: Artwork[];
  mapboxToken: string;
}

export default function MapApp({ artworks, mapboxToken }: Props) {
  const [selected, setSelected] = useState<Artwork | null>(null);

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
      <MapView artworks={artworks} onSelect={setSelected} mapboxToken={mapboxToken} />
      {!selected && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 max-w-[90vw] -translate-x-1/2 rounded-full bg-paper/95 px-4 py-2 text-center font-mono text-xs text-ink-soft shadow-md">
          ピンをクリックして3D作品を表示
        </p>
      )}
      {selected && <ArtworkModal artwork={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
