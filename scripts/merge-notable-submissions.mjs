/**
 * reference/notable_students/*.docx のテーブルから提出課題項目を抽出し、
 * src/data/takawo/notable-submissions.json にマージする。
 *
 * 実行: node scripts/merge-notable-submissions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const docxDir = path.join(root, 'reference/notable_students');
const jsonPath = path.join(root, 'src/data/takawo/notable-submissions.json');
const extractorPath = path.join(root, 'scripts/extract-docx-tables.py');

const extracted = JSON.parse(
  execSync(`python3 "${extractorPath}" "${docxDir}"`, { encoding: 'utf8' }),
);

const submissions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let merged = 0;
const missing = [];

for (const item of submissions) {
  const sid = item.internal?.student_id;
  if (!sid || !extracted[sid]) {
    missing.push(item.id);
    continue;
  }
  const data = extracted[sid];
  const { student_name: _studentName, source_file: _sourceFile, ...fields } = data;
  item.submission = fields;
  item.internal = {
    ...item.internal,
    source_file: `${sid}.docx`,
  };
  merged += 1;
}

fs.writeFileSync(jsonPath, JSON.stringify(submissions, null, 2) + '\n');

const docxIds = new Set(Object.keys(extracted));
const jsonIds = new Set(submissions.map((s) => s.internal?.student_id).filter(Boolean));
const onlyDocx = [...docxIds].filter((id) => !jsonIds.has(id));

console.log(`Merged ${merged}/${submissions.length} submissions`);
if (missing.length) console.log('Missing docx for:', missing.join(', '));
if (onlyDocx.length) console.log('Docx without JSON entry:', onlyDocx.join(', '));
