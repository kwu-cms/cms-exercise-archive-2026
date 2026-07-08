interface Props {
  url: string;
  /** 3D と併記するサブ動画（やや小さめ） */
  compact?: boolean;
}

export default function VideoPlayer({ url, compact = false }: Props) {
  if (compact) {
    return (
      <video
        src={url}
        controls
        playsInline
        className="mx-auto w-full max-w-md bg-black"
        style={{ maxHeight: '280px' }}
      >
        お使いのブラウザは動画再生に対応していません。
      </video>
    );
  }

  return (
    <div className="flex justify-center bg-[#12110d] py-2">
      <video
        src={url}
        controls
        playsInline
        className="h-auto w-auto max-h-[min(72vh,720px)] max-w-full bg-black"
        style={{ minHeight: 'min(56vh, 520px)' }}
      >
        お使いのブラウザは動画再生に対応していません。
      </video>
    </div>
  );
}
