# メディア表現発展演習Ⅰ（2026年度）成果アーカイブ

## 第1条（概要）

TOPページ（授業全体：全13回の構成）＋3セットの成果ページ（高尾／水野／八尾、各1ページ）で構成する静的サイト。
技術要件は既存プロトクト `campus-art-map` / `creative-art-archive-2026` と統一（Astro + Tailwind + Three.js/Spark）。

## 第2条（技術スタック）

```
フレームワーク: Astro 5（static output）
スタイル:       Tailwind CSS v4（@tailwindcss/vite）
コンポーネント: React 19（@astrojs/react、3Dビューアのみ島として使用）
3Dビューア:     @sparkjsdev/spark 2.x（Three.js 0.180系ベース、.spz/.ply/.splat対応）
```

## 第3条（ディレクトリ構成）

```
src/
├── layouts/Layout.astro          共通レイアウト（ヘッダー・ナビ・フッター、フォント読込）
├── styles/global.css             デザイントークン（色・タイポグラフィ）
├── data/
│   ├── sessions.ts                全13回の一覧・教員情報・共通構造テキスト
│   ├── deliverables.ts            セット別：最終成果物・締切・提出方法・評価配点
│   └── rounds/
│       ├── takawo.ts              高尾セット（第1〜4回）詳細
│       ├── mizuno.ts              水野セット（第5〜8回）詳細
│       └── yao.ts                 八尾セット（第9〜12回）詳細
├── components/
│   ├── EvalBars.astro             評価配点の横棒可視化
│   ├── RoundCard.astro            各回の詳細カード
│   └── SparkViewer.tsx            3Dスキャン（.spz等）ビューア（React island）
└── pages/
    ├── index.astro                TOP（全体構成・13回台帳・3セット導線）
    ├── takawo/index.astro         01｜高尾｜診断メディア
    ├── mizuno/index.astro         02｜水野｜AIと日記
    └── yao/index.astro            03｜八尾｜アートアーカイブ（3Dビューア組込）
```

## 第4条（デザイントークン）

| 用途 | 値 |
|---|---|
| 背景（paper） | `#f5f2e9` |
| 本文（ink） | `#1c1a15` |
| 罫線（line） | `#d3ccb8` |
| 高尾アクセント | `#b5722c`（黄土｜診断メディア） |
| 水野アクセント | `#3f5a73`（藍鼠｜AIと日記） |
| 八尾アクセント | `#55663c`（苔緑｜アートアーカイブ） |
| 見出し書体 | Shippori Mincho |
| 本文書体 | Noto Sans JP |
| 数値・メタ情報 | JetBrains Mono |

3セットを色で識別できるようにし、TOPページの台帳（全13回一覧）・各セットページのヘッダー・回カードに一貫して適用。
「01/02/03」「回数」など番号表記は、実際にリレー順序（高尾→水野→八尾→高尾）を持つ情報のため意図的に使用。

## 第5条（3Dビューアの差し替え手順｜八尾セット用）

`SparkViewer.tsx` は現状 Spark 公式サンプルアセット（蝶）をプレースホルダー表示している。
学生提出データに差し替える場合：

1. スキャンデータ（`.spz` 推奨。`.ply` / `.splat` も可）を `public/scans/` に配置
2. `src/pages/yao/index.astro` 内の呼び出しを編集

```astro
<SparkViewer client:visible splatUrl="/scans/作品名.spz" caption="作品名｜撮影者" />
```

3. 複数点を並べる場合はコンポーネントを複数回呼び出す、または `src/data/` に一覧データを追加してループ表示に拡張する

既存プロトタイプ（`kwu-cms/creative-art-archive-2026`、Astro + Mapbox GL JS + Spark）と技術要件・ライブラリ選定を統一済み。
地図連携・投稿フォーム・DB保存など運用機能が必要な場合は、そちらの構成（Cloudflare Pages + R2 + D1）を流用するのが最短。

## 第6条（実データ反映が必要な箇所）

作業指示書の時点で確定していない／転記時に表記の重複・前後関係の疑義がある項目は、資料の記載をそのまま転記した。差し替え時は以下を確認：

- 水野セットの提出フォームURL（現状「Microsoft Forms」とだけ記載）
- 八尾セットの評価配点（作業指示書に明記なし。現状ページ上は非表示）
- 八尾セット第3回・第4回の締切表記（資料内の日付が前後している箇所あり。要確認のうえ`src/data/rounds/yao.ts`を修正）

## 第7条（ローカル確認・ビルド）

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に静的出力（GitHub Pages等にそのままデプロイ可）
```
