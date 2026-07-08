export const MIN_DURATION_MS = 10_000;
export const MAX_DURATION_MS = 20_000;
export const HOLD_AFTER_TYPING_MS = 2_000;
export const GAP_AFTER_DELETE_MS = 400;
export const PUNCTUATION_PAUSE_MS = 340;
export const DELETE_CHAR_MS = 44;
export const MIN_CHAR_DELAY_MS = 28;
export const MIN_CHARS_FOR_DURATION = 120;
export const MAX_CHARS_FOR_DURATION = 420;

export const PADDING_X_RATIO = 0;
export const PADDING_Y_RATIO = 0;

/** スクロール前提の固定サイズ（全体縮小はしない） */
export const FONT_SIZE_DESKTOP = 32;
export const FONT_SIZE_MOBILE = 22;
export const FONT_SIZE_MIN = 16;

export const MOBILE_BREAKPOINT = 768;

/** CJK 明朝の実測高さに合わせた行送り倍率 */
export const LINE_HEIGHT_RATIO = 2.05;

/** 溢れた行のスクロール追従（0〜1、大きいほど速い） */
export const SCROLL_LERP = 0.14;

export const TEXT_FILL: [number, number, number, number] = [18, 16, 13, 245];
export const CURSOR_STROKE: [number, number, number, number] = [18, 16, 13, 255];
export const TEXT_SHADOW: [number, number, number, number] = [255, 252, 248, 90];

/** @deprecated FONT_SIZE_DESKTOP を使用 */
export const FONT_SIZE_MAX = FONT_SIZE_DESKTOP;
/** @deprecated FONT_SIZE_MOBILE を使用 */
export const FONT_SIZE_MAX_MOBILE = FONT_SIZE_MOBILE;
