export const ARTWORK_URL_PARAM = 'work';

export function getWorkIdFromSearch(search = ''): string | null {
  if (typeof window !== 'undefined' && !search) {
    search = window.location.search;
  }
  const id = new URLSearchParams(search).get(ARTWORK_URL_PARAM);
  return id?.trim() ? id.trim() : null;
}

export function buildArtworkShareUrl(workId: string, href = window.location.href): string {
  const url = new URL(href);
  url.searchParams.set(ARTWORK_URL_PARAM, workId);
  return url.toString();
}

/** 作品モーダル用の URL クエリを更新 */
export function setWorkIdInUrl(
  workId: string | null,
  mode: 'push' | 'replace' = 'replace',
): void {
  const url = new URL(window.location.href);
  if (workId) url.searchParams.set(ARTWORK_URL_PARAM, workId);
  else url.searchParams.delete(ARTWORK_URL_PARAM);

  if (mode === 'push') history.pushState(null, '', url);
  else history.replaceState(null, '', url);
}

export function findArtworkByWorkId(
  artworks: readonly { id: string }[],
  workId: string | null,
): { id: string } | null {
  if (!workId) return null;
  return artworks.find((a) => a.id === workId) ?? null;
}
