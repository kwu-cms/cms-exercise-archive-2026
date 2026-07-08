/** Fisher–Yates で並べ替えた、重複なしの巡回シーケンス */
export function createShuffleSequence(length: number): () => number {
  if (length <= 0) {
    return () => 0;
  }

  let order: number[] = [];
  let position = 0;

  function reshuffle() {
    order = Array.from({ length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    position = 0;
  }

  reshuffle();

  return () => {
    if (position >= order.length) {
      reshuffle();
    }
    const index = order[position]!;
    position += 1;
    return index;
  };
}
