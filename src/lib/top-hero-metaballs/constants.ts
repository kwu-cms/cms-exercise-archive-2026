/** 教員アクセント RGB（global.css と同期） */
export const THEME_COLORS = {
  takawo: [181, 114, 44] as const,
  mizuno: [63, 90, 115] as const,
  yao: [85, 102, 60] as const,
} as const;

export const PAPER_RGB: readonly [number, number, number] = [245, 242, 233];

/** メタボールの柔らかさ（低いほどモニョっと溶け合い、拡散した印象になる） */
export const METABALL_POWER = 1.68;
export const METABALL_STRENGTH = 0.8;

/** FPS が落ちたときに段階的に下げる解像度の下限 */
export const MIN_FIELD_SCALE = 0.18;
