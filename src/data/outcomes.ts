                          import type { Teacher } from './sessions';

export type OutcomeStatus = 'published' | 'coming';

export interface Outcome {
  id: string;
  title: string;
  theme: Teacher;
  author?: string;
  thumbnail?: string;
  href?: string;
  status: OutcomeStatus;
}

/** 学生成果物データ。公開時に items を追加し status を published に更新する */
export const OUTCOMES: Outcome[] = [
  // 高尾・水野はここに追加
  // 八尾（アートアーカイブ）は public/data/yao/artworks.json で管理（/yao/ のマップビューア）
  // 公開例:
  // { id: 'takawo-01', title: '学科タイプ診断', theme: 'takawo', author: '学生A', href: '/takawo/#outcomes', status: 'published', thumbnail: '/works/takawo/takawo-01.jpg' },
];

export const OUTCOMES_COMING_NOTE = '履修者の提出後、2026年7月中旬より順次公開しました。';
