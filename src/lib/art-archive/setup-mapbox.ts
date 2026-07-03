import mapboxgl from 'mapbox-gl';
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';

let configured = false;

/** Vite / GitHub Pages サブパスでも Mapbox worker が確実に読み込まれるよう設定 */
export function setupMapbox(): void {
  if (configured) return;
  mapboxgl.workerClass = MapboxWorker;
  configured = true;
}
