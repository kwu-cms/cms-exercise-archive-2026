import { resolveAssetUrl } from './resolve-asset-url';
import type { Artwork, ArtworkInput, ArtworksManifest } from './types';

/** 作品 JSON の URL（GitHub Pages の base 付き） */
export function getArtworksDataUrl(): string {
  const base = import.meta.env.BASE_URL;
  const path = '/data/yao/artworks.json';
  if (base === '/') return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${path}`;
}

function isPublished(value: ArtworkInput['published']): boolean {
  if (value === undefined) return true;
  if (typeof value === 'boolean') return value;
  return value === 1;
}

export function normalizeArtwork(input: ArtworkInput, base = '/'): Artwork | null {
  if (!isPublished(input.published)) return null;

  return {
    id: input.id,
    title: input.title,
    author: input.author,
    comment: input.comment?.trim() ? input.comment.trim() : null,
    lat: Number(input.lat),
    lng: Number(input.lng),
    locationName: input.location_name?.trim() ? input.location_name.trim() : null,
    urlSpz: resolveAssetUrl(input.file_spz, base),
    urlMp4: resolveAssetUrl(input.file_mp4, base),
    urlThumbnail: resolveAssetUrl(input.thumbnail, base),
    createdAt: input.created_at ?? '',
  };
}

export function normalizeArtworks(inputs: ArtworkInput[], base = '/'): Artwork[] {
  return inputs
    .map((item) => normalizeArtwork(item, base))
    .filter((item): item is Artwork => item !== null);
}

export async function fetchArtworks(dataUrl = getArtworksDataUrl()): Promise<Artwork[]> {
  const res = await fetch(dataUrl);
  if (!res.ok) {
    throw new Error(`作品データの読み込みに失敗しました（${res.status}）`);
  }

  const data = (await res.json()) as ArtworksManifest | ArtworkInput[];
  const items = Array.isArray(data) ? data : data.artworks;
  const base = import.meta.env.BASE_URL;
  return normalizeArtworks(items ?? [], base);
}
