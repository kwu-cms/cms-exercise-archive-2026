export type SubmissionCategory = '出力形式' | 'インサイト' | '振り返り' | '発展候補';

/** Word 提出物テーブルから抽出した課題記入項目 */
export interface SubmissionContent {
  persona: string;
  media_relation: string;
  emotion: string;
  deep_motive: string;
  insight: string;
  service_name: string;
  overview: string;
  questions: string;
  /** Word の D. 結果と体験 に記載がある場合のみ */
  result_experience?: string;
  reflection: string;
}

export type SubmissionFieldKey = keyof SubmissionContent;

/** モーダル表示用パネル（左上＝企画、右上＝ペルソナ、下＝振り返り） */
export const SUBMISSION_PANELS: {
  id: 'plan' | 'persona' | 'reflection';
  title: string;
  subtitle: string;
  fields: { key: SubmissionFieldKey; label: string; lead?: boolean }[];
}[] = [
  {
    id: 'plan',
    title: '診断メディアの企画',
    subtitle: 'WORK 04｜サービス設計・問い・出力形式',
    fields: [
      { key: 'service_name', label: 'A. サービス名称', lead: true },
      { key: 'overview', label: 'B. 概要文' },
      { key: 'questions', label: 'C. 問いの設計' },
      { key: 'result_experience', label: 'D. 結果と体験' },
    ],
  },
  {
    id: 'persona',
    title: 'ペルソナ',
    subtitle: 'WORK 02–03｜リサーチ',
    fields: [
      { key: 'persona', label: '基本情報' },
      { key: 'media_relation', label: '診断メディアとの関わり' },
      { key: 'emotion', label: '感情・動機' },
      { key: 'deep_motive', label: '深い動機（推測）' },
      { key: 'insight', label: 'インサイト記述', lead: true },
    ],
  },
  {
    id: 'reflection',
    title: '振り返り',
    subtitle: '授業を通じた思考の変化',
    fields: [{ key: 'reflection', label: '振り返り文' }],
  },
];

/** @deprecated SUBMISSION_PANELS を使用 */
export const SUBMISSION_SECTIONS = SUBMISSION_PANELS;

export interface NotableSubmission {
  id: string;
  category: SubmissionCategory;
  title: string;
  summary: string;
  note?: string;
  /** 成果カード画像コード（例: ALCH） */
  archetypeCode?: string;
  /** Word 原本から抽出した提出課題の全文。公開コンポーネントでは参照しない */
  submission?: SubmissionContent;
  /** 非公開・内部トラッキング用。PUBLIC_SHOW_STUDENT_IDS=true のときのみ表示 */
  internal?: {
    _note?: string;
    student_id: string;
    student_id_last3?: string;
    /** 照合用。公開サイトでは表示しない */
    student_name?: string;
    source_file?: string;
  };
}
