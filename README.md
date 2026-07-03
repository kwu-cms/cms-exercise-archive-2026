# メディア表現発展演習Ⅰ（2026年度）成果アーカイブ

甲南女子大学 文学部 メディア表現学科の必修科目「メディア表現発展演習Ⅰ」2026年度の授業記録・成果公開サイトです。

- TOP + 担当教員3ページ（高尾 / 水野 / 八尾）
- Astro 7（静的出力）+ Tailwind CSS v4 + React（3Dビューア等）

## 開発

```sh
npm install
cp .env.example .env   # Mapbox トークン等を設定
npm run dev
```

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（`http://localhost:4321`） |
| `npm test` | ユニットテスト |
| `npm run build` | 本番ビルド → `dist/` |
| `npm run check` | テスト + ビルド |
| `npm run preview:pages` | GitHub Pages 相当の `BASE_PATH` でビルド・プレビュー |

## GitHub Pages 公開手順

### 1. リポジトリ作成

GitHub にリポジトリを作成し、このディレクトリを push します。  
推奨名: `cms-exercise-archive-2026`（任意の名前でも可。URL は `https://<user>.github.io/<リポジトリ名>/` になります）

```sh
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

### 2. GitHub リポジトリ設定

**Settings → Pages**

- **Build and deployment**: Source を **GitHub Actions** に設定

**Settings → Secrets and variables → Actions**

| Secret | 必須 | 説明 |
| --- | --- | --- |
| `PUBLIC_MAPBOX_TOKEN` | 八尾マップ表示時は推奨 | Mapbox 公開トークン（`.env` と同じ値） |

`main` への push で [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) が走り、テスト・ビルド後に自動デプロイされます。  
ビルド時の `BASE_PATH` はリポジトリ名から自動設定されます（`/<リポジトリ名>/`）。

### 3. 公開後の確認

- TOP: `https://<user>.github.io/<repo>/`
- 高尾: `.../<repo>/takawo/`
- 水野: `.../<repo>/mizuno/`
- 八尾: `.../<repo>/yao/`
- 旧URL: `.../<repo>/takao/` → `takawo/` へリダイレクト

ローカルで同じパス構成を試す場合:

```sh
BASE_PATH=/<repo>/ npm run build
npm run preview
```

または `npm run preview:pages`（`package.json` の `PREVIEW_BASE_PATH` をリポジトリ名に合わせて変更）。

### 4. 本番向けチェックリスト

- [ ] `PUBLIC_SHOW_STUDENT_IDS` が `false` のまま（Actions ワークフローで固定済み）
- [ ] `.env` はコミットしない（`.gitignore` 済み）
- [ ] `public/` の大容量動画・3D データが意図どおり含まれているか（合計 ~330MB 程度）
- [ ] 八尾ページの Mapbox 地図が表示されるか（トークン Secret 設定後）

## 環境変数

`.env.example` を参照。

| 変数 | 説明 |
| --- | --- |
| `PUBLIC_MAPBOX_TOKEN` | 八尾セットのキャンパスマップ用 |
| `PUBLIC_SHOW_STUDENT_IDS` | 高尾成果物の学籍番号表示（本番は `false`） |
| `BASE_PATH` | サブパス公開時のベース（CI では自動設定） |

## ドキュメント

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — 実装概要
- [docs/2026-修正実装仕様.md](./docs/2026-修正実装仕様.md) — 2026年度修正仕様
