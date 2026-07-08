import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

interface Props {
  url: string;
}

interface SavedView {
  cameraPosition: THREE.Vector3;
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
}

/**
 * 点群 PLY ビューア（Scaniverse 等の非 Gaussian PLY）。
 */
export default function PointCloudViewer({ url }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    saved: SavedView;
  } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const resetView = useCallback(() => {
    const v = viewRef.current;
    if (!v) return;
    v.camera.position.copy(v.saved.cameraPosition);
    v.controls.target.copy(v.saved.target);
    v.controls.minDistance = v.saved.minDistance;
    v.controls.maxDistance = v.saved.maxDistance;
    v.controls.update();
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

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.001, 2000);
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

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.update();

    const loader = new PLYLoader();
    loader.load(
      url,
      (geometry) => {
        if (disposed) return;

        geometry.computeBoundingBox();
        geometry.center();

        const hasColors = geometry.hasAttribute('color');
        const points = new THREE.Points(
          geometry,
          new THREE.PointsMaterial({
            size: 0.012,
            sizeAttenuation: true,
            vertexColors: hasColors,
            color: hasColors ? undefined : 0xc8c4b8,
          }),
        );

        const box = geometry.boundingBox ?? new THREE.Box3();
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.001);
        const scale = 2.2 / maxDim;
        points.scale.setScalar(scale);
        scene.add(points);

        const radius = (maxDim * scale) / 2;
        const saved: SavedView = {
          cameraPosition: new THREE.Vector3(0, 0, Math.max(1.2, radius * 2.4)),
          target: new THREE.Vector3(0, 0, 0),
          minDistance: Math.max(0.3, radius * 0.3),
          maxDistance: Math.max(20, radius * 8),
        };

        camera.position.copy(saved.cameraPosition);
        controls.target.copy(saved.target);
        controls.minDistance = saved.minDistance;
        controls.maxDistance = saved.maxDistance;
        controls.update();

        viewRef.current = { camera, controls, saved };
        setStatus('ready');
      },
      undefined,
      () => {
        if (!disposed) setStatus('error');
      },
    );

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
        <p className="font-mono text-xs text-white/70">点群PLYを読み込めませんでした</p>
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
          点群 · ドラッグ: 回転 · ホイール: ズーム
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
