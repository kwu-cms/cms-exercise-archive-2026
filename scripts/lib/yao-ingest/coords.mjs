/** "34.734479,135.288044" などから緯度経度を抽出 */
export function parseCoordinates(text) {
  if (!text) return null;
  const match = String(text).match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
