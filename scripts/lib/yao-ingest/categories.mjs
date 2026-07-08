/** Google フォームのカテゴリー選択肢（CSV のセミコロン区切り） */
export const YAO_ART_CATEGORIES = [
  '①ビギナーさん向け',
  '②南女生しか絶対知らない',
  '③学外からの見学者に是非オススメ',
];

/** @param {string} raw */
export function parseCategories(raw) {
  if (!raw) return [];
  const items = String(raw)
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  return YAO_ART_CATEGORIES.filter((c) => items.includes(c));
}
