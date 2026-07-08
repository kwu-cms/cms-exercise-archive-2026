import type { YaoArtCategory } from './categories';

/** JSON（public/data/yao/artworks.json）1件分 */
export interface ArtworkInput {
  id: string;
  title: string;
  author: string;
  comment?: string | null;
  lat: number;
  lng: number;
  location_name?: string | null;
  file_spz?: string | null;
  file_mp4?: string | null;
  thumbnail?: string | null;
  categories?: string[];
  /** true / 1 のみ地図に表示 */
  published?: boolean | number;
  created_at?: string;
}

export interface ArtworksManifest {
  artworks: ArtworkInput[];
}

/** 正規化後（アセット URL 解決済み） */
export interface Artwork {
  id: string;
  title: string;
  author: string;
  comment: string | null;
  categories: YaoArtCategory[];
  lat: number;
  lng: number;
  locationName: string | null;
  urlSpz: string | null;
  urlMp4: string | null;
  urlThumbnail: string | null;
  createdAt: string;
}
