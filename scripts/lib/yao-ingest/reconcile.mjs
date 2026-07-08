import { classifyMediaFile } from './media.mjs';

/**
 * @typedef {Object} CsvSubmission
 * @property {string} studentId
 * @property {string} group
 * @property {string} title
 * @property {string} comment
 * @property {string[]} categories
 * @property {number | null} lat
 * @property {number | null} lng
 * @property {string} createdAt
 */

/**
 * @typedef {Object} MediaFile
 * @property {string} filename
 * @property {string} studentId
 * @property {'spz' | 'ply' | 'video'} kind
 */

/**
 * @typedef {Object} StudentMedia
 * @property {MediaFile | null} spz
 * @property {MediaFile | null} ply
 * @property {MediaFile | null} video
 */

/**
 * @param {CsvSubmission[]} csvRows
 * @param {string[]} filenames
 */
export function reconcileSubmissions(csvRows, filenames) {
  /** @type {Map<string, CsvSubmission>} */
  const csvById = new Map();
  for (const row of csvRows) {
    csvById.set(row.studentId, row);
  }

  /** @type {Map<string, StudentMedia>} */
  const mediaById = new Map();
  /** @type {string[]} */
  const unidentified = [];
  /** @type {string[]} */
  const skipped = [];

  for (const filename of filenames) {
    const { kind, studentId } = classifyMediaFile(filename);
    if (kind === 'skip') {
      if (studentId) skipped.push(filename);
      else unidentified.push(filename);
      continue;
    }

    const entry = mediaById.get(studentId) ?? { spz: null, ply: null, video: null };
    const media = { filename, studentId, kind };

    if (kind === 'spz' && !entry.spz) entry.spz = media;
    else if (kind === 'ply' && !entry.ply) entry.ply = media;
    else if (kind === 'video' && !entry.video) entry.video = media;

    mediaById.set(studentId, entry);
  }

  /** @type {Array<{ studentId: string; csv: CsvSubmission; media: StudentMedia }>} */
  const matched = [];
  /** @type {string[]} */
  const csvOnly = [];
  /** @type {Array<{ studentId: string; media: StudentMedia }>} */
  const fileOnly = [];

  for (const [studentId, csv] of csvById) {
    const media = mediaById.get(studentId) ?? { spz: null, ply: null, video: null };
    const hasMedia = Boolean(media.spz || media.ply || media.video);
    if (hasMedia) {
      matched.push({ studentId, csv, media });
    } else {
      csvOnly.push(studentId);
    }
  }

  for (const [studentId, media] of mediaById) {
    if (!csvById.has(studentId)) {
      fileOnly.push({ studentId, media });
    }
  }

  matched.sort((a, b) => a.studentId.localeCompare(b.studentId));
  csvOnly.sort();
  fileOnly.sort((a, b) => a.studentId.localeCompare(b.studentId));
  unidentified.sort();
  skipped.sort();

  return { matched, csvOnly, fileOnly, unidentified, skipped };
}

/** 3D ファイルの優先（spz > ply） */
export function pickPrimary3d(media) {
  if (media.spz) return media.spz;
  if (media.ply) return media.ply;
  return null;
}

export function hasAnyMedia(media) {
  return Boolean(media.spz || media.ply || media.video);
}
