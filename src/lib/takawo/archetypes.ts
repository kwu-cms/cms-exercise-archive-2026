/** 高尾ページ学生成果カード（reference/card_image_new） */
export interface ProjectCard {
  code: string;
  name: string;
  summary: string;
}

export const PROJECT_CARDS: ProjectCard[] = [
  { code: 'ALCH', name: '合成を司る者', summary: '複数の要素を融合し、新しい存在を生み出す' },
  { code: 'BEST', name: '幻獣を育む者', summary: 'モンスターを育て、分類し、愛でる' },
  { code: 'MESS', name: '文を届ける者', summary: 'メッセージを送り、通信する行為' },
  { code: 'HATR', name: '帽子を授ける者', summary: '帽子を選ぶことでアイデンティティを示す' },
  { code: 'MIRR', name: '鏡を映す者', summary: '理想像を映し、自分を言語化する' },
  { code: 'SEER', name: '本質を見抜く者', summary: '他者からどう見られたいかを見通す' },
  { code: 'CHRO', name: '一日を紡ぐ者', summary: '架空の一日を物語として記述する' },
  { code: 'ORCL', name: '神託を授ける者', summary: '今日や未来を占う・予報する' },
  { code: 'COMP', name: '地図を描く者', summary: '自分の位置や興味をマッピングする' },
  { code: 'ARCH', name: '記憶を集める者', summary: '記録・アーカイブ・履歴を扱う' },
  { code: 'WEAV', name: '運命を織る者', summary: '人・モノ・関心を結び付ける' },
  { code: 'SCRI', name: '言葉を刻む者', summary: '人物像を文章として書き起こす' },
  { code: 'FORG', name: '形を鍛える者', summary: '試作を繰り返し形にする' },
  { code: 'ASTR', name: '星を測る者', summary: '星や天体を用いた解釈' },
  { code: 'LENS', name: '像を映す者', summary: '見えない情報を可視化する' },
  { code: 'MASK', name: '仮面を授ける者', summary: '表の顔・裏の顔・ペルソナを扱う' },
];

export const PROJECT_CARD_BY_CODE = Object.fromEntries(
  PROJECT_CARDS.map((item) => [item.code, item]),
) as Record<string, ProjectCard>;

/** @deprecated PROJECT_CARD_BY_CODE を使用 */
export const TYPE_ARCHETYPE_BY_CODE = PROJECT_CARD_BY_CODE;

/** 学生成果カードと画像の対応（1対1・重複なし） */
export const SUBMISSION_CARD_CODES: Record<string, string> = {
  'student-15': 'ALCH',
  'student-03': 'BEST',
  'student-14': 'MESS',
  'student-10': 'HATR',
  'student-09': 'MIRR',
  'student-11': 'SEER',
  'student-13': 'CHRO',
  'student-12': 'ORCL',
  'student-01': 'COMP',
  'student-05': 'ARCH',
  'student-16': 'WEAV',
  'student-07': 'SCRI',
  'student-04': 'FORG',
  'student-02': 'ASTR',
  'student-08': 'LENS',
  'student-06': 'MASK',
};

/** @deprecated SUBMISSION_CARD_CODES を使用 */
export const SUBMISSION_ARCHETYPE_CODES = SUBMISSION_CARD_CODES;

export const PROJECT_CARD_WIDTH = 676;
export const PROJECT_CARD_HEIGHT = 1044;

export function projectCardImagePath(code: string): string {
  return `/works/takawo/cards/${code}.png`;
}

/** @deprecated projectCardImagePath を使用 */
export function archetypeImagePath(code: string): string {
  return projectCardImagePath(code);
}

export function getSubmissionCardCode(submission: {
  id: string;
  archetypeCode?: string;
}): string | null {
  return submission.archetypeCode ?? SUBMISSION_CARD_CODES[submission.id] ?? null;
}

/** @deprecated getSubmissionCardCode を使用 */
export function getSubmissionArchetypeCode(submission: {
  id: string;
  archetypeCode?: string;
}): string | null {
  return getSubmissionCardCode(submission);
}

export function getSubmissionCard(submission: {
  id: string;
  archetypeCode?: string;
}): (ProjectCard & { code: string }) | null {
  const code = getSubmissionCardCode(submission);
  if (!code) return null;
  const card = PROJECT_CARD_BY_CODE[code];
  if (!card) return null;
  return { ...card, code };
}

/** @deprecated getSubmissionCard を使用 */
export function getSubmissionArchetype(submission: {
  id: string;
  archetypeCode?: string;
}): (ProjectCard & { code: string }) | null {
  return getSubmissionCard(submission);
}
