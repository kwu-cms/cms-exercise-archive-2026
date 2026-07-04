import { describe, expect, it } from 'vitest';
import submissions from '../src/data/takawo/notable-submissions.json';
import { formatSubmissionSummary } from '../src/lib/takawo/submissions';

describe('formatSubmissionSummary', () => {
  it('removes a leading quoted title duplicate', () => {
    expect(
      formatSubmissionSummary(
        '創作モンスター診断',
        '「創作モンスター診断」レーダーチャートで視覚・物語・身体・構造・素材の5属性を並列表示。',
      ),
    ).toBe('レーダーチャートで視覚・物語・身体・構造・素材の5属性を並列表示。');
  });

  it('leaves summaries that reference the title mid-sentence unchanged', () => {
    const summary =
      '診断結果を「学科での架空の1日」のショートストーリーとして出力する形式。タイプ判定ではなく物語化する出力。';
    expect(formatSubmissionSummary('学科での架空の1日', summary)).toBe(summary);
  });

  it('does not leave a quoted title prefix in notable submissions', () => {
    for (const item of submissions) {
      const formatted = formatSubmissionSummary(item.title, item.summary);
      expect(formatted.startsWith(`「${item.title}」`), item.id).toBe(false);
    }
  });

  it('does not include real student names in internal metadata', () => {
    for (const item of submissions) {
      expect(item.internal?.student_name, item.id).toBeUndefined();
      if (item.internal?.source_file) {
        expect(item.internal.source_file).toMatch(/^a\d+\.docx$/);
      }
    }
  });
});
