import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
LABELS = [
    ("persona", "WORK 02｜基本情報"),
    ("media_relation", "WORK 02｜診断メディアとの関わり"),
    ("emotion", "WORK 02｜感情・動機"),
    ("deep_motive", "WORK 02｜深い動機"),
    ("insight", "WORK 03｜インサイト記述"),
    ("service_name", "A. サービス名称"),
    ("overview", "B. 概要文"),
    ("questions", "C. 問いの設計"),
]
D_LABEL = "D. 結果と体験"
SKIP_SUB = {
    "一言で表すタイトル",
    "何を・誰のために・どのような体験を・既存との違いを含めること",
    "上段に問いの内容、下段（グレー）に設計意図を記入してください。",
    "どんな出力形式か・ユーザーはどんな気持ちになることを意図しているか",
    "名前・年齢・学校・SNS利用の様子",
    "どんな診断を・どんな場面で・結果を共有するか否か",
    "診断に惹かれるときの感情・違和感・不満",
    "表面的には〇〇を求めているが、本当は△△を求めているのではないか？",
    "インタビューの発言を根拠に、ペルソナの深い動機を100字程度で",
}


def cell_text(cell):
    return "".join(t.text or "" for t in cell.findall(".//w:t", NS)).strip()


def parse_rows(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    rows = []
    for tbl in root.findall(".//w:tbl", NS):
        for tr in tbl.findall("w:tr", NS):
            cells = [cell_text(tc) for tc in tr.findall("w:tc", NS)]
            if any(cells):
                rows.append(cells)
    return rows


def row_join(cells):
    return "\n".join(c for c in cells if c)


def extract_d_and_reflection(rows):
    """D. 結果と体験の直後1行目＝結果と体験、2行目以降＝振り返り（Word 原本の並び）"""
    for i, cells in enumerate(rows):
        line = " | ".join(c for c in cells if c)
        if D_LABEL not in line:
            continue
        after = []
        for next_cells in rows[i + 1 :]:
            text = row_join(next_cells).strip()
            if text:
                after.append(text)
        result = after[0] if after else None
        reflection = "\n\n".join(after[1:]).strip() if len(after) > 1 else None
        return result, reflection
    return None, None


def extract_sections(rows):
    sections = {}
    current = None
    buf = []

    def flush():
        nonlocal buf, current
        if current and buf:
            sections[current] = "\n".join(buf).strip()
        buf = []

    for cells in rows:
        line = " | ".join(c for c in cells if c)
        if not line or line.startswith("【課題提出について】"):
            continue
        if D_LABEL in line:
            flush()
            current = None
            continue
        matched = None
        for key, label in LABELS:
            if label in line:
                matched = key
                break
        if matched:
            flush()
            current = matched
            if "|" in line:
                rest = line.split("|", 1)[1].strip()
                if rest and rest not in SKIP_SUB:
                    buf.append(rest)
            continue
        if current:
            buf.append(row_join(cells))

    flush()

    result, reflection = extract_d_and_reflection(rows)
    if result:
        sections["result_experience"] = result
    if reflection:
        sections["reflection"] = reflection

    return sections


docx_dir = Path(sys.argv[1])
out = {}
for docx in sorted(docx_dir.glob("*.docx")):
    if docx.name.startswith("~$"):
        continue
    student_id = docx.stem.split("_", 1)[0]
    name_part = docx.stem.split("_", 1)[1] if "_" in docx.stem else ""
    sections = extract_sections(parse_rows(docx))
    out[student_id] = {
        "student_name": name_part,
        "source_file": docx.name,
        **sections,
    }
print(json.dumps(out, ensure_ascii=False, indent=2))
