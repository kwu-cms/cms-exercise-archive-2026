interface Props {
  url: string;
}

export default function VideoPlayer({ url }: Props) {
  return (
    <video src={url} controls className="w-full bg-black" style={{ maxHeight: '320px' }}>
      お使いのブラウザは動画再生に対応していません。
    </video>
  );
}
