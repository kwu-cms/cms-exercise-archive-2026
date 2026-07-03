import type { Teacher } from './sessions';

export type ArchiveStatus = 'preparing' | 'partial' | 'complete';

export const SITE = {
  title: 'メディア表現発展演習Ⅰ',
  subtitle: '授業記録・成果アーカイブ',
  year: 2026,
  university: '甲南女子大学 文学部 メディア表現学科',
  heroTagline: 'つくりながら考え、考えながらつくる。ゆるやかにつながる3つの演習テーマ。',
  heroLead:
    'メディア表現発展演習Ⅰはメディア表現学科2年次の必修科目です。2026年度は「診断メディアのデザインリサーチ」「AIと書く日記」「創造的アートアーカイブ」の3テーマを、担当教員がリレーで担いました。' +
    '授業の記録と学生の成果物を、このサイトで公開しています。' ,
  archiveStatus: 'preparing' as ArchiveStatus,
};

export const ARCHIVE_STATUS: Record<
  ArchiveStatus,
  { title: string; note: string }
> = {
  preparing: { title: '成果アーカイブ', note: '2026年7月公開予定' },
  partial: { title: '成果アーカイブ', note: '順次公開中' },
  complete: { title: '成果アーカイブ', note: '公開中' },
};

/** @deprecated ARCHIVE_STATUS を使用 */
export const ARCHIVE_STATUS_LABEL: Record<ArchiveStatus, string> = {
  preparing: '成果掲載：準備中',
  partial: '成果掲載：一部公開',
  complete: '成果掲載：公開中',
};

export const FOOTER_LINKS = [
  { label: '授業概要', href: '/' },
  {
    label: '担当教員',
    href: '/#themes',
    sub: '高尾俊介・水野勝仁・八尾里絵子',
  },
  { label: 'シラバス', href: null },
  { label: 'Instagram', href: null },
  { label: 'GitHub', href: null },
  {
    label: '学科サイト',
    href: 'https://www.konan-wu.ac.jp/faculty/letters/media/',
  },
] as const;

export const NAV = [
  { href: '/', label: 'TOP' },
  { href: '/takawo/', label: '01 診断メディア' },
  { href: '/mizuno/', label: '02 AIと書く日記' },
  { href: '/yao/', label: '03 創造的アートアーカイブ' },
] as const;

export const SET_META: Record<
  Teacher,
  {
    theme: string;
    /** テーマの看板文案。過去形にしない（例：「〜を書く」） */
    tagline: string;
    question: string;
    /** カード・ヒーロー下の説明。アーカイブ用に過去形でよい */
    description: string;
    timelineIntro: string;
    sessions: string;
    dates: string;
    outcomeHint: string;
    reference: string;
  }
> = {
  takawo: {
    theme: '診断メディアのデザインリサーチ',
    tagline: '診断メディアから、デザインリサーチを学ぶ',
    question: '人はなぜ、自分を分類したくなるのか？',
    description: '',
    timelineIntro:
      '4回の授業で、診断コンテンツの仕組みを調べ、ユーザーをインタビューし、企画書としてまとめました。' +
      '「自分を分類したくなる心理」を題材に、デザインリサーチの基本を実践を通して学びました。',
    sessions: '第1〜4回',
    dates: '4/16〜5/7',
    outcomeHint: '診断メディア企画書や問いへの回答など、学生が設計した診断体験の記録を掲載しました。',
    reference:
      '授業計画は、Sanders & Stappersによるデザインリサーチの分類のうち「Research through Design（実践を通じた研究）」に位置づけています。4回の構成は、British Design Councilが提唱する「ダブルダイアモンド」モデル（発見→定義→開発→提供）に沿っています。',
  },
  mizuno: {
    theme: 'AIと書く「わたしの日記」',
    tagline: 'AIと「わたし」の境界を考える',
    question: 'AIは『わたしの日記』を書けるのか？',
    description: '',
    timelineIntro:
      'AIとの対話を通して、日記というメディアを再考しました。' +
      '4回の授業で、自分の日記を書き、AIに続きを書かせ、編集し、振り返りました。' +
      '「AIが書いた文章」と「自分の言葉」の境界を、日記という身近な形式で考えました。',
    sessions: '第5〜8回',
    dates: '5/8〜5/28',
    outcomeHint: 'AIとともに書いた日記やメタ日記、リフレクションなど、執筆プロセスの記録を掲載しました。',
    reference:
      '「日記を書くのは誰か」という問いは、山本浩貴（いぬのせなか座）が『生のアトリエ』で論じた、書くことが自分自身に考えさせる装置になるという視点を出発点にしていました。',
  },
  yao: {
    theme: '創造的アートアーカイブ',
    tagline: '身近な風景を、記録からアーカイブへ。',
    question: '見慣れた場所は、誰かの観るべきものになりうるか？',
    description: '',
    timelineIntro:
      '調査・収集・編集を通して、新しい地域アーカイブを制作しました。' +
      '4回の授業で、学内のアートや風景を散策・3Dスキャンし情報をまとめました。' +
      '「記録する」「編集する」「伝える」——アーカイブづくりの一連の流れを体験しました。',
    sessions: '第9〜12回',
    dates: '6/11〜7/2',
    outcomeHint: '学内で記録したアートリソースの3Dスキャンやレポートなど、調査・記録の成果を掲載しました。',
    reference:
      '「何を、どこまで、誰のために残すのか」という問いは、東京藝術大学「日比野克彦を保存する」プロジェクトなど、近年のアートアーカイブ実践に共通する論点です。山口勝弘をはじめ、作家自身がアートアーカイブ実践を行ってきた経験にも接続しています。',
  },
};
