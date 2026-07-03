import p5 from 'p5';
import type { MizunoDiary } from '../../../data/mizuno/diaries';
import {
  CURSOR_STROKE,
  DELETE_CHAR_MS,
  GAP_AFTER_DELETE_MS,
  HOLD_AFTER_TYPING_MS,
  TEXT_FILL,
  TEXT_SHADOW,
} from './constants';
import {
  createP5TextLayoutContext,
  cursorPosition,
  fitFontSize,
  getDurationByLength,
  getTextBox,
  visibleLinesForText,
  type FitFontSizeResult,
  type TextBox,
} from './layout';
import {
  computeBaseCharDelay,
  delayBeforeNextChar,
  type TypingPhase,
} from './timing';

export interface MizunoHeroTypingOptions {
  container: HTMLElement;
  fontUrl: string;
  diaries: MizunoDiary[];
  reducedMotion: boolean;
}

export function createMizunoHeroTypingSketch(options: MizunoHeroTypingOptions): {
  instance: p5;
  destroy: () => void;
} {
  const { container, fontUrl, diaries, reducedMotion } = options;

  let resizeObserver: ResizeObserver | undefined;

  function sketch(p: p5) {
    let diaryFont: p5.Font | null = null;
    let currentIndex = 0;
    let currentText = '';
    let phase: TypingPhase = 'typing';
    let visibleCount = 0;
    let baseCharDelay = 50;
    let lastStepTime = 0;
    let phaseStartTime = 0;
    let ready = false;
    let layout: FitFontSizeResult = {
      fontSize: 16,
      lines: [],
      lineHeight: 28,
      maxLines: 1,
    };
    let textBox: TextBox = { x: 0, y: 0, w: 0, h: 0 };
    const layoutCtx = createP5TextLayoutContext(p);

    p.setup = async () => {
      try {
        diaryFont = await p.loadFont(fontUrl);
      } catch {
        console.warn('Mizuno hero: font load failed, falling back to default');
        diaryFont = null;
      }

      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const canvas = p.createCanvas(width, height);
      canvas.parent(container);
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

      resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth === 0 || container.clientHeight === 0) return;
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        recalculateLayout();
      });
      resizeObserver.observe(container);

      selectDiary(0);
      ready = true;
    };

    p.draw = () => {
      if (!ready) return;

      p.clear();
      drawSubtleBackground();

      if (!currentText) return;

      if (diaryFont) p.textFont(diaryFont);

      if (reducedMotion) {
        drawTextBlock(currentText, true);
        return;
      }

      const now = p.millis();

      if (phase === 'typing') {
        if (visibleCount < currentText.length) {
          const prevChar = visibleCount > 0 ? currentText[visibleCount - 1] : undefined;
          const wait = delayBeforeNextChar(prevChar, baseCharDelay);
          if (visibleCount === 0 || now - lastStepTime >= wait) {
            visibleCount += 1;
            lastStepTime = now;
          }
        } else {
          phase = 'hold';
          phaseStartTime = now;
        }
        drawTextBlock(currentText.slice(0, visibleCount), false);
        return;
      }

      if (phase === 'hold') {
        drawTextBlock(currentText, true);
        if (now - phaseStartTime >= HOLD_AFTER_TYPING_MS) {
          phase = 'deleting';
          lastStepTime = now;
        }
        return;
      }

      if (phase === 'deleting') {
        if (visibleCount > 0 && now - lastStepTime >= DELETE_CHAR_MS) {
          visibleCount -= 1;
          lastStepTime = now;
        }
        if (visibleCount <= 0) {
          phase = 'gap';
          phaseStartTime = now;
          return;
        }
        drawTextBlock(currentText.slice(0, visibleCount), false);
        return;
      }

      if (phase === 'gap' && now - phaseStartTime >= GAP_AFTER_DELETE_MS) {
        selectDiary((currentIndex + 1) % diaries.length);
      }
    };

    p.windowResized = () => {
      if (!ready) return;
      resizeToContainer();
      recalculateLayout();
    };

    function resizeToContainer() {
      if (container.clientWidth === 0 || container.clientHeight === 0) return;
      p.resizeCanvas(container.clientWidth, container.clientHeight);
      textBox = getTextBox(p.width, p.height);
    }

    function recalculateLayout() {
      if (!currentText) return;
      textBox = getTextBox(p.width, p.height);
      layout = fitFontSize(layoutCtx, currentText, textBox.w, textBox.h, p.width);
    }

    function selectDiary(index: number) {
      if (diaries.length === 0) return;
      currentIndex = index;
      currentText = diaries[currentIndex]?.text ?? '';
      baseCharDelay = computeBaseCharDelay(currentText, getDurationByLength(currentText.length));
      phase = 'typing';
      visibleCount = 0;
      lastStepTime = p.millis();
      phaseStartTime = lastStepTime;
      recalculateLayout();
    }

    function drawTextBlock(text: string, hideCursor: boolean) {
      if (!text) return;

      textBox = getTextBox(p.width, p.height);
      p.textSize(layout.fontSize);
      p.textAlign(p.LEFT, p.TOP);

      const visibleLines = visibleLinesForText(layoutCtx, text, textBox.w, layout.fontSize);
      const drawLines = visibleLines.slice(0, layout.maxLines);

      const ctx = p.drawingContext as CanvasRenderingContext2D;
      ctx.shadowColor = `rgba(${TEXT_SHADOW.join(',')})`;
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      p.noStroke();
      p.fill(...TEXT_FILL);

      for (let i = 0; i < drawLines.length; i += 1) {
        p.text(drawLines[i]!, textBox.x, textBox.y + i * layout.lineHeight);
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      if (!hideCursor && Math.floor(p.frameCount / 28) % 2 === 0) {
        const pos = cursorPosition(
          layoutCtx,
          drawLines,
          textBox,
          layout.lineHeight,
          layout.fontSize,
        );
        if (pos) {
          p.stroke(...CURSOR_STROKE);
          p.strokeWeight(2);
          p.line(pos.x, pos.y + 2, pos.x, pos.y + layout.fontSize * 1.2);
        }
      }
    }

    function drawSubtleBackground() {
      p.noStroke();
      p.fill(0, 0, 0, 5);
      const step = 28;
      for (let y = 0; y < p.height; y += step) {
        p.rect(0, y, p.width, 1);
      }
    }
  }

  const instance = new p5(sketch, container);

  const destroy = () => {
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    instance.remove();
  };

  return { instance, destroy };
}
