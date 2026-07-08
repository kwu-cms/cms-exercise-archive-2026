import { parse } from 'csv-parse/sync';
import { parseCategories } from './categories.mjs';
import { parseCoordinates } from './coords.mjs';
import { parseStudentIdFromEmail } from './ids.mjs';
import { resolveCsvColumns } from './csv-columns.mjs';

/** @param {string} value */
function formatCreatedAt(value) {
  if (!value) return '';
  const match = String(value).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return String(value).trim();
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * @param {string} csvText
 * @returns {{ rows: import('./reconcile.mjs').CsvSubmission[]; columns: ReturnType<typeof resolveCsvColumns> }}
 */
export function parseYaoCsv(csvText) {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  });

  if (records.length === 0) {
    return { rows: [], columns: resolveCsvColumns([]) };
  }

  const columns = resolveCsvColumns(Object.keys(records[0]));
  const rows = [];

  for (const record of records) {
    const email = columns.email ? record[columns.email] : '';
    const studentId = parseStudentIdFromEmail(email);
    if (!studentId) continue;

    const coordsRaw = columns.coordinates ? record[columns.coordinates] : '';
    const coords = parseCoordinates(coordsRaw);

    rows.push({
      studentId,
      group: columns.group ? String(record[columns.group] ?? '').trim() : '',
      title: columns.title ? String(record[columns.title] ?? '').trim() : '',
      comment: columns.comment ? String(record[columns.comment] ?? '').trim() : '',
      categories: columns.categories ? parseCategories(record[columns.categories]) : [],
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      createdAt: columns.completedAt ? formatCreatedAt(record[columns.completedAt]) : '',
    });
  }

  return { rows, columns };
}
