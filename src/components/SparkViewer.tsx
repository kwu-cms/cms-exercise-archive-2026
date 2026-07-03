import { useEffect, useRef, useState } from 'react';

interface SparkViewerProps {
  /** .spz / .ply / .splat の URL。未指定時はサンプル(蝶)を表示 */
  splatUrl?: string;
  /** キャプション（作品名・撮影者など） */
  caption?: string;
  height?: number;
}

/**
 * 学内アートリソースの3Dスキャンを表示するビューア。
 * 実データ差し替え手順:
 *   1. 対象ファイル(.spz推奨/.ply/.splat)を public/scans/ に配置
 *   2. <SparkViewer client:visible splatUrl="/scans/xxx.spz" caption="作品名" /> のように呼び出す
 * splatUrl未指定時はSpark公式サンプル(蝶)をプレースホルダーとして表示する。
 */
export default function SparkViewer({
  splatUrl = 'https://sparkjs.dev/assets/splats/butterfly.spz',
  caption,
  height = 420,
}: SparkViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      try {
        const [THREE, { SparkRenderer, SplatMesh }, { OrbitControls }] = await Promise.all([
          import('three'),
          import('@sparkjsdev/spark'),
          import('three/examples/jsm/controls/OrbitControls.js'),
        ]);

        if (cancelled || !containerRef.current) return;
        const container = containerRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          55,
          container.clientWidth / container.clientHeight,
          0.01,
          1000,
        );
        camera.position.set(0, 0, 3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const spark = new SparkRenderer({ renderer });
        scene.add(spark);

        const splat = new SplatMesh({ url: splatUrl });
        splat.quaternion.set(1, 0, 0, 0);
        scene.add(splat);

        splat.initialized?.then?.(() => {
          if (!cancelled) setStatus('ready');
        });
        // initialized が無いバージョン互換のフォールバック
        setTimeout(() => !cancelled && setStatus((s) => (s === 'loading' ? 'ready' : s)), 2500);

        const onResize = () => {
          if (!container) return;
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', onResize);

        renderer.setAnimationLoop(() => {
          controls.update();
          renderer.render(scene, camera);
        });

        cleanup = () => {
          window.removeEventListener('resize', onResize);
          renderer.setAnimationLoop(null);
          controls.dispose();
          renderer.dispose();
          container.removeChild(renderer.domElement);
        };
      } catch (e) {
        console.error('SparkViewer init failed', e);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [splatUrl]);

  return (
    <div className="border border-line bg-[#12110d]">
      <div ref={containerRef} style={{ height, width: '100%' }} className="relative">
        {status === 'loading' && (
          <p className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/60">
            読み込み中…
          </p>
        )}
        {status === 'error' && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-xs text-white/60">
            表示に失敗しました（WebGL2非対応の可能性）。splatUrl の形式・パスを確認してください。
          </p>
        )}
      </div>
      {caption && (
        <p className="border-t border-line bg-paper px-3 py-2 font-mono text-[0.6875rem] text-ink-soft">{caption}</p>
      )}
    </div>
  );
}
