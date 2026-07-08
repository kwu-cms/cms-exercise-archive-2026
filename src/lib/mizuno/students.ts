import raw from '../../data/mizuno/introduced-students.raw.json';
import type { MizunoDiary } from './diaries';

export interface MizunoIntroducedStudent {
  slug: string;
  label: string;
  tags: string[];
  metaDiary: string;
  reflection: string;
}

type RawStudent = {
  id: string;
  メタ日記: string;
  'リフレクション（400〜600字程度）': string;
  紹介したい: boolean;
};

/** 内部 id → 公開用 slug / 表示ラベル / タグ（学籍番号は掲載しない） */
const STUDENT_META: Record<
  string,
  Pick<MizunoIntroducedStudent, 'slug' | 'label' | 'tags'>
> = {
  '49': {
    slug: 'doubt-and-perfectionism',
    label: '疑問と完璧主義',
    tags: ['#Notion', '#疑問を持つ', '#完璧主義'],
  },
  '1': {
    slug: 'emotion-in-own-words',
    label: '感情は自分の言葉で',
    tags: ['#インタビュー', '#感情の描写', '#AI編集'],
  },
  '54': {
    slug: 'dialect-as-strength',
    label: '自分の言葉が一番',
    tags: ['#方言', '#日記習慣', '#AIとの差'],
  },
  '15': {
    slug: 'thinking-diary',
    label: '考えを整理する日記',
    tags: ['#将来', '#価値', '#曖昧な結論'],
  },
  '57': {
    slug: 'spoken-vs-polite',
    label: '話し言葉と丁寧さ',
    tags: ['#話し言葉', '#けど/けれど', '#交換日記'],
  },
  '42': {
    slug: 'ai-quirks',
    label: 'AIのクセと私らしさ',
    tags: ['#四字熟語', '#定型文', '#違和感'],
  },
  '47': {
    slug: 'blurred-boundary',
    label: '境界が曖昧な日記',
    tags: ['#本音', '#AIのまとめ', '#わからないまま'],
  },
  '52': {
    slug: 'pride-in-writing',
    label: '文章へのプライド',
    tags: ['#手直し', '#感情の空白', '#言葉の塊'],
  },
  '26': {
    slug: 'feelings-alone',
    label: '気持ちは自分にしかわからない',
    tags: ['#孤独', '#切り貼り', '#ポジティブでない'],
  },
  '3': {
    slug: 'unspeakable-feeling',
    label: '言葉にできない感情',
    tags: ['#置き換え', '#本物/偽物', '#言語化'],
  },
  '14': {
    slug: 'story-arc-diary',
    label: '起承転結の日記',
    tags: ['#起承転結', '#比喩', '#創造'],
  },
  '62': {
    slug: 'two-diaries',
    label: '二つの日記ができる',
    tags: ['#それぞれで書く', '#説明文', '#誰かの日記'],
  },
};

function buildStudents(): MizunoIntroducedStudent[] {
  return (raw as RawStudent[])
    .filter((entry) => entry.紹介したい)
    .map((entry) => {
      const meta = STUDENT_META[entry.id];
      if (!meta) {
        throw new Error(`Missing STUDENT_META for id ${entry.id}`);
      }
      return {
        slug: meta.slug,
        label: meta.label,
        tags: meta.tags,
        metaDiary: entry.メタ日記.trim(),
        reflection: entry['リフレクション（400〜600字程度）'].trim(),
      };
    });
}

export const MIZUNO_INTRODUCED_STUDENTS: MizunoIntroducedStudent[] = buildStudents();

/** カード用の短い抜粋（改行はスペースに） */
export function diaryExcerpt(text: string, maxChars = 96): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= maxChars) return flat;
  return `${flat.slice(0, maxChars).trim()}…`;
}

export function toHeroDiaries(students: MizunoIntroducedStudent[]): MizunoDiary[] {
  return students.map((student) => ({
    id: student.slug,
    author: student.label,
    title: 'メタ日記',
    text: student.metaDiary,
  }));
}
