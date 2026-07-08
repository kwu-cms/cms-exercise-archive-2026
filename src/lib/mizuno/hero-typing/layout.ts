import type p5 from 'p5';
import {
  CHAR_WIDTH_SAMPLE,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LINE_HEIGHT_RATIO,
  MAX_CHARS_FOR_DURATION,
  MAX_DURATION_MS,
  MIN_CHARS_FOR_DURATION,
  MIN_CHARS_PER_LINE,
  MIN_DURATION_MS,
  MIN_VISIBLE_LINES,
  PADDING_X_RATIO,
  PADDING_Y_RATIO,
} from './constants';

export interface TextLayoutContext {
  setFontSize(size: number): void;
  measureWidth(text: string): number;
  measureBounds(text: string): { w: number; h: number };
  textHeightFor?(fontSize: number): number;
  lineHeightFor?(fontSize: number): number;
}

export interface TextBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextLayout {
  fontSize: number;
  lineHeight: number;
  maxVisibleLines: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getDurationByLength(length: number): number {
  const t = Math.min(
    1,
    Math.max(0, (length - MIN_CHARS_FOR_DURATION) / (MAX_CHARS_FOR_DURATION - MIN_CHARS_FOR_DURATION)),
  );
  return MIN_DURATION_MS + t * (MAX_DURATION_MS - MIN_DURATION_MS);
}

/** 代表文字列から 1 字あたりの平均幅を測る（比例フォント近似） */
export function measureAvgCharWidth(ctx: TextLayoutContext, fontSize: number): number {
  ctx.setFontSize(fontSize);
  const chars = [...CHAR_WIDTH_SAMPLE];
  if (chars.length === 0) return fontSize;
  return ctx.measureWidth(CHAR_WIDTH_SAMPLE) / chars.length;
}

/** 指定サイズで box 内に最低限の行数・字数が収まるか */
export function fontSizeFitsBox(
  ctx: TextLayoutContext,
  fontSize: number,
  boxW: number,
  boxH: number,
): boolean {
  if (boxW <= 0 || boxH <= 0) return false;

  const lineHeight = measureLineHeight(ctx, fontSize);
  const visibleLines = Math.floor(boxH / lineHeight);
  if (visibleLines < MIN_VISIBLE_LINES) return false;

  const avgCharWidth = measureAvgCharWidth(ctx, fontSize);
  const charsPerLine = Math.floor(boxW / avgCharWidth);
  return charsPerLine >= MIN_CHARS_PER_LINE;
}

/**
 * ヒーロー canvas の幅・高さから日記テキストの fontSize を近似算出。
 * 行数（高さ）と 1 行字数（幅）の両方を満たす最大サイズを二分探索で求める。
 */
export function resolveHeroFontSize(
  ctx: TextLayoutContext,
  canvasWidth: number,
  canvasHeight: number,
): number {
  const { w, h } = getTextBox(canvasWidth, canvasHeight);
  if (w <= 0 || h <= 0) return FONT_SIZE_MIN;

  const heightCap = Math.floor(h / (MIN_VISIBLE_LINES * LINE_HEIGHT_RATIO));
  const upper = clamp(heightCap, FONT_SIZE_MIN, FONT_SIZE_MAX);

  let lo = FONT_SIZE_MIN;
  let hi = upper;

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fontSizeFitsBox(ctx, mid, w, h)) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

/** フォントメトリクスから行高を算出（p5 textLeading と一致させる） */
export function measureLineHeight(ctx: TextLayoutContext, fontSize: number): number {
  if (ctx.lineHeightFor) {
    return ctx.lineHeightFor(fontSize);
  }
  return Math.ceil(fontSize * LINE_HEIGHT_RATIO);
}

export function wrapJapaneseText(
  ctx: TextLayoutContext,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);

  for (let p = 0; p < paragraphs.length; p += 1) {
    const paragraph = paragraphs[p]!;
    const chars = [...paragraph];
    let line = '';

    for (const char of chars) {
      const testLine = line + char;
      if (ctx.measureWidth(testLine) > maxWidth && line.length > 0) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    }

    if (line.length > 0) lines.push(line);

    // 空行（連続改行）を保持
    if (paragraph.length === 0 && p < paragraphs.length - 1) {
      lines.push('');
    }
  }

  return lines;
}

export function getTextBox(canvasW: number, canvasH: number): TextBox {
  const paddingX = canvasW * PADDING_X_RATIO;
  const paddingY = canvasH * PADDING_Y_RATIO;
  return {
    x: paddingX,
    y: paddingY,
    w: canvasW - paddingX * 2,
    h: canvasH - paddingY * 2,
  };
}

export function createTextLayout(
  ctx: TextLayoutContext,
  canvasWidth: number,
  canvasHeight: number,
): TextLayout {
  const box = getTextBox(canvasWidth, canvasHeight);
  const fontSize = resolveHeroFontSize(ctx, canvasWidth, canvasHeight);
  const lineHeight = measureLineHeight(ctx, fontSize);
  const maxVisibleLines = Math.max(1, Math.floor(box.h / lineHeight));
  return { fontSize, lineHeight, maxVisibleLines };
}

/** 表示行数がビューポートを超えたときのスクロール量（px） */
export function scrollOffsetForLines(
  lineCount: number,
  maxVisibleLines: number,
  lineHeight: number,
): number {
  if (lineCount <= maxVisibleLines) return 0;
  return (lineCount - maxVisibleLines) * lineHeight;
}

export function createP5TextLayoutContext(p: p5): TextLayoutContext {
  let fontSize = FONT_SIZE_MIN;

  return {
    setFontSize(size: number) {
      fontSize = size;
      p.textSize(size);
    },
    measureWidth(text: string) {
      p.textSize(fontSize);
      return p.textWidth(text);
    },
    measureBounds(text: string) {
      p.textSize(fontSize);
      const bounds = p.textBounds(text, 0, 0, fontSize) as { w: number; h: number };
      return { w: bounds.w, h: bounds.h };
    },
    lineHeightFor(size: number) {
      p.textSize(size);
      const ascent = p.textAscent();
      const descent = p.textDescent();
      const metrics = ascent + descent;
      const ratio = size * LINE_HEIGHT_RATIO;
      return Math.ceil(Math.max(metrics + 6, ratio * 0.92));
    },
    textHeightFor(size: number) {
      p.textSize(size);
      return p.textAscent() + p.textDescent();
    },
  };
}

export function visibleLinesForText(
  ctx: TextLayoutContext,
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  ctx.setFontSize(fontSize);
  return wrapJapaneseText(ctx, text, maxWidth);
}

export function lineTopY(box: TextBox, lineIndex: number, lineHeight: number, scrollY: number): number {
  return box.y + lineIndex * lineHeight - scrollY;
}

export function cursorPosition(
  ctx: TextLayoutContext,
  lines: string[],
  box: TextBox,
  lineHeight: number,
  fontSize: number,
  scrollY: number,
): { x: number; y: number; h: number } | null {
  if (lines.length === 0) {
    const y = lineTopY(box, 0, lineHeight, scrollY);
    return { x: box.x, y, h: cursorHeightFor(ctx, fontSize) };
  }

  ctx.setFontSize(fontSize);
  const lineIndex = lines.length - 1;
  const lastLine = lines[lineIndex]!;
  const y = lineTopY(box, lineIndex, lineHeight, scrollY);

  return {
    x: box.x + ctx.measureWidth(lastLine) + 2,
    y,
    h: cursorHeightFor(ctx, fontSize),
  };
}

function cursorHeightFor(ctx: TextLayoutContext, fontSize: number): number {
  return ctx.textHeightFor?.(fontSize) ?? fontSize;
}
