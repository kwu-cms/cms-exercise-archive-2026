/** 甲南女子大学（神戸市東灘区森北町6-2-23） */
export const KONAN_WU = {
  lng: 135.287563,
  lat: 34.734529,
  zoom: 17.5,
  pitch: 0,
  bearing: -27,
} as const;

export const KONAN_WU_CENTER: [number, number] = [KONAN_WU.lng, KONAN_WU.lat];

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export const MAP_ZOOM_MIN = 17;
export const MAP_ZOOM_MAX = 20;

export function getMapZoomConstraints(): { minZoom?: number; maxZoom?: number } {
  return { minZoom: MAP_ZOOM_MIN, maxZoom: MAP_ZOOM_MAX };
}
