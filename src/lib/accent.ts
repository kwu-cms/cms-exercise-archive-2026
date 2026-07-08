import type { Teacher } from '../data/sessions';

export type AccentKey = Teacher | 'all';

/** 角Rなし・左ボーダーで色分けするカードの共通ベース */
export const SESSION_CARD_BASE = 'border border-line border-l-4 bg-paper';

export const accentBorderLeft: Record<AccentKey, string> = {
  takawo: 'border-l-takawo',
  mizuno: 'border-l-mizuno',
  yao: 'border-l-yao',
  all: 'border-l-ink-soft',
};

export const accentText: Record<Teacher, string> = {
  takawo: 'text-takawo',
  mizuno: 'text-mizuno',
  yao: 'text-yao',
};

export const accentBg: Record<Teacher, string> = {
  takawo: 'bg-takawo',
  mizuno: 'bg-mizuno',
  yao: 'bg-yao',
};

export const accentBorder: Record<Teacher, string> = {
  takawo: 'border-takawo',
  mizuno: 'border-mizuno',
  yao: 'border-yao',
};

export const accentTint: Record<Teacher, string> = {
  takawo: 'bg-takawo-tint/40',
  mizuno: 'bg-mizuno-tint/40',
  yao: 'bg-yao-tint/40',
};

/** セクション背景用のティント（不透明） */
export const accentSectionBg: Record<Teacher, string> = {
  takawo: 'bg-takawo-tint',
  mizuno: 'bg-mizuno-tint',
  yao: 'bg-yao-tint',
};
