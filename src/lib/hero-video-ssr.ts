/** SSR 用：プールから重複のない初期動画を選ぶ */
export function pickSsrHeroVideos(videos: readonly string[], count = 3): string[] {
  if (videos.length === 0) return [];
  const slotCount = Math.min(count, videos.length);
  if (slotCount >= videos.length) return [...videos].slice(0, slotCount);

  const step = videos.length / slotCount;
  const picked: string[] = [];
  const used = new Set<number>();

  for (let i = 0; i < slotCount; i += 1) {
    let index = Math.floor(i * step) % videos.length;
    let guard = 0;
    while (used.has(index) && guard < videos.length) {
      index = (index + 1) % videos.length;
      guard += 1;
    }
    used.add(index);
    picked.push(videos[index]);
  }

  return picked;
}
