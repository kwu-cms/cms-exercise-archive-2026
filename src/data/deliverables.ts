import type { Teacher } from './sessions';

export interface Deliverable {
  teacher: Teacher;
  question: string;
  items: string[];
  evaluation: { label: string; weight: number }[];
}

export const DELIVERABLES: Record<Teacher, Deliverable> = {
  takawo: {
    teacher: 'takawo',
    question: '人はなぜ自分を分類したくなるのか？',
    items: [
      '診断メディア企画書（A〜E項目／テーマ：メディア表現学科にまつわる診断メディア）',
      '問い②への回答：4回を通じて診断についての考えがどう変わったか／診断では語れない自分をどう語るか（300字以上）',
    ],
    evaluation: [
      { label: '第1回｜デスクリサーチ', weight: 15 },
      { label: '第2回｜価値分類・仮説文', weight: 15 },
      { label: '第3回｜ペルソナ・インサイト', weight: 10 },
      { label: '第4回｜コンセプトシート・問いへの回答', weight: 60 },
    ],
  },
  mizuno: {
    teacher: 'mizuno',
    question: '日記を書くのは誰か',
    items: [
      'メタ日記（最終回当日執筆）',
      '最終リフレクション：AIとともに書くことで、自分の書き方について何が見えたか（400〜600字）',
    ],
    evaluation: [
      { label: 'プロセスへの関与', weight: 50 },
      { label: '自分の言葉での気づきの言語化（「わからない」の言語化も含む）', weight: 50 },
    ],
  },
  yao: {
    teacher: 'yao',
    question: '創造的アートアーカイブは、◎◎◎である。',
    items: [
      'おすすめ空間の推薦（写真・地点データ・おすすめコメント120字程度＋考察レポート600字程度）',
    ],
    evaluation: [],
  },
};
