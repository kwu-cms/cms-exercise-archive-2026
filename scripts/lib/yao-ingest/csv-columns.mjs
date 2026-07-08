/** Google フォーム CSV の列名（先頭一致で解決） */
export const CSV_COLUMN_PREFIXES = {
  email: 'メール',
  group: '自分のグループを選んでください',
  title: 'あなたのアートリソースを名付けてください',
  comment: 'そのアートリソースの見どころ',
  categories: 'そのアートリソースはどのカテゴリーにしますか',
  coordinates: 'そのアートリソースの位置情報をコピーしてください',
  completedAt: '完了時刻',
};

/** @param {string[]} headers */
export function resolveCsvColumns(headers) {
  /** @type {Record<keyof typeof CSV_COLUMN_PREFIXES, string | null>} */
  const resolved = {
    email: null,
    group: null,
    title: null,
    comment: null,
    categories: null,
    coordinates: null,
    completedAt: null,
  };

  for (const header of headers) {
    for (const [key, prefix] of Object.entries(CSV_COLUMN_PREFIXES)) {
      if (header.startsWith(prefix)) {
        resolved[key] = header;
      }
    }
  }

  return resolved;
}
