import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { isSpzUrl } from '../../lib/art-archive/detect-3d-format';

interface Props {
  url: string;
}

const SPLAT_CENTER = new THREE.Vector3(0, 0, -3);
const DEFAULT_CAMERA = new THREE.Vector3(0, 0, 3);
const MIN_DISTANCE = 0.8;
const MAX_DISTANCE = 12;

function shouldFlipSpz(url: string): boolean {
  if (!isSpzUrl(url)) return false;
  if (/sparkjs\.dev/i.test(url)) return false;
  return true;
}

function applyBaseOrientation(splat: SplatMesh, url: string) {
  splat.quaternion.set(1, 0, 0, 0);
  splat.position.copy(SPLAT_CENTER);
  if (shouldFlipSpz(url)) {
    splat.rotateX(Math.PI);
  }
}

export default function ArtSparkSplatViewer({ url }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const resetView = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.camera.position.copy(DEFAULT_CAMERA);
    v.controls.target.copy(SPLAT_CENTER);
    v.controls.minDistance = MIN_DISTANCE;
    v.controls.maxDistance = MAX_DISTANCE;
    v.controls.update();
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    let disposed = false;
    const loadedRef = { current: false };
    viewerRef.current = null;
    setIsLoaded(false);
    setLoadError(false);

    const w = el.clientWidth || 640;
    const h = el.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 1000);
    camera.position.copy(DEFAULT_CAMERA);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    const splat = new SplatMesh({
      url,
      onLoad: () => {
        loadedRef.current = true;
        if (!disposed) setIsLoaded(true);
      },
    });
    applyBaseOrientation(splat, url);
    scene.add(splat);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(SPLAT_CENTER);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = MIN_DISTANCE;
    controls.maxDistance = MAX_DISTANCE;
    controls.screenSpacePanning = true;
    controls.update();

    viewerRef.current = { camera, controls };

    const resizeObserver = new ResizeObserver(() => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      controls.update();
    });
    resizeObserver.observe(el);

    const loadTimeout = window.setTimeout(() => {
      if (!disposed && !loadedRef.current) setLoadError(true);
    }, 60000);

    const onUnhandled = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason ?? '');
      if (msg.includes('scale_0') || msg.includes('property')) {
        if (!disposed) setLoadError(true);
      }
    };
    window.addEventListener('unhandledrejection', onUnhandled);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      viewerRef.current = null;
      window.removeEventListener('unhandledrejection', onUnhandled);
      window.clearTimeout(loadTimeout);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [url]);

  if (loadError) {
    return (
      <div className="flex min-h-[360px] w-full items-center justify-center bg-paper-dim">
        <p className="font-mono text-xs text-ink-soft">3Dスプラットデータを読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={mountRef}
        className="h-[min(60vh,560px)] min-h-[320px] w-full touch-none overflow-hidden bg-[#12110d]"
      />
      {!isLoaded && <div className="absolute inset-0 z-10 animate-pulse bg-[#12110d]" />}
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex flex-wrap items-end gap-2">
        <p className="rounded bg-black/50 px-2 py-1 font-mono text-[0.625rem] text-white/90">
          1本指: 回転 · 2本指: 移動/ズーム
        </p>
        <button
          type="button"
          onClick={resetView}
          disabled={!isLoaded}
          className="pointer-events-auto rounded border border-line bg-paper px-3 py-1.5 font-mono text-[0.625rem] text-ink hover:bg-paper-dim disabled:opacity-50"
        >
          ビューをリセット
        </button>
      </div>
    </div>
  );
}
