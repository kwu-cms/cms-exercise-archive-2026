/** 八尾アートアーカイブのカテゴリー（Google フォーム提出） */
export const YAO_ART_CATEGORIES = [
  '①ビギナーさん向け',
  '②南女生しか絶対知らない',
  '③学外からの見学者に是非オススメ',
] as const;

export type YaoArtCategory = (typeof YAO_ART_CATEGORIES)[number];

/** ピン・凡例用（サイトのアクセント色に対応） */
export const YAO_CATEGORY_COLORS: Record<YaoArtCategory, string> = {
  '①ビギナーさん向け': '#55663c',
  '②南女生しか絶対知らない': '#3f5a73',
  '③学外からの見学者に是非オススメ': '#b5722c',
};

/** 複数カテゴリ時のピン色優先度（②→③→①） */
const PIN_PRIORITY: YaoArtCategory[] = [
  '②南女生しか絶対知らない',
  '③学外からの見学者に是非オススメ',
  '①ビギナーさん向け',
];

const DEFAULT_PIN_COLOR = '#57534a';

export function normalizeCategories(raw: unknown): YaoArtCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is YaoArtCategory =>
    YAO_ART_CATEGORIES.includes(c as YaoArtCategory),
  );
}

export function getPinColor(categories: readonly YaoArtCategory[]): string {
  for (const cat of PIN_PRIORITY) {
    if (categories.includes(cat)) return YAO_CATEGORY_COLORS[cat];
  }
  return DEFAULT_PIN_COLOR;
}

export function matchesCategoryFilter(
  categories: readonly YaoArtCategory[],
  active: ReadonlySet<YaoArtCategory>,
): boolean {
  if (active.size === 0) return true;
  return categories.some((c) => active.has(c));
}

export function shortCategoryLabel(category: YaoArtCategory): string {
  if (category.startsWith('①')) return '①ビギナー';
  if (category.startsWith('②')) return '②南女生';
  if (category.startsWith('③')) return '③学外';
  return category;
}
