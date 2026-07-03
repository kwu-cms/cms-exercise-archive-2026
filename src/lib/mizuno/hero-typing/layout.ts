import type p5 from 'p5';
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MAX_MOBILE,
  FONT_SIZE_MIN,
  LINE_HEIGHT_RATIO,
  MAX_CHARS_FOR_DURATION,
  MAX_DURATION_MS,
  MIN_CHARS_FOR_DURATION,
  MIN_DURATION_MS,
  MOBILE_BREAKPOINT,
} from './constants';

export interface TextLayoutContext {
  setFontSize(size: number): void;
  measureWidth(text: string): number;
  measureBounds(text: string): { w: number; h: number };
}

export interface TextBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FitFontSizeResult {
  fontSize: number;
  lines: string[];
  lineHeight: number;
  maxLines: number;
}

export function getDurationByLength(length: number): number {
  const t = Math.min(
    1,
    Math.max(0, (length - MIN_CHARS_FOR_DURATION) / (MAX_CHARS_FOR_DURATION - MIN_CHARS_FOR_DURATION)),
  );
  return MIN_DURATION_MS + t * (MAX_DURATION_MS - MIN_DURATION_MS);
}

export function wrapJapaneseText(
  ctx: TextLayoutContext,
  text: string,
  maxWidth: number,
): string[] {
  const chars = [...text];
  const lines: string[] = [];
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
  return lines;
}

export function measureBlock(
  ctx: TextLayoutContext,
  lines: string[],
  lineHeight: number,
): { totalHeight: number; lastLineWidth: number } {
  if (lines.length === 0) {
    return { totalHeight: 0, lastLineWidth: 0 };
  }

  let maxW = 0;
  for (const line of lines) {
    const bounds = ctx.measureBounds(line);
    maxW = Math.max(maxW, bounds.w);
  }

  const lastBounds = ctx.measureBounds(lines[lines.length - 1]!);
  return {
    totalHeight: lines.length * lineHeight,
    lastLineWidth: lastBounds.w,
  };
}

export function getTextBox(canvasW: number, canvasH: number): TextBox {
  const paddingX = canvasW * 0.08;
  const paddingY = canvasH * 0.16;
  return {
    x: paddingX,
    y: paddingY,
    w: canvasW - paddingX * 2,
    h: canvasH - paddingY * 2,
  };
}

export function fitFontSize(
  ctx: TextLayoutContext,
  text: string,
  boxW: number,
  boxH: number,
  canvasWidth: number,
): FitFontSizeResult {
  const fontMax = canvasWidth < MOBILE_BREAKPOINT ? FONT_SIZE_MAX_MOBILE : FONT_SIZE_MAX;

  for (let size = fontMax; size >= FONT_SIZE_MIN; size -= 1) {
    ctx.setFontSize(size);
    const lines = wrapJapaneseText(ctx, text, boxW);
    const lineHeight = size * LINE_HEIGHT_RATIO;
    const { totalHeight } = measureBlock(ctx, lines, lineHeight);

    if (totalHeight <= boxH) {
      const maxLines = Math.max(1, Math.floor(boxH / lineHeight));
      return { fontSize: size, lines, lineHeight, maxLines };
    }
  }

  ctx.setFontSize(FONT_SIZE_MIN);
  const lines = wrapJapaneseText(ctx, text, boxW);
  const lineHeight = FONT_SIZE_MIN * LINE_HEIGHT_RATIO;
  const maxLines = Math.max(1, Math.floor(boxH / lineHeight));
  return { fontSize: FONT_SIZE_MIN, lines, lineHeight, maxLines };
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

export function cursorPosition(
  ctx: TextLayoutContext,
  lines: string[],
  box: TextBox,
  lineHeight: number,
  fontSize: number,
): { x: number; y: number } | null {
  if (lines.length === 0) return { x: box.x, y: box.y };

  ctx.setFontSize(fontSize);
  const lastLine = lines[lines.length - 1]!;
  const bounds = ctx.measureBounds(lastLine);
  return {
    x: box.x + bounds.w + 4,
    y: box.y + (lines.length - 1) * lineHeight,
  };
}
