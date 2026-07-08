/** Mapbox の現在ビューを map-config.ts 用のスニペットに整形 */
export interface MapViewState {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export function roundMapViewState(state: MapViewState): MapViewState {
  return {
    lng: Number(state.lng.toFixed(6)),
    lat: Number(state.lat.toFixed(6)),
    zoom: Number(state.zoom.toFixed(2)),
    pitch: Number(state.pitch.toFixed(1)),
    bearing: Number(state.bearing.toFixed(1)),
  };
}

export function formatKonanWuSnippet(state: MapViewState): string {
  const s = roundMapViewState(state);
  return `export const KONAN_WU = {
  lng: ${s.lng},
  lat: ${s.lat},
  zoom: ${s.zoom},
  pitch: ${s.pitch},
  bearing: ${s.bearing},
} as const;`;
}

export function isMapViewDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(window.location.search).has('mapViewDebug');
}

export function logMapViewState(state: MapViewState): void {
  const s = roundMapViewState(state);
  const snippet = formatKonanWuSnippet(s);

  console.log(
    '%c[Yao map] map-config.ts に貼り付け → KONAN_WU',
    'font-weight:bold;color:#55663c',
  );
  console.log(snippet);
  console.log('[Yao map] values:', s);
}

/** moveend のたびにコンソールへ出力（開発時 or ?mapViewDebug=1） */
export function attachMapViewDebugLogger(map: {
  on: (event: 'moveend', handler: () => void) => void;
  off: (event: 'moveend', handler: () => void) => void;
  getCenter: () => { lng: number; lat: number };
  getZoom: () => number;
  getPitch: () => number;
  getBearing: () => number;
}): () => void {
  if (!isMapViewDebugEnabled()) return () => {};

  const handler = () => {
    const center = map.getCenter();
    logMapViewState({
      lng: center.lng,
      lat: center.lat,
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    });
  };

  map.on('moveend', handler);

  console.log(
    '%c[Yao map] ビューデバッグ ON — 地図を動かすと KONAN_WU 用の値が出力されます',
    'color:#3f5a73',
  );
  handler();

  return () => map.off('moveend', handler);
}
