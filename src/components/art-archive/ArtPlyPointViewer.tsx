import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

interface Props {
  url: string;
}

const MIN_DISTANCE = 0.5;
const MAX_DISTANCE = 24;

function fitPointsToView(points: THREE.Points): {
  target: THREE.Vector3;
  defaultCamera: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
} {
  const geometry = points.geometry as THREE.BufferGeometry;
  geometry.computeBoundingBox();
  geometry.center();

  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 2.2 / maxDim;
  points.scale.setScalar(scale);

  const radius = (maxDim * scale) / 2;
  return {
    target: new THREE.Vector3(0, 0, 0),
    defaultCamera: new THREE.Vector3(0, 0, radius * 2.4),
    minDistance: Math.max(MIN_DISTANCE, radius * 0.35),
    maxDistance: Math.max(MAX_DISTANCE, radius * 8),
  };
}

export default function ArtPlyPointViewer({ url }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    defaultCamera: THREE.Vector3;
    target: THREE.Vector3;
    minDistance: number;
    maxDistance: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const resetView = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.camera.position.copy(v.defaultCamera);
    v.controls.target.copy(v.target);
    v.controls.minDistance = v.minDistance;
    v.controls.maxDistance = v.maxDistance;
    v.controls.update();
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    let disposed = false;
    viewerRef.current = null;
    setIsLoaded(false);
    setLoadError(false);

    const w = el.clientWidth || 640;
    const h = el.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12110d);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.001, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;

    const loader = new PLYLoader();
    loader.load(
      url,
      (geometry) => {
        if (disposed) return;

        const hasColors = geometry.hasAttribute('color');
        const material = new THREE.PointsMaterial({
          size: 0.012,
          sizeAttenuation: true,
          vertexColors: hasColors,
          color: hasColors ? undefined : 0xc8c4b8,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const view = fitPointsToView(points);
        camera.position.copy(view.defaultCamera);
        controls.target.copy(view.target);
        controls.minDistance = view.minDistance;
        controls.maxDistance = view.maxDistance;
        controls.update();

        viewerRef.current = {
          camera,
          controls,
          defaultCamera: view.defaultCamera.clone(),
          target: view.target.clone(),
          minDistance: view.minDistance,
          maxDistance: view.maxDistance,
        };

        setIsLoaded(true);
      },
      undefined,
      () => {
        if (!disposed) setLoadError(true);
      },
    );

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

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      viewerRef.current = null;
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
        <p className="font-mono text-xs text-ink-soft">点群PLYを読み込めませんでした</p>
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
          点群PLY · 1本指: 回転 · 2本指: 移動/ズーム
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
