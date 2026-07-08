import { describe, expect, it } from 'vitest';
import {
  YAO_ART_CATEGORIES,
  YAO_CATEGORY_COLORS,
  getPinColor,
  matchesCategoryFilter,
  normalizeCategories,
} from '../src/lib/art-archive/categories';
import { fitBoxToView, getRobustSplatBounds } from '../src/lib/art-archive/fit-3d-view';
import * as THREE from 'three';
import { parseCategories } from '../scripts/lib/yao-ingest/categories.mjs';

describe('yao art categories', () => {
  it('parses semicolon-separated form values', () => {
    expect(
      parseCategories('③学外からの見学者に是非オススメ;①ビギナーさん向け;'),
    ).toEqual(['①ビギナーさん向け', '③学外からの見学者に是非オススメ']);
  });

  it('normalizes unknown categories away', () => {
    expect(normalizeCategories(['①ビギナーさん向け', 'unknown'])).toEqual([
      '①ビギナーさん向け',
    ]);
  });

  it('assigns pin color by priority when multiple categories', () => {
    expect(getPinColor(['①ビギナーさん向け', '②南女生しか絶対知らない'])).toBe(
      YAO_CATEGORY_COLORS['②南女生しか絶対知らない'],
    );
  });

  it('filters artworks by any matching category', () => {
    const active = new Set(['①ビギナーさん向け']);
    expect(matchesCategoryFilter(['②南女生しか絶対知らない'], active)).toBe(false);
    expect(matchesCategoryFilter(['①ビギナーさん向け', '②南女生しか絶対知らない'], active)).toBe(
      true,
    );
    expect(matchesCategoryFilter([], active)).toBe(false);
    expect(matchesCategoryFilter(['①ビギナーさん向け'], new Set())).toBe(true);
  });
});

describe('fitBoxToView', () => {
  it('computes camera distance from bounding box', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
    const box = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    const view = fitBoxToView(box, camera);
    const distance = view.cameraPosition.distanceTo(view.target);
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(10);
    expect(view.minDistance).toBeLessThan(view.maxDistance);
  });
});

describe('getRobustSplatBounds', () => {
  it('ignores extreme outliers via percentiles', () => {
    const centers = [
      ...Array.from({ length: 98 }, (_, i) => new THREE.Vector3(i * 0.01, 0, 0)),
      new THREE.Vector3(1000, 0, 0),
      new THREE.Vector3(-1000, 0, 0),
    ];
    const fakeSplat = {
      forEachSplat(cb: (index: number, center: THREE.Vector3) => void) {
        centers.forEach((c, i) => cb(i, c));
      },
    };
    const bounds = getRobustSplatBounds(fakeSplat as never);
    expect(bounds).not.toBeNull();
    expect(bounds!.maxDim).toBeLessThan(2);
    expect(Math.abs(bounds!.center.x)).toBeLessThan(1);
  });
});
