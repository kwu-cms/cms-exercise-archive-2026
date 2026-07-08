import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Artwork } from '../../lib/art-archive/types';
import { getPinColor } from '../../lib/art-archive/categories';
import { getVisibleCampusLabels } from '../../lib/art-archive/campus-labels';
import { KONAN_WU, KONAN_WU_CENTER, MAP_STYLE, getMapZoomConstraints } from '../../lib/art-archive/map-config';
import { attachMapViewDebugLogger } from '../../lib/art-archive/map-view-debug';
import { setupMapbox } from '../../lib/art-archive/setup-mapbox';

interface Props {
  artworks: Artwork[];
  onSelect: (artwork: Artwork) => void;
  mapboxToken: string;
}

function createCampusLabelElement(name: string): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = [
    'pointer-events:none',
    'user-select:none',
    'display:inline-flex',
    'align-items:center',
    'padding:4px 10px',
    'border-radius:4px',
    'background:#9f1239',
    'color:#fff',
    'font-size:12px',
    'font-weight:600',
    'line-height:1.3',
    'white-space:nowrap',
    'box-shadow:0 1px 4px rgba(0,0,0,0.28)',
    'font-family:system-ui,-apple-system,sans-serif',
  ].join(';');
  el.textContent = name;
  return el;
}

function createPinElement(onSelect: () => void, color: string): HTMLButtonElement {
  const pinWidth = 19;
  const pinHeight = 26;

  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', '作品を表示');
  el.style.cssText = [
    `width:${pinWidth}px`,
    `height:${pinHeight}px`,
    'cursor:pointer',
    'padding:0',
    'border:none',
    'background:transparent',
    'display:block',
    'line-height:0',
    'filter:drop-shadow(0 1px 2px rgba(0,0,0,0.32))',
  ].join(';');

  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="${pinWidth}" height="${pinHeight}" aria-hidden="true" focusable="false">
    <path fill="${color}" stroke="#fff" stroke-width="28" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
    <circle cx="192" cy="192" r="72" fill="#fff" opacity="0.92"/>
  </svg>`;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect();
  });
  return el;
}

export default function MapView({ artworks, onSelect, mapboxToken }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const labelMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const artworkMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const syncArtworkMarkers = (map: mapboxgl.Map) => {
    artworkMarkersRef.current.forEach((m) => m.remove());
    artworkMarkersRef.current = [];

    artworks.forEach((artwork) => {
      const color = getPinColor(artwork.categories);
      const el = createPinElement(() => onSelectRef.current(artwork), color);
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
        className: 'campus-art-pin',
      })
        .setLngLat([artwork.lng, artwork.lat])
        .addTo(map);
      artworkMarkersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapRef.current || !mapboxToken) return;

    setupMapbox();
    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: MAP_STYLE,
      center: KONAN_WU_CENTER,
      zoom: KONAN_WU.zoom,
      pitch: KONAN_WU.pitch,
      bearing: KONAN_WU.bearing,
      fadeDuration: 0,
      ...getMapZoomConstraints(),
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    mapInstanceRef.current = map;

    const detachMapDebug = attachMapViewDebugLogger(map);

    map.once('idle', () => {
      getVisibleCampusLabels().forEach((label) => {
        const el = createCampusLabelElement(label.name);
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
          className: 'campus-building-label',
        })
          .setLngLat([label.lng, label.lat])
          .addTo(map);
        labelMarkersRef.current.push(marker);
      });

      syncArtworkMarkers(map);
    });

    return () => {
      detachMapDebug();
      artworkMarkersRef.current.forEach((m) => m.remove());
      artworkMarkersRef.current = [];
      labelMarkersRef.current.forEach((m) => m.remove());
      labelMarkersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    syncArtworkMarkers(map);
  }, [artworks]);

  return <div ref={mapRef} className="h-full w-full" />;
}
