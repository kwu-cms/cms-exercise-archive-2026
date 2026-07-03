# mizunoセクション Hero 実装指示書

## 目的

`AIと書く日記` / mizuno セクションの hero 部分に、学生の日記テキストが1文字ずつ入力されていく p5.js スケッチを表示する。

既存サイトの hero レイアウト・高さ・余白・レスポンシブ設計を壊さず、背景的なビジュアルとして組み込む。

---

## 実装対象

対象ページ：

- `02 AIと書く日記`
- mizuno セクション
- hero エリア

想定ファイル構成：

```txt
/assets/
  /data/
    mizuno-diaries.json
  /js/
    mizuno-hero-typing.js
```

HTML 側では hero 内に p5.js 用のコンテナを追加する。

```html
<section class="hero hero--mizuno">
  <div id="mizuno-hero-canvas" class="mizuno-hero-canvas" aria-hidden="true"></div>
  <div class="hero__content">
    <!-- 既存の見出し・本文 -->
  </div>
</section>
```

---

## JSON データ

`/assets/data/mizuno-diaries.json` を作成する。

```json
[
  {
    "id": "diary_001",
    "author": "student_a",
    "title": "帰り道のこと",
    "text": "今日は授業のあと、駅まで歩く時間がいつもより長く感じた。イヤホンを忘れたので、車の音や誰かの話し声がそのまま耳に入ってきた。少し落ち着かなかったけれど、逆に自分が普段どれだけ音を選んで生活しているのかに気づいた。日記を書くために一日を思い出すと、何でもない帰り道にも小さな引っかかりがある。AIにこの続きを書かせたら、きっと「夕焼けがきれいだった」とまとめそうだけれど、実際には曇っていて、少し蒸し暑かった。"
  },
  {
    "id": "diary_002",
    "author": "student_b",
    "title": "AIに似ていると言われた文章",
    "text": "自分の日記を読み返したら、思っていたより説明が多かった。もっと感情を書いているつもりだったのに、出来事を順番に並べているだけに見える。AIに続きを書かせると、私よりずっと自然に気持ちを補ってきて、少し悔しかった。でも、その気持ちは本当に私のものではない。似ているのに、どこか都合がいい。私なら言わない言葉が、私の代わりに置かれている感じがした。"
  },
  {
    "id": "diary_003",
    "author": "student_c",
    "title": "直さなかったところ",
    "text": "AIが書いた日記の中に、「今日は少しだけ前に進めた気がする」という一文があった。最初はありきたりだと思って消そうとしたけれど、なぜか残した。自分では絶対に書かない言い方なのに、その日の気分とは少し合っていたからだと思う。編集するというより、どこまで自分の文章として許せるかを決めている感じだった。日記は自分だけのものだと思っていたけれど、読む自分、直す自分、残す自分がいて、思ったより一人ではなかった。"
  },
  {
    "id": "diary_004",
    "author": "student_d",
    "title": "メタ日記",
    "text": "AIと日記を書く課題をしてから、日記は記録ではなく編集なのだと思うようになった。同じ一日でも、何を書くか、何を書かないかで全然違う自分になる。AIは私の文章をまねるけれど、迷い方まではまねられない。どの言葉を選ぶかより、どの言葉に違和感をもつかの方が、自分に近いのかもしれない。今回の課題では、AIに書かせることで、自分が書いているつもりだった部分が少し外側から見えた。"
  },
  {
    "id": "diary_005",
    "author": "student_e",
    "title": "提出前の夜",
    "text": "提出前にもう一度読み返すと、最初に書いた日記が少し他人の文章みたいに見えた。AIが書いた部分より、自分で書いた部分の方が恥ずかしい。たぶん、そのとき本当に思っていたことが雑に残っているからだと思う。AIの文章は整っていて読みやすいけれど、読み返してもあまり傷つかない。自分の文章は変なところが多い。でも、その変さがないと、日記ではなく感想文になってしまう気がした。"
  }
]
```

---

## p5.js 実装方針

### 基本仕様

- p5.js は instance mode で実装する。
- `#mizuno-hero-canvas` のサイズに合わせて canvas を生成する。
- canvas は hero 内に絶対配置し、既存の hero テキストの背面に置く。
- 表示する日記は JSON からランダムまたは順番に選択する。
- 1人分の日記を表示し終えたら、短い停止時間を置いて次の日記へ切り替える。
- 入力中のカーソルを表示する。
- `prefers-reduced-motion: reduce` の場合はアニメーションを停止し、全文を静止表示する。

---

## 表示時間の制御

1人分の日記の表示時間は、文字数に応じて 10〜20秒に収める。

```js
const MIN_DURATION = 10000;
const MAX_DURATION = 20000;

function getDurationByLength(length) {
  const minChars = 120;
  const maxChars = 420;
  const t = constrain((length - minChars) / (maxChars - minChars), 0, 1);
  return lerp(MIN_DURATION, MAX_DURATION, t);
}
```

文字表示速度：

```js
charsPerSecond = text.length / (duration / 1000);
```

毎フレーム、経過時間から表示文字数を算出する。

```js
const progress = constrain((millis() - startTime) / duration, 0, 1);
const visibleCount = floor(progress * currentText.length);
const visibleText = currentText.slice(0, visibleCount);
```

---

## 文字サイズの自動調整

hero 内に全文が収まる文字サイズを自動計算する。

### 条件

- canvas の左右に安全余白を持たせる。
- 既存 hero テキストと重なる場合は、描画位置・透明度で調整する。
- スマホでは文字サイズを小さめにする。
- 最小文字サイズを下回る場合は、全文表示ではなく行数制限＋フェードアウトも許容する。

### 推奨値

```js
const PADDING_X_RATIO = 0.08;
const PADDING_Y_RATIO = 0.16;
const FONT_SIZE_MAX = 28;
const FONT_SIZE_MIN = 12;
const LINE_HEIGHT_RATIO = 1.75;
```

### 計測ロジック

1. 仮の文字サイズを `FONT_SIZE_MAX` から始める。
2. p5.js の `textWidth()` を使って日本語テキストを行分割する。
3. 分割後の行数 × 行高が描画可能高さに収まるか判定する。
4. 収まらなければ文字サイズを1pxずつ下げる。
5. `FONT_SIZE_MIN` まで下げても収まらない場合は、表示エリア内で描画できる行数に制限する。

---

## 日本語テキストの行分割

p5.js の `text()` に任せず、自前で行分割する。

```js
function wrapJapaneseText(p, text, maxWidth) {
  const chars = [...text];
  const lines = [];
  let line = '';

  for (const char of chars) {
    const testLine = line + char;
    if (p.textWidth(testLine) > maxWidth && line.length > 0) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  }

  if (line.length > 0) lines.push(line);
  return lines;
}
```

---

## 見た目の方向性

mizuno セクションの内容に合わせて、過度に派手な演出は避ける。

### 推奨トーン

- 日記
- タイピング
- 編集途中
- AIとの境界
- 少し曖昧なレイヤー感

### 表現案

- 背景に薄いテキストを表示する。
- 入力中のテキストはやや濃くする。
- カーソルは縦線 `|` を点滅させる。
- 数文字前までを少しだけ強調し、入力直後の印象を出す。
- 背景に小さなノイズや罫線を足す場合は、既存デザインを邪魔しない透明度にする。

---

## CSS 指示

```css
.hero--mizuno {
  position: relative;
  overflow: hidden;
}

.mizuno-hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.hero--mizuno .hero__content {
  position: relative;
  z-index: 1;
}
```

hero 本体に既に `position: relative` や `overflow: hidden` がある場合は重複させない。

---

## p5.js 実装サンプル

`/assets/js/mizuno-hero-typing.js`

```js
const mizunoHeroTypingSketch = (p) => {
  let diaries = [];
  let currentIndex = 0;
  let currentDiary = null;
  let currentText = '';
  let startTime = 0;
  let duration = 10000;
  let pauseStart = 0;
  let isPausing = false;

  let fontSize = 18;
  let lines = [];
  let reducedMotion = false;

  const MIN_DURATION = 10000;
  const MAX_DURATION = 20000;
  const PAUSE_DURATION = 2200;
  const FONT_SIZE_MAX = 28;
  const FONT_SIZE_MIN = 12;
  const LINE_HEIGHT_RATIO = 1.75;

  p.preload = () => {
    diaries = p.loadJSON('/assets/data/mizuno-diaries.json');
  };

  p.setup = () => {
    const container = document.getElementById('mizuno-hero-canvas');
    const w = container.clientWidth;
    const h = container.clientHeight;

    const canvas = p.createCanvas(w, h);
    canvas.parent(container);

    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    normalizeDiaries();
    selectDiary(0);
  };

  p.windowResized = () => {
    const container = document.getElementById('mizuno-hero-canvas');
    p.resizeCanvas(container.clientWidth, container.clientHeight);
    calculateTextLayout(currentText);
  };

  p.draw = () => {
    p.clear();
    drawSubtleBackground();

    if (!currentDiary) return;

    if (reducedMotion) {
      drawTextBlock(currentText, true);
      return;
    }

    if (isPausing) {
      drawTextBlock(currentText, true);
      if (p.millis() - pauseStart > PAUSE_DURATION) {
        selectDiary((currentIndex + 1) % diaries.length);
      }
      return;
    }

    const elapsed = p.millis() - startTime;
    const progress = p.constrain(elapsed / duration, 0, 1);
    const visibleCount = Math.floor(progress * currentText.length);
    const visibleText = currentText.slice(0, visibleCount);

    drawTextBlock(visibleText, false);

    if (progress >= 1) {
      isPausing = true;
      pauseStart = p.millis();
    }
  };

  function normalizeDiaries() {
    if (!Array.isArray(diaries)) {
      diaries = Object.values(diaries);
    }
  }

  function selectDiary(index) {
    currentIndex = index;
    currentDiary = diaries[currentIndex];
    currentText = currentDiary.text;
    duration = getDurationByLength(currentText.length);
    startTime = p.millis();
    isPausing = false;
    calculateTextLayout(currentText);
  }

  function getDurationByLength(length) {
    const minChars = 120;
    const maxChars = 420;
    const t = p.constrain((length - minChars) / (maxChars - minChars), 0, 1);
    return p.lerp(MIN_DURATION, MAX_DURATION, t);
  }

  function calculateTextLayout(text) {
    const box = getTextBox();

    for (let size = FONT_SIZE_MAX; size >= FONT_SIZE_MIN; size--) {
      p.textSize(size);
      const testLines = wrapJapaneseText(text, box.w);
      const lineHeight = size * LINE_HEIGHT_RATIO;
      const totalHeight = testLines.length * lineHeight;

      if (totalHeight <= box.h) {
        fontSize = size;
        lines = testLines;
        return;
      }
    }

    fontSize = FONT_SIZE_MIN;
    p.textSize(fontSize);
    lines = wrapJapaneseText(text, box.w);
  }

  function getTextBox() {
    const paddingX = p.width * 0.08;
    const paddingY = p.height * 0.16;

    return {
      x: paddingX,
      y: paddingY,
      w: p.width - paddingX * 2,
      h: p.height - paddingY * 2
    };
  }

  function drawTextBlock(text, completed) {
    const box = getTextBox();
    p.textSize(fontSize);
    p.textAlign(p.LEFT, p.TOP);
    p.textFont('sans-serif');

    const visibleLines = wrapJapaneseText(text, box.w);
    const lineHeight = fontSize * LINE_HEIGHT_RATIO;
    const maxLines = Math.floor(box.h / lineHeight);
    const drawLines = visibleLines.slice(0, maxLines);

    p.noStroke();
    p.fill(20, 20, 20, 110);

    for (let i = 0; i < drawLines.length; i++) {
      p.text(drawLines[i], box.x, box.y + i * lineHeight);
    }

    if (!completed && Math.floor(p.frameCount / 28) % 2 === 0) {
      drawCursor(drawLines, box, lineHeight);
    }
  }

  function drawCursor(drawLines, box, lineHeight) {
    if (drawLines.length === 0) return;

    const lastLine = drawLines[drawLines.length - 1];
    const x = box.x + p.textWidth(lastLine) + 4;
    const y = box.y + (drawLines.length - 1) * lineHeight;

    p.stroke(20, 20, 20, 120);
    p.strokeWeight(1.5);
    p.line(x, y + 2, x, y + fontSize * 1.2);
  }

  function wrapJapaneseText(text, maxWidth) {
    const chars = [...text];
    const wrapped = [];
    let line = '';

    for (const char of chars) {
      const testLine = line + char;
      if (p.textWidth(testLine) > maxWidth && line.length > 0) {
        wrapped.push(line);
        line = char;
      } else {
        line = testLine;
      }
    }

    if (line.length > 0) wrapped.push(line);
    return wrapped;
  }

  function drawSubtleBackground() {
    p.noStroke();
    p.fill(0, 0, 0, 8);

    const step = 28;
    for (let y = 0; y < p.height; y += step) {
      p.rect(0, y, p.width, 1);
    }
  }
};

const mizunoHeroContainer = document.getElementById('mizuno-hero-canvas');
if (mizunoHeroContainer) {
  new p5(mizunoHeroTypingSketch);
}
```

---

## HTML 読み込み順

p5.js 本体を先に読み込み、その後にスケッチを読み込む。

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script>
<script src="/assets/js/mizuno-hero-typing.js"></script>
```

既に p5.js をサイト内で読み込んでいる場合は重複読み込みしない。

---

## レスポンシブ調整

### PC

- hero 全体の背景演出として広めに表示する。
- 文字サイズは 18〜28px 程度。
- 余白を大きめに取り、本文と重なっても読みづらくならない透明度にする。

### SP

- 文字サイズは 12〜18px 程度。
- hero の主要見出しが読めることを優先する。
- 必要であれば canvas の opacity を下げる。

```css
@media (max-width: 768px) {
  .mizuno-hero-canvas {
    opacity: 0.55;
  }
}
```

---

## アクセシビリティ

- canvas は装飾扱いなので `aria-hidden="true"` を付与する。
- hero の主要テキスト情報は HTML 側に残す。
- `prefers-reduced-motion` に対応する。
- アニメーションがなくてもページ内容が成立するようにする。

---

## 実装チェック項目

- [ ] hero の既存高さ・余白が壊れていない
- [ ] canvas が hero 内に収まっている
- [ ] p5.js が対象ページだけで動作している
- [ ] JSON が正しく読み込まれている
- [ ] 日記が1文字ずつ表示される
- [ ] 1人分の表示時間が10〜20秒内に収まる
- [ ] 文字量が多くても hero から大きくはみ出さない
- [ ] スマホ表示で見出しが読める
- [ ] reduced motion で静止表示になる
- [ ] Console にエラーが出ていない

---

## 追加改善案

初期実装後、必要に応じて以下を検討する。

- 日記の一部を `AI生成部分` / `自分の文章` として色や透明度で分ける
- 編集ログ風に、削除線や差し替え表現を追加する
- タイトルを小さく表示する
- ランダムではなく授業回に対応した順番で表示する
- 実際の学生提出物に差し替える際、個人情報・固有名詞を削除する前処理を追加する
