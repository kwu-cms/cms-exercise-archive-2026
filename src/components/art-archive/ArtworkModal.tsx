import { lazy, Suspense, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Artwork } from '../../lib/art-archive/types';
import { shortCategoryLabel } from '../../lib/art-archive/categories';
import Artwork3DViewer from './Artwork3DViewer';
import ViewerErrorBoundary from './ViewerErrorBoundary';

const VideoPlayer = lazy(() => import('./VideoPlayer'));

interface Props {
  artwork: Artwork;
  onClose: () => void;
}

export default function ArtworkModal({ artwork, onClose }: Props) {
  const viewer3dUrl = artwork.urlSpz;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden border border-line bg-paper shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <h2 id="artwork-modal-title" className="truncate font-display text-xl text-ink">
              {artwork.title}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-ink-soft">
              {artwork.author}
              {artwork.locationName && <> · {artwork.locationName}</>}
              {artwork.categories.length > 0 && (
                <> · {artwork.categories.map(shortCategoryLabel).join(' / ')}</>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-2 py-1 font-mono text-xl leading-none text-ink-soft hover:text-ink"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {viewer3dUrl && (
          <div className="shrink-0 border-b border-line bg-[#12110d]">
            <ViewerErrorBoundary>
              <Artwork3DViewer key={viewer3dUrl} url={viewer3dUrl} />
            </ViewerErrorBoundary>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {!viewer3dUrl && artwork.urlMp4 && (
            <Suspense fallback={<div className="min-h-[320px] w-full animate-pulse bg-paper-dim" />}>
              <VideoPlayer url={artwork.urlMp4} />
            </Suspense>
          )}

          {viewer3dUrl && artwork.urlMp4 && (
            <div>
              <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-wider text-ink-soft">
                撮影動画
              </p>
              <Suspense fallback={<div className="h-48 w-full animate-pulse bg-paper-dim" />}>
                <VideoPlayer url={artwork.urlMp4} compact />
              </Suspense>
            </div>
          )}

          {artwork.comment && (
            <p
              className={`text-sm leading-relaxed text-ink-soft ${
                viewer3dUrl || artwork.urlMp4 ? 'mt-4' : ''
              }`}
            >
              {artwork.comment}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
