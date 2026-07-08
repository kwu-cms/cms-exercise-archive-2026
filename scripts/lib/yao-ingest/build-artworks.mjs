import { publicDestPath } from './media.mjs';
import { hasAnyMedia, pickPrimary3d } from './reconcile.mjs';

/**
 * @param {import('./reconcile.mjs').CsvSubmission} csv
 * @param {import('./reconcile.mjs').StudentMedia} media
 */
export function buildArtworkFromMatch(csv, media) {
  const primary3d = pickPrimary3d(media);
  const fileSpz = primary3d ? publicDestPath(primary3d.kind, csv.studentId) : null;
  const fileMp4 = media.video ? publicDestPath('video', csv.studentId) : null;

  return {
    id: csv.studentId,
    title: csv.title || csv.studentId,
    author: csv.group || '提出者',
    comment: csv.comment || null,
    categories: csv.categories?.length ? csv.categories : [],
    lat: csv.lat ?? 0,
    lng: csv.lng ?? 0,
    location_name: null,
    file_spz: fileSpz,
    file_mp4: fileMp4,
    thumbnail: null,
    published: hasAnyMedia(media),
    created_at: csv.createdAt || '',
  };
}

/** CSV のみ（メディア未着） */
export function buildArtworkFromCsvOnly(csv) {
  return {
    id: csv.studentId,
    title: csv.title || csv.studentId,
    author: csv.group || '提出者',
    comment: csv.comment || null,
    categories: csv.categories?.length ? csv.categories : [],
    lat: csv.lat ?? 0,
    lng: csv.lng ?? 0,
    location_name: null,
    file_spz: null,
    file_mp4: null,
    thumbnail: null,
    published: false,
    created_at: csv.createdAt || '',
  };
}

/**
 * @param {import('./reconcile.mjs').CsvSubmission[]} csvRows
 * @param {ReturnType<import('./reconcile.mjs').reconcileSubmissions>} reconciliation
 */
export function buildArtworksManifest(csvRows, reconciliation) {
  /** @type {Map<string, import('./reconcile.mjs').CsvSubmission>} */
  const csvById = new Map(csvRows.map((r) => [r.studentId, r]));

  const artworks = reconciliation.matched.map(({ csv, media }) =>
    buildArtworkFromMatch(csv, media),
  );

  for (const studentId of reconciliation.csvOnly) {
    const csv = csvById.get(studentId);
    if (csv) artworks.push(buildArtworkFromCsvOnly(csv));
  }

  artworks.sort((a, b) => a.id.localeCompare(b.id));
  return { artworks };
}
