/**
 * Astro `base`（GitHub Pages プロジェクトサイト等）付きの絶対パスを返す。
 * 例: withBase('/takawo/') → '/repo-name/takawo/'
 */
export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!path.startsWith('/')) {
    throw new Error(`withBase expects an absolute path starting with "/": ${path}`);
  }
  if (base === '/') return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${path}`;
}
