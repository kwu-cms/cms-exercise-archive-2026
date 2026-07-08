import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCoordinates } from '../scripts/lib/yao-ingest/coords.mjs';
import { parseStudentIdFromEmail, parseStudentIdFromFilename } from '../scripts/lib/yao-ingest/ids.mjs';
import { classifyMediaFile, publicDestPath } from '../scripts/lib/yao-ingest/media.mjs';
import { parseYaoCsv } from '../scripts/lib/yao-ingest/parse-csv.mjs';
import { reconcileSubmissions } from '../scripts/lib/yao-ingest/reconcile.mjs';

describe('parseStudentIdFromEmail', () => {
  it('converts ka-prefix email to student id', () => {
    expect(parseStudentIdFromEmail('ka225017@konan-wu.ac.jp')).toBe('a225017');
  });
});

describe('parseStudentIdFromFilename', () => {
  it('extracts id from plain filename', () => {
    expect(parseStudentIdFromFilename('a225017.ply')).toBe('a225017');
  });

  it('handles spaces and embedded name', () => {
    expect(parseStudentIdFromFilename('a225020  .spz')).toBe('a225020');
    expect(parseStudentIdFromFilename('a225073脇田悠衣.spz')).toBe('a225073');
  });

  it('is case insensitive', () => {
    expect(parseStudentIdFromFilename('A225071.MP4')).toBe('a225071');
  });
});

describe('parseCoordinates', () => {
  it('parses lat,lng pair', () => {
    expect(parseCoordinates('34.734479,135.288044')).toEqual({
      lat: 34.734479,
      lng: 135.288044,
    });
  });
});

describe('classifyMediaFile', () => {
  it('classifies spz, ply, and video', () => {
    expect(classifyMediaFile('a225008.spz').kind).toBe('spz');
    expect(classifyMediaFile('a225028.ply').kind).toBe('ply');
    expect(classifyMediaFile('a225021.mp4').kind).toBe('video');
    expect(classifyMediaFile('a225041.mov').kind).toBe('video');
  });

  it('skips url and files without student id', () => {
    expect(classifyMediaFile('a225069.mp4.url').kind).toBe('skip');
    expect(classifyMediaFile('k1524801.mp4').kind).toBe('skip');
  });

  it('treats spz.ply double extension as spz', () => {
    expect(classifyMediaFile('a225054.spz.ply').kind).toBe('spz');
  });
});

describe('publicDestPath', () => {
  it('maps media kinds to public paths', () => {
    expect(publicDestPath('spz', 'a225008')).toBe('works/yao/a225008.spz');
    expect(publicDestPath('ply', 'a225028')).toBe('scans/a225028.ply');
    expect(publicDestPath('video', 'a225021')).toBe('works/yao/a225021.mp4');
  });
});

describe('reconcileSubmissions with real reference data', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const csvPath = path.join(
    root,
    'reference/2026-07-08/メディア表現発展演習I_八尾担当分提出フォーム(Sheet1).csv',
  );
  const dataDir = path.join(root, 'reference/2026-07-08/yao_data');

  it('matches csv rows with media files when reference data exists', () => {
    if (!fs.existsSync(csvPath) || !fs.existsSync(dataDir)) return;

    const { rows } = parseYaoCsv(fs.readFileSync(csvPath, 'utf8'));
    const filenames = fs.readdirSync(dataDir).filter((n) => !n.startsWith('.'));
    const result = reconcileSubmissions(rows, filenames);

    expect(rows.length).toBeGreaterThanOrEqual(50);
    expect(result.matched.length).toBeGreaterThanOrEqual(50);
    expect(result.csvOnly).toContain('a225062');
    expect(result.csvOnly).toContain('a225025');
    expect(result.fileOnly.map((f) => f.studentId)).toContain('a225001');
  });
});
