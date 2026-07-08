import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SplatMesh } from '@sparkjsdev/spark';

export interface FittedView {
  target: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
}

/** 単位サイズ付近に正規化したあとの見た目用ターゲット寸法 */
export const SPLAT_TARGET_SIZE = 2;

/**
 * 正規化後の Box3（おおよそ [-1,1] 程度）から視点を算出する。
 */
export function fitBoxToView(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  padding = 1.6,
): FittedView {
  const target = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);

  const fovRad = (camera.fov * Math.PI) / 180;
  const fitByHeight = maxDim / 2 / Math.tan(fovRad / 2);
  const fitByWidth = fitByHeight / Math.max(camera.aspect, 0.1);
  const distance = padding * Math.max(fitByHeight, fitByWidth);

  const offset = new THREE.Vector3(0.2, 0.35, 1).normalize().multiplyScalar(distance);

  return {
    target,
    cameraPosition: target.clone().add(offset),
    minDistance: Math.max(0.05, maxDim * 0.05),
    maxDistance: Math.max(distance * 8, maxDim * 12, 20),
  };
}

export function applyFittedView(
  view: FittedView,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): void {
  camera.position.copy(view.cameraPosition);
  camera.near = Math.max(0.001, view.minDistance * 0.05);
  camera.far = Math.max(2000, view.maxDistance * 5);
  camera.updateProjectionMatrix();
  controls.target.copy(view.target);
  controls.minDistance = view.minDistance;
  controls.maxDistance = view.maxDistance;
  controls.update();
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0]!;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  const t = idx - lo;
  return sorted[lo]! * (1 - t) + sorted[hi]! * t;
}

export interface RobustSplatBounds {
  center: THREE.Vector3;
  size: THREE.Vector3;
  maxDim: number;
  count: number;
}

/**
 * スプラット中心の 5%〜95% パーセンタイルで頑健な箱を取る。
 * 外れ値センターで距離が数百〜数千になるのを防ぐ。
 */
export function getRobustSplatBounds(splat: SplatMesh): RobustSplatBounds | null {
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[] = [];

  splat.forEachSplat((_index, center) => {
    xs.push(center.x);
    ys.push(center.y);
    zs.push(center.z);
  });

  if (xs.length < 8) return null;

  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  zs.sort((a, b) => a - b);

  const minX = percentile(xs, 0.05);
  const maxX = percentile(xs, 0.95);
  const minY = percentile(ys, 0.05);
  const maxY = percentile(ys, 0.95);
  const minZ = percentile(zs, 0.05);
  const maxZ = percentile(zs, 0.95);

  const size = new THREE.Vector3(maxX - minX, maxY - minY, maxZ - minZ);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const center = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);

  return { center, size, maxDim, count: xs.length };
}

/**
 * 頑健な中心・寸法で原点へ寄せ、最大辺が SPLAT_TARGET_SIZE になるよう縮尺する。
 * 戻り値は正規化後の表示用 Box3。
 */
export function normalizeSplatToOrigin(splat: SplatMesh): THREE.Box3 {
  splat.updateMatrixWorld(true);

  const robust = getRobustSplatBounds(splat);
  if (!robust) {
    const fallback = splat.getBoundingBox(true);
    if (fallback.isEmpty()) return fallback;
    const center = fallback.getCenter(new THREE.Vector3());
    splat.position.sub(center);
    splat.updateMatrixWorld(true);
    return splat.getBoundingBox(true);
  }

  const scale = SPLAT_TARGET_SIZE / robust.maxDim;
  splat.position.copy(robust.center).multiplyScalar(-scale);
  splat.scale.setScalar(scale);
  splat.updateMatrixWorld(true);

  const half = SPLAT_TARGET_SIZE / 2;
  return new THREE.Box3(
    new THREE.Vector3(-half, -half, -half),
    new THREE.Vector3(half, half, half),
  );
}
