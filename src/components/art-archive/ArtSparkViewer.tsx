import { lazy, Suspense, useEffect, useState } from 'react';
import { detectPlyKind, isPlyUrl, isSpzUrl } from '../../lib/art-archive/detect-3d-format';

const ArtSparkSplatViewer = lazy(() => import('./ArtSparkSplatViewer'));
const ArtPlyPointViewer = lazy(() => import('./ArtPlyPointViewer'));

interface Props {
  url: string;
}

type ViewerMode = 'pending' | 'splat' | 'pointcloud';

function ViewerFallback() {
  return <div className="h-[min(60vh,560px)] min-h-[320px] w-full animate-pulse bg-[#12110d]" />;
}

export default function ArtSparkViewer({ url }: Props) {
  const [mode, setMode] = useState<ViewerMode>('pending');

  useEffect(() => {
    let cancelled = false;

    if (isSpzUrl(url)) {
      setMode('splat');
      return;
    }

    if (isPlyUrl(url)) {
      setMode('pending');
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

  if (mode === 'pending') {
    return <ViewerFallback />;
  }

  return (
    <Suspense fallback={<ViewerFallback />}>
      {mode === 'pointcloud' ? (
        <ArtPlyPointViewer url={url} />
      ) : (
        <ArtSparkSplatViewer url={url} />
      )}
    </Suspense>
  );
}
