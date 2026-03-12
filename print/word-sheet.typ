// ════════════════════════════════════════════════════════════
//  Word Gacha — 단어 테스트지
// ════════════════════════════════════════════════════════════
#set page(paper: "a4", margin: (top: 12mm, bottom: 12mm, left: 13mm, right: 13mm))
#set text(font: ("Noto Sans CJK KR", "Noto Serif CJK KR", "Malgun Gothic", "Apple SD Gothic Neo"),
          size: 10.5pt, lang: "ko")
#set block(spacing: 0pt)
#set par(leading: 0pt)

// ── 색상 ─────────────────────────────────────────────────────
#let c-blue   = rgb(50, 80, 160)
#let c-blank  = rgb(213, 220, 232)
#let c-border = rgb(185, 197, 218)
#let c-stripe = rgb(246, 248, 252)

// ── 서버 주입 변수 ───────────────────────────────────────────
#let student = "학생이름"
#let rdate   = "2026. 03. 12."

// ── 단어 데이터 ──────────────────────────────────────────────
// ("english", "korean", "en_mode", "ko_mode")  mode: "show"|"blank"
#let words = (
// ─── AUTO_WORDS_START
// ─── AUTO_WORDS_END
)

// ── 문법 Q&A ─────────────────────────────────────────────────
// ("question", "answer")
#let grammar = (
// ─── AUTO_GRAMMAR_START
// ─── AUTO_GRAMMAR_END
)

// ════════════════════════════════════════════════════════════
//  헬퍼 함수
// ════════════════════════════════════════════════════════════

// 빈칸 박스
#let blank(w) = box(width: w, height: 15pt, fill: c-blank, radius: 2pt)

// 텍스트 or 빈칸
#let cell(val, mode, w) = {
  if mode == "blank" {
    blank(w)
  } else {
    box(width: w, height: 15pt, clip: true,
      inset: (x: 3pt, y: 0pt),
      align(horizon, text(size: 10pt)[#val]))
  }
}

// 번호 뱃지
#let num(n) = box(width: 17pt, height: 17pt, fill: c-blue, radius: 2pt,
  align(center + horizon,
    text(fill: white, weight: "bold", size: 8pt)[#n]))

// 단어 한 행: 번호 | 영어셀 | → | 한국어셀
#let wrow(n, eng, em, kor, km, bg) = box(
  width: 100%, fill: bg, inset: (x: 4pt, y: 5pt),
  grid(
    columns: (17pt, 1fr, 12pt, 1fr),
    column-gutter: 3pt,
    align(center + horizon, num(n)),
    align(left + horizon,   cell(eng, em, 100%)),
    align(center + horizon, text(fill: c-border, size: 10pt)[→]),
    align(left + horizon,   cell(kor, km, 100%)),
  )
)

// ════════════════════════════════════════════════════════════
//  페이지 출력
// ════════════════════════════════════════════════════════════

// ── 최상단 헤더 ──────────────────────────────────────────────
#block(spacing: 0pt, width: 100%,
  box(width: 100%, stroke: (bottom: 2pt + c-blue), inset: (bottom: 6pt),
    grid(columns: (1fr, auto, auto, auto), column-gutter: 8pt,
      align(left + horizon,
        stack(dir: ltr, spacing: 5pt,
          text(size: 13pt, weight: "bold", fill: c-blue)[단어 테스트],
          align(bottom, text(size: 7.5pt, fill: gray)[Word Vocabulary Test]),
        )
      ),
      // 이름
      stack(dir: ttb, spacing: 2pt,
        align(center, text(size: 7pt, fill: gray)[이 름]),
        box(width: 72pt, height: 16pt, stroke: 0.5pt + c-border, radius: 2pt,
          inset: (left: 4pt),
          align(left + horizon, text(size: 9pt, weight: "bold")[#student])),
      ),
      // 날짜
      stack(dir: ttb, spacing: 2pt,
        align(center, text(size: 7pt, fill: gray)[날 짜]),
        box(width: 68pt, height: 16pt, stroke: 0.5pt + c-border, radius: 2pt,
          inset: (left: 4pt),
          align(left + horizon, text(size: 8pt)[#rdate])),
      ),
      // 점수
      stack(dir: ttb, spacing: 2pt,
        align(center, text(size: 7pt, fill: gray)[점 수]),
        box(width: 34pt, height: 16pt, stroke: 0.5pt + c-border, radius: 2pt),
      ),
    )
  )
)

// ── 컬럼 헤더 ────────────────────────────────────────────────
#v(1.5mm)
#block(spacing: 0pt, width: 100%,
  box(width: 100%, fill: rgb(232, 238, 255), inset: (x: 5pt, y: 2.5pt),
    grid(columns: (1fr, 1pt, 1fr), column-gutter: 0pt,
      align(center,
        text(size: 7pt, fill: c-blue, weight: "bold")[No.  영어  →  한국어]),
      box(width: 1pt, height: 10pt, fill: c-border),
      align(center,
        text(size: 7pt, fill: c-blue, weight: "bold")[No.  영어  →  한국어]),
    )
  )
)

// ── 단어 목록 (위에서부터) ───────────────────────────────────
#for (pi, _) in words.enumerate() {
  if calc.rem(pi, 2) == 0 {
    let lw = words.at(pi)
    let rw = if pi + 1 < words.len() { words.at(pi + 1) } else { none }
    let bg = if calc.rem(int(pi / 2), 2) == 0 { white } else { c-stripe }

    block(spacing: 0pt, width: 100%,
      grid(columns: (1fr, 1pt, 1fr), column-gutter: 0pt,
        wrow(pi + 1, lw.at(0), lw.at(2), lw.at(1), lw.at(3), bg),
        box(width: 1pt, height: 25pt, fill: c-border),
        if rw != none {
          wrow(pi + 2, rw.at(0), rw.at(2), rw.at(1), rw.at(3), bg)
        } else {
          box(width: 100%, fill: bg, inset: (x: 3pt, y: 2pt), [])
        },
      )
    )
  }
}

// ── 문법 Q&A (아래에서부터) ──────────────────────────────────
#if grammar.len() > 0 {
  v(1fr)
  block(spacing: 0pt, width: 100%,
    box(width: 100%, fill: rgb(250, 248, 255),
      stroke: 0.5pt + c-border, radius: 3pt,
      inset: (x: 8pt, y: 6pt),
      {
        grid(columns: (auto, 1fr), column-gutter: 5pt,
          box(fill: c-blue, radius: 2pt, inset: (x: 5pt, y: 2pt),
            text(fill: white, weight: "bold", size: 8pt)[문법]),
          align(left + horizon,
            text(weight: "bold", size: 9pt)[문법 — 빈칸에 알맞은 답을 쓰세요]),
        )
        v(4pt)
        for (i, qa) in grammar.enumerate() {
          if i > 0 { v(2pt) }
          let (q, _) = qa
          box(width: 100%, fill: white, radius: 2pt,
            stroke: 0.3pt + c-border, inset: (x: 7pt, y: 5pt),
            grid(columns: (14pt, 1fr), column-gutter: 3pt, row-gutter: 4pt,
              align(center + horizon,
                text(weight: "bold", fill: c-blue, size: 8pt)[#(i + 1)]),
              align(left + horizon,
                text(weight: "bold", size: 8.5pt)[#q]),
              [],
              box(width: 100%, height: 14pt,
                stroke: (bottom: 0.7pt + c-border)),
            )
          )
        }
      }
    )
  )
}

// ════════════════════════════════════════════════════════════
//  2페이지 — 정답지
// ════════════════════════════════════════════════════════════
#pagebreak()

// ── 정답지 헤더 ──────────────────────────────────────────────
#block(spacing: 0pt, width: 100%,
  box(width: 100%, stroke: (bottom: 2pt + rgb(180, 40, 40)), inset: (bottom: 6pt),
    grid(columns: (1fr, auto, auto), column-gutter: 8pt,
      align(left + horizon,
        stack(dir: ltr, spacing: 5pt,
          text(size: 13pt, weight: "bold", fill: rgb(180, 40, 40))[정 답 지],
          align(bottom, text(size: 7.5pt, fill: gray)[Answer Sheet]),
        )
      ),
      stack(dir: ttb, spacing: 2pt,
        align(center, text(size: 7pt, fill: gray)[이 름]),
        box(width: 72pt, height: 16pt, stroke: 0.5pt + c-border, radius: 2pt,
          inset: (left: 4pt),
          align(left + horizon, text(size: 9pt, weight: "bold")[#student])),
      ),
      stack(dir: ttb, spacing: 2pt,
        align(center, text(size: 7pt, fill: gray)[날 짜]),
        box(width: 68pt, height: 16pt, stroke: 0.5pt + c-border, radius: 2pt,
          inset: (left: 4pt),
          align(left + horizon, text(size: 8pt)[#rdate])),
      ),
    )
  )
)

// ── 컬럼 헤더 ────────────────────────────────────────────────
#v(1.5mm)
#block(spacing: 0pt, width: 100%,
  box(width: 100%, fill: rgb(255, 235, 235), inset: (x: 5pt, y: 2.5pt),
    grid(columns: (1fr, 1pt, 1fr), column-gutter: 0pt,
      align(center,
        text(size: 7pt, fill: rgb(180, 40, 40), weight: "bold")[No.  영어  →  한국어]),
      box(width: 1pt, height: 10pt, fill: c-border),
      align(center,
        text(size: 7pt, fill: rgb(180, 40, 40), weight: "bold")[No.  영어  →  한국어]),
    )
  )
)

// ── 정답 단어 목록 (모두 show) ───────────────────────────────
#for (pi, _) in words.enumerate() {
  if calc.rem(pi, 2) == 0 {
    let lw = words.at(pi)
    let rw = if pi + 1 < words.len() { words.at(pi + 1) } else { none }
    let bg = if calc.rem(int(pi / 2), 2) == 0 { white } else { c-stripe }

    block(spacing: 0pt, width: 100%,
      grid(columns: (1fr, 1pt, 1fr), column-gutter: 0pt,
        // 정답: en_mode/ko_mode 무시하고 모두 "show"
        wrow(pi + 1, lw.at(0), "show", lw.at(1), "show", bg),
        box(width: 1pt, height: 25pt, fill: c-border),
        if rw != none {
          wrow(pi + 2, rw.at(0), "show", rw.at(1), "show", bg)
        } else {
          box(width: 100%, fill: bg, inset: (x: 3pt, y: 2pt), [])
        },
      )
    )
  }
}

// ── 문법 정답 (아래에서부터) ─────────────────────────────────
#if grammar.len() > 0 {
  v(1fr)
  block(spacing: 0pt, width: 100%,
    box(width: 100%, fill: rgb(255, 248, 248),
      stroke: 0.5pt + rgb(220, 180, 180), radius: 3pt,
      inset: (x: 8pt, y: 6pt),
      {
        grid(columns: (auto, 1fr), column-gutter: 5pt,
          box(fill: rgb(180, 40, 40), radius: 2pt, inset: (x: 5pt, y: 2pt),
            text(fill: white, weight: "bold", size: 8pt)[문법 정답]),
          align(left + horizon,
            text(weight: "bold", size: 9pt)[문법 정답]),
        )
        v(4pt)
        for (i, qa) in grammar.enumerate() {
          if i > 0 { v(2pt) }
          let (q, a) = qa
          box(width: 100%, fill: white, radius: 2pt,
            stroke: 0.3pt + rgb(220, 180, 180), inset: (x: 7pt, y: 5pt),
            grid(columns: (14pt, 1fr, auto), column-gutter: 4pt,
              align(center + horizon,
                text(weight: "bold", fill: rgb(180, 40, 40), size: 8pt)[#(i + 1)]),
              align(left + horizon,
                text(size: 8.5pt)[#q]),
              align(right + horizon,
                box(fill: rgb(255, 235, 235), radius: 2pt, inset: (x: 6pt, y: 3pt),
                  text(weight: "bold", fill: rgb(180, 40, 40), size: 9pt)[#a])),
            )
          )
        }
      }
    )
  )
}
