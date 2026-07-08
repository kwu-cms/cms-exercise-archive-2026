import { parseStudentIdFromFilename } from './ids.mjs';

const SKIP_EXTENSIONS = new Set(['.url']);

/** @typedef {'spz' | 'ply' | 'video' | 'skip'} MediaKind */

/**
 * @param {string} filename
 * @returns {{ kind: MediaKind; studentId: string | null; ext: string | null }}
 */
export function classifyMediaFile(filename) {
  const trimmed = String(filename).trim();
  const dot = trimmed.lastIndexOf('.');
  if (dot < 0) return { kind: 'skip', studentId: null, ext: null };

  let ext = trimmed.slice(dot).toLowerCase();

  // a225054.spz.ply のような二重拡張子
  if (ext === '.ply' && trimmed.toLowerCase().endsWith('.spz.ply')) {
    ext = '.spz';
  }

  if (SKIP_EXTENSIONS.has(ext)) {
    return { kind: 'skip', studentId: parseStudentIdFromFilename(trimmed), ext };
  }

  const studentId = parseStudentIdFromFilename(trimmed);
  if (!studentId) return { kind: 'skip', studentId: null, ext };

  if (ext === '.spz') return { kind: 'spz', studentId, ext };
  if (ext === '.ply') return { kind: 'ply', studentId, ext };
  if (ext === '.mp4' || ext === '.mov') return { kind: 'video', studentId, ext };

  return { kind: 'skip', studentId, ext };
}

/** コピー先の public 相対パス */
export function publicDestPath(kind, studentId) {
  if (kind === 'spz') return `works/yao/${studentId}.spz`;
  if (kind === 'ply') return `scans/${studentId}.ply`;
  if (kind === 'video') return `works/yao/${studentId}.mp4`;
  return null;
}
