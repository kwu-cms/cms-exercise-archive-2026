/** 甲南女子大学（神戸市東灘区森北町6-2-23）
 *  初期ビュー調整: 開発サーバーで /yao/ を開き、地図を動かすと console に KONAN_WU 用の値が出ます。
 *  本番プレビューでは ?mapViewDebug=1 を付けても同様です。
 */
export const KONAN_WU = {
  lng: 135.287483,
  lat: 34.734773,
  zoom: 17.73,
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
