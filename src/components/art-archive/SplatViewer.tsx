import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { isPlyUrl, isSpzUrl } from '../../lib/art-archive/detect-3d-format';
import {
  applyFittedView,
  fitBoxToView,
  normalizeSplatToOrigin,
  type FittedView,
} from '../../lib/art-archive/fit-3d-view';

interface Props {
  url: string;
}

/** Scaniverse / SPARC 系は Y 上下が反転していることが多い */
function shouldFlipY(url: string): boolean {
  if (/sparkjs\.dev/i.test(url)) return false;
  return isSpzUrl(url) || isPlyUrl(url);
}

/**
 * Gaussian Splatting（.spz / Gaussian PLY）ビューア。
 * 中心へ正規化 → centers ベースでフィット（外れスケールで球状にならないようにする）。
 */
export default function SplatViewer({ url }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    fitted: FittedView;
  } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const resetView = useCallback(() => {
    const v = viewRef.current;
    if (!v) return;
    applyFittedView(v.fitted, v.camera, v.controls);
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let disposed = false;
    viewRef.current = null;
    setStatus('loading');
    el.replaceChildren();

    const width = Math.max(el.clientWidth, 320);
    const height = Math.max(el.clientHeight, 240);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12110d);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 5000);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    el.appendChild(canvas);

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.05;
    controls.maxDistance = 100;
    controls.target.set(0, 0, 0);
    controls.update();

    const splat = new SplatMesh({ url });
    // Spark README と同じ基準クォータニオン
    splat.quaternion.set(1, 0, 0, 0);
    if (shouldFlipY(url)) {
      splat.rotateX(Math.PI);
    }
    scene.add(splat);

    const failTimer = window.setTimeout(() => {
      if (!disposed && !viewRef.current) setStatus('error');
    }, 45000);

    splat.initialized
      .then(() => {
        if (disposed) return;
        try {
          const box = normalizeSplatToOrigin(splat);
          if (box.isEmpty()) {
            camera.position.set(0, 0.8, 3);
            controls.target.set(0, 0, 0);
            controls.update();
            viewRef.current = {
              camera,
              controls,
              fitted: {
                target: new THREE.Vector3(0, 0, 0),
                cameraPosition: camera.position.clone(),
                minDistance: 0.2,
                maxDistance: 40,
              },
            };
          } else {
            const fitted = fitBoxToView(box, camera);
            applyFittedView(fitted, camera, controls);
            viewRef.current = { camera, controls, fitted };

            if (import.meta.env.DEV) {
              const size = box.getSize(new THREE.Vector3());
              console.log('[SplatViewer]', url, {
                size: {
                  x: Number(size.x.toFixed(3)),
                  y: Number(size.y.toFixed(3)),
                  z: Number(size.z.toFixed(3)),
                },
                distance: Number(fitted.cameraPosition.distanceTo(fitted.target).toFixed(3)),
              });
            }
          }
          setStatus('ready');
        } catch (err) {
          console.error('[SplatViewer] fit failed', err);
          if (!disposed) setStatus('error');
        }
      })
      .catch((err) => {
        console.error('[SplatViewer] load failed', err);
        if (!disposed) setStatus('error');
      });

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(el);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      viewRef.current = null;
      window.clearTimeout(failTimer);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      el.replaceChildren();
    };
  }, [url]);

  if (status === 'error') {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-[#12110d]">
        <p className="font-mono text-xs text-white/70">3Dデータを読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={mountRef}
        className="h-[min(60vh,560px)] min-h-[320px] w-full touch-none overflow-hidden bg-[#12110d]"
      />
      {status === 'loading' && (
        <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-mono text-xs text-white/60">
          読み込み中…
        </p>
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex flex-wrap items-end gap-2">
        <p className="rounded bg-black/50 px-2 py-1 font-mono text-[0.625rem] text-white/90">
          ドラッグ: 回転 · ホイール: ズーム
        </p>
        <button
          type="button"
          onClick={resetView}
          disabled={status !== 'ready'}
          className="pointer-events-auto rounded border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-[0.625rem] text-white hover:bg-black/70 disabled:opacity-40"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
