export type Teacher = 'takawo' | 'mizuno' | 'yao';

export type SessionKind = '講義' | '演習';

export type OutcomeBadge = '成果公開' | 'レポート公開' | '授業成果あり';

export interface Session {
  no: number;
  date: string;
  teacher: Teacher;
  kind: SessionKind;
  title: string;
  instructor?: string;
  ledgerAccent?: Teacher | 'all';
  outcome?: { label: OutcomeBadge; href: string };
}

export const TEACHERS: Record<Teacher, { name: string; role: string; accent: string; order: number }> = {
  takawo: { name: '高尾俊介', role: '診断メディアから、デザインリサーチを学ぶ', accent: 'takawo', order: 1 },
  mizuno: { name: '水野勝仁', role: 'AIと「わたし」を書く', accent: 'mizuno', order: 2 },
  yao: { name: '八尾里絵子', role: '身近な風景を、記録から作品へ。', accent: 'yao', order: 3 },
};

// 実施順は 高尾 → 水野 → 八尾 → 高尾（まとめ）
export const SESSIONS: Session[] = [
  { no: 1, date: '4/16', teacher: 'takawo', kind: '講義', title: 'デザインリサーチ入門「人はなぜ自分を分類したくなるのか？」' },
  { no: 2, date: '4/23', teacher: 'takawo', kind: '演習', title: '診断に惹かれる人間を理解する' },
  { no: 3, date: '4/30', teacher: 'takawo', kind: '演習', title: '人の内側にある動機を言語化する' },
  { no: 4, date: '5/7', teacher: 'takawo', kind: '演習', title: '新しい診断体験の可能性を設計する' },
  { no: 5, date: '5/8', teacher: 'mizuno', kind: '講義', title: '日記を書くのは誰か' },
  { no: 6, date: '5/17', teacher: 'mizuno', kind: '演習', title: 'AIに「わたしの日記」を書かせてみる' },
  { no: 7, date: '5/22', teacher: 'mizuno', kind: '演習', title: 'AIの日記を編集する——どこに手を入れたくなるか' },
  { no: 8, date: '5/28', teacher: 'mizuno', kind: '演習', title: 'AIと書いた日記についての日記を書く' },
  { no: 9, date: '6/11', teacher: 'yao', kind: '講義', title: '創造的アートアーカイブ' },
  { no: 10, date: '6/18', teacher: 'yao', kind: '演習', title: '調査' },
  { no: 11, date: '6/25', teacher: 'yao', kind: '演習', title: '資料収集' },
  { no: 12, date: '7/2', teacher: 'yao', kind: '演習', title: '発信に向けて' },
  { no: 13, date: '7/9', teacher: 'takawo', kind: '講義', title: 'まとめと振り返り', instructor: '3教員', ledgerAccent: 'all' },
];

/** TOPスケジュール：セット単位のグループ（各4回） */
export const SESSION_SETS: { teacher: Teacher; sessionNos: number[] }[] = [
  { teacher: 'takawo', sessionNos: [1, 2, 3, 4] },
  { teacher: 'mizuno', sessionNos: [5, 6, 7, 8] },
  { teacher: 'yao', sessionNos: [9, 10, 11, 12] },
];

export const CLOSING_SESSION_NO = 13;

/** 各授業回のハッシュタグ（授業の流れで表示） */
export const SESSION_HASHTAGS: Record<number, string[]> = {
  1: ['#デザインリサーチ', '#自己分類', '#バーナム効果', '#診断心理', '#動機理解'],
  2: ['#診断メディア', '#デプスインタビュー', '#ユーザー理解', '#動機分析', '#人間観察'],
  3: ['#インサイト', '#動機の言語化', '#ペルソナ', '#自己開示', '#内省'],
  4: ['#体験設計', '#診断デザイン', '#UX', '#プロトタイピング', '#アイデア発想'],
  5: ['#日記', '#著者性', '#AI生成', '#自己表現', '#ライフログ'],
  6: ['#生成AI', '#日記生成', '#プロンプト', '#AI協働', '#自動生成'],
  7: ['#編集', '#AI校正', '#違和感', '#介入', '#テキスト操作'],
  8: ['#メタ日記', '#再帰的記述', '#振り返り', '#AI協働', '#省察'],
  9: ['#アートアーカイブ', '#3Dスキャン', '#Scaniverse', '#記録', '#デジタル保存'],
  10: ['#リサーチ', '#アーカイブ調査', '#3Dスキャン', '#事例研究', '#情報収集'],
  11: ['#資料収集', '#キュレーション', '#メタデータ', '#データ整理', '#3Dスキャン'],
  12: ['#情報発信', '#アウトプット', '#Web公開', '#キュレーション', '#デジタルアーカイブ'],
};

export const CROSS_CUTTING = {
  sectionTitle: '3つの演習、ひとつのプロセス',
  process: [
    { no: 1, label: '問いを見つける' },
    { no: 2, label: '試してみる' },
    { no: 3, label: 'かたちにする' },
    { no: 4, label: '共有して振り返る' },
  ],
  processIntro:
    'テーマは異なっていても、どの演習でも「問いを見つけ、試し、かたちにし、共有する」というデザインのプロセスを実践しました。',
  themeConnection:
    '企画を立て、試し、発表や共有につなげる一連の過程は、結論を示すためだけでなく、考えを深めるための手段でもあります。診断メディアでは「分類」を手がかりに自分を見つめ直し、AIと日記では対話を通して思考の動きを観察し、アートアーカイブでは記録と編集を通して身近な場所の見方を変えました。' +
    '3つの演習はテーマこそ異なりましたが、「つくりながら考える」という同じ進め方で、観察・思考・表現を行き来するプロセスを学びました。',
  note:
    '3セットはテーマ（診断メディア／AIと日記／学内アートリソース）こそ異なりましたが、' +
    '「自分・身近な対象を新しい視点で観察し、言語化・編集・発信する」という同一の構造を反復しました。' +
    'AIまたは他者を協働の相手として扱う姿勢も、3セット共通の前提になっていました。',
};
