export type PerformanceTier = 'low' | 'normal';

export interface TierSettings {
  fieldScale: number;
  targetFps: number;
  includeLobes: boolean;
}

export const TIER_SETTINGS: Record<PerformanceTier, TierSettings> = {
  low: {
    fieldScale: 0.24,
    targetFps: 20,
    includeLobes: true,
  },
  normal: {
    fieldScale: 0.3,
    targetFps: 28,
    includeLobes: true,
  },
};

export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'normal';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  if (memory !== undefined && memory <= 4) return 'low';
  if (cores <= 4) return 'low';

  return 'normal';
}
