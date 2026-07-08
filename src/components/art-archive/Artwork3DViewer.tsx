import { useEffect, useState } from 'react';
import { detectPlyKind, isPlyUrl, isSpzUrl } from '../../lib/art-archive/detect-3d-format';
import PointCloudViewer from './PointCloudViewer';
import SplatViewer from './SplatViewer';

interface Props {
  url: string;
}

type Mode = 'loading' | 'splat' | 'pointcloud';

/**
 * 3D アセット URL から適切なビューアを選ぶ。
 * - .spz → Spark splat
 * - .ply → ヘッダーで Gaussian / 点群を判別
 */
export default function Artwork3DViewer({ url }: Props) {
  const [mode, setMode] = useState<Mode>(() => {
    if (isSpzUrl(url)) return 'splat';
    if (isPlyUrl(url)) return 'loading';
    return 'splat';
  });

  useEffect(() => {
    let cancelled = false;

    if (isSpzUrl(url)) {
      setMode('splat');
      return;
    }

    if (isPlyUrl(url)) {
      setMode('loading');
      detectPlyKind(url).then((kind) => {
        if (!cancelled) setMode(kind === 'gaussian' ? 'splat' : 'pointcloud');
      });
      return;
    }

    setMode('splat');
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (mode === 'loading') {
    return (
      <div className="flex h-[min(60vh,560px)] min-h-[320px] w-full items-center justify-center bg-[#12110d]">
        <p className="font-mono text-xs text-white/60">読み込み中…</p>
      </div>
    );
  }

  if (mode === 'pointcloud') {
    return <PointCloudViewer url={url} />;
  }

  return <SplatViewer url={url} />;
}
