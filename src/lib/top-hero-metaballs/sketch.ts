import p5 from 'p5';
import {
  METABALL_POWER,
  METABALL_STRENGTH,
  MIN_FIELD_SCALE,
  PAPER_RGB,
  THEME_COLORS,
} from './constants';
import {
  detectPerformanceTier,
  TIER_SETTINGS,
  type PerformanceTier,
  type TierSettings,
} from './performance';

export interface TopHeroMetaballsOptions {
  container: HTMLElement;
  reducedMotion?: boolean;
}

type ThemeKey = keyof typeof THEME_COLORS;

interface Blob {
  theme: ThemeKey;
  role: 'core' | 'lobe';
  parentIndex: number | null;
  orbitRadiusX: number;
  orbitRadiusY: number;
  lobeDistance: number;
  speed: number;
  lobeSpeed: number;
  phase: number;
  wobble: number;
  pulseSpeed: number;
  pulseAmount: number;
  baseRadius: number;
  x: number;
  y: number;
  radius: number;
}

function mixChannel(paper: number, accent: number, weight: number): number {
  const t = Math.min(1, Math.max(0, weight));
  return Math.round(paper + (accent - paper) * t);
}

function metaballInfluence(radius: number, distSq: number): number {
  const r2 = radius * radius;
  return Math.pow(r2 / (distSq + 1), METABALL_POWER / 2);
}

function sampleColor(x: number, y: number, blobs: Blob[]): [number, number, number] {
  const weights: Record<ThemeKey, number> = { takawo: 0, mizuno: 0, yao: 0 };

  for (const blob of blobs) {
    const dx = x - blob.x;
    const dy = y - blob.y;
    const distSq = dx * dx + dy * dy;
    weights[blob.theme] += metaballInfluence(blob.radius, distSq);
  }

  const total = weights.takawo + weights.mizuno + weights.yao;
  if (total < 0.045) {
    return [...PAPER_RGB];
  }

  const blend = Math.min(1, total * METABALL_STRENGTH);
  const r =
    (weights.takawo * THEME_COLORS.takawo[0] +
      weights.mizuno * THEME_COLORS.mizuno[0] +
      weights.yao * THEME_COLORS.yao[0]) /
    total;
  const g =
    (weights.takawo * THEME_COLORS.takawo[1] +
      weights.mizuno * THEME_COLORS.mizuno[1] +
      weights.yao * THEME_COLORS.yao[1]) /
    total;
  const b =
    (weights.takawo * THEME_COLORS.takawo[2] +
      weights.mizuno * THEME_COLORS.mizuno[2] +
      weights.yao * THEME_COLORS.yao[2]) /
    total;

  return [
    mixChannel(PAPER_RGB[0], r, blend),
    mixChannel(PAPER_RGB[1], g, blend),
    mixChannel(PAPER_RGB[2], b, blend),
  ];
}

function pulseRadius(base: number, time: number, blob: Blob): number {
  const t = time + blob.phase;
  return (
    base *
    (1 +
      blob.pulseAmount * Math.sin(t * blob.pulseSpeed) +
      blob.pulseAmount * 0.55 * Math.sin(t * blob.pulseSpeed * 1.73 + 0.8))
  );
}

function createBlobs(width: number, height: number, settings: TierSettings): Blob[] {
  const span = Math.min(width, height);
  const cores: Blob[] = [
    {
      theme: 'takawo',
      role: 'core',
      parentIndex: null,
      x: width * 0.22,
      y: height * 0.36,
      radius: span * 0.36,
      baseRadius: span * 0.36,
      orbitRadiusX: span * 0.3,
      orbitRadiusY: span * 0.22,
      lobeDistance: span * 0.18,
      speed: 0.11,
      lobeSpeed: 0.18,
      phase: 0.4,
      wobble: 0.11,
      pulseSpeed: 1.05,
      pulseAmount: 0.12,
    },
    {
      theme: 'mizuno',
      role: 'core',
      parentIndex: null,
      x: width * 0.78,
      y: height * 0.34,
      radius: span * 0.38,
      baseRadius: span * 0.38,
      orbitRadiusX: span * 0.28,
      orbitRadiusY: span * 0.24,
      lobeDistance: span * 0.17,
      speed: 0.1,
      lobeSpeed: 0.17,
      phase: 2.6,
      wobble: 0.1,
      pulseSpeed: 0.98,
      pulseAmount: 0.11,
    },
    {
      theme: 'yao',
      role: 'core',
      parentIndex: null,
      x: width * 0.5,
      y: height * 0.72,
      radius: span * 0.35,
      baseRadius: span * 0.35,
      orbitRadiusX: span * 0.31,
      orbitRadiusY: span * 0.2,
      lobeDistance: span * 0.19,
      speed: 0.105,
      lobeSpeed: 0.19,
      phase: 4.8,
      wobble: 0.105,
      pulseSpeed: 1.08,
      pulseAmount: 0.12,
    },
  ];

  if (!settings.includeLobes) return cores;

  const lobes: Blob[] = cores.flatMap((core, index) => [
    {
      theme: core.theme,
      role: 'lobe' as const,
      parentIndex: index,
      x: core.x,
      y: core.y,
      radius: core.baseRadius * 0.42,
      baseRadius: core.baseRadius * 0.42,
      orbitRadiusX: 0,
      orbitRadiusY: 0,
      lobeDistance: core.lobeDistance,
      speed: core.speed,
      lobeSpeed: core.lobeSpeed * 1.35,
      phase: core.phase + 1.2,
      wobble: core.wobble * 0.6,
      pulseSpeed: core.pulseSpeed * 1.4,
      pulseAmount: 0.22,
    },
    {
      theme: core.theme,
      role: 'lobe' as const,
      parentIndex: index,
      x: core.x,
      y: core.y,
      radius: core.baseRadius * 0.34,
      baseRadius: core.baseRadius * 0.34,
      orbitRadiusX: 0,
      orbitRadiusY: 0,
      lobeDistance: core.lobeDistance * 0.82,
      speed: core.speed,
      lobeSpeed: core.lobeSpeed * 0.92,
      phase: core.phase + 3.4,
      wobble: core.wobble * 0.5,
      pulseSpeed: core.pulseSpeed * 1.1,
      pulseAmount: 0.18,
    },
  ]);

  return [...cores, ...lobes];
}

function updateBlobs(blobs: Blob[], time: number, width: number, height: number): void {
  const cx = width * 0.5;
  const cy = height * 0.5;

  for (const blob of blobs) {
    if (blob.role === 'core') {
      const t = time * blob.speed + blob.phase;
      blob.x =
        cx +
        Math.cos(t) * blob.orbitRadiusX +
        Math.sin(t * 1.65 + blob.phase) * blob.wobble * width +
        Math.cos(t * 2.4 + blob.phase * 0.6) * blob.wobble * width * 0.45;
      blob.y =
        cy +
        Math.sin(t * 0.92) * blob.orbitRadiusY +
        Math.cos(t * 1.35 + blob.phase) * blob.wobble * height +
        Math.sin(t * 2.1 + blob.phase * 0.8) * blob.wobble * height * 0.4;
      blob.radius = pulseRadius(blob.baseRadius, time, blob);
    }
  }

  for (const blob of blobs) {
    if (blob.role !== 'lobe' || blob.parentIndex === null) continue;
    const parent = blobs[blob.parentIndex];
    if (!parent) continue;

    const t = time * blob.lobeSpeed + blob.phase;
    blob.x =
      parent.x +
      Math.cos(t) * blob.lobeDistance +
      Math.sin(t * 1.8) * blob.wobble * width * 0.35;
    blob.y =
      parent.y +
      Math.sin(t * 0.88) * blob.lobeDistance * 0.92 +
      Math.cos(t * 1.5) * blob.wobble * height * 0.3;
    blob.radius = pulseRadius(blob.baseRadius, time, blob) * (0.85 + parent.radius / parent.baseRadius * 0.15);
  }
}

export function createTopHeroMetaballsSketch(options: TopHeroMetaballsOptions): {
  instance: p5;
  destroy: () => void;
} {
  const { container, reducedMotion = false } = options;
  const tier: PerformanceTier = detectPerformanceTier();
  const tierSettings = TIER_SETTINGS[tier];

  let resizeObserver: ResizeObserver | undefined;

  function sketch(p: p5) {
    let fieldGfx: p5.Graphics | null = null;
    let blobs: Blob[] = [];
    let ready = false;
    let frozen = reducedMotion;
    let fieldScale = tierSettings.fieldScale;
    let frameCounter = 0;
    let fpsWindowStart = 0;

    p.setup = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const canvas = p.createCanvas(width, height);
      canvas.parent(container);
      p.pixelDensity(1);
      p.noStroke();
      p.frameRate(tierSettings.targetFps);

      blobs = createBlobs(width, height, tierSettings);
      rebuildFieldGfx(width, height);
      fpsWindowStart = p.millis();

      resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth === 0 || container.clientHeight === 0) return;
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        blobs = createBlobs(p.width, p.height, tierSettings);
        rebuildFieldGfx(p.width, p.height);
      });
      resizeObserver.observe(container);

      ready = true;
      if (frozen) {
        p.noLoop();
        renderField(0);
      }
    };

    p.draw = () => {
      if (!ready || !fieldGfx) return;
      renderField(p.millis() * 0.001);
      adaptPerformance();
    };

    p.windowResized = () => {
      if (!ready || container.clientWidth === 0 || container.clientHeight === 0) return;
      p.resizeCanvas(container.clientWidth, container.clientHeight);
      blobs = createBlobs(p.width, p.height, tierSettings);
      rebuildFieldGfx(p.width, p.height);
      if (frozen) renderField(0);
    };

    function rebuildFieldGfx(width: number, height: number): void {
      fieldGfx = p.createGraphics(
        Math.max(1, Math.floor(width * fieldScale)),
        Math.max(1, Math.floor(height * fieldScale)),
      );
      fieldGfx.pixelDensity(1);
    }

    function adaptPerformance(): void {
      if (frozen) return;

      frameCounter += 1;
      const elapsed = p.millis() - fpsWindowStart;
      if (elapsed < 2200) return;

      const fps = (frameCounter * 1000) / elapsed;
      frameCounter = 0;
      fpsWindowStart = p.millis();

      if (fps < tierSettings.targetFps * 0.72 && fieldScale > MIN_FIELD_SCALE) {
        fieldScale = Math.max(MIN_FIELD_SCALE, fieldScale - 0.04);
        rebuildFieldGfx(p.width, p.height);
        p.frameRate(Math.max(16, tierSettings.targetFps - 4));
      }
    }

    function renderField(time: number): void {
      if (!fieldGfx) return;

      if (!frozen) updateBlobs(blobs, time, p.width, p.height);

      const gw = fieldGfx.width;
      const gh = fieldGfx.height;
      const invGw = p.width / gw;
      const invGh = p.height / gh;
      fieldGfx.loadPixels();
      const pixels = fieldGfx.pixels;

      for (let y = 0; y < gh; y += 1) {
        const py = (y + 0.5) * invGh;
        let idx = y * gw * 4;
        for (let x = 0; x < gw; x += 1) {
          const px = (x + 0.5) * invGw;
          const [r, g, b] = sampleColor(px, py, blobs);
          pixels[idx] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = b;
          pixels[idx + 3] = 255;
          idx += 4;
        }
      }

      fieldGfx.updatePixels();
      p.image(fieldGfx, 0, 0, p.width, p.height);
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
