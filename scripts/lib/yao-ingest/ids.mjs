const STUDENT_ID_RE = /a\d{6}/i;

/** メールアドレスから学籍番号を抽出（ka225017@... → a225017） */
export function parseStudentIdFromEmail(email) {
  if (!email) return null;
  const local = String(email).split('@')[0]?.trim().toLowerCase();
  if (!local) return null;
  const match = local.match(STUDENT_ID_RE);
  if (!match) return null;
  return match[0].toLowerCase();
}

/** ファイル名から学籍番号を抽出 */
export function parseStudentIdFromFilename(filename) {
  if (!filename) return null;
  const base = String(filename).trim();
  const match = base.match(STUDENT_ID_RE);
  if (!match) return null;
  return match[0].toLowerCase();
}
