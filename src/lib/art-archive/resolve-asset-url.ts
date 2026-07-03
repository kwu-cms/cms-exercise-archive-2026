export function resolveAssetUrl(path: string | null | undefined, base = '/'): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const normalized = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const baseUrl = base.endsWith('/') ? base : `${base}/`;
  return `${baseUrl}${normalized}`;
}
