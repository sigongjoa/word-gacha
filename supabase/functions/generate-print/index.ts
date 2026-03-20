import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, json, unauthorized } from '../_shared/auth.ts'

// Anki 박스 가중치 단어 선택
function selectWords(words: Record<string, unknown>[], max: number) {
  const weighted: Record<string, unknown>[] = []
  words.forEach((w) => {
    const weight = [0, 5, 3, 2, 1][(w.box as number)] || 1
    for (let i = 0; i < weight; i++) weighted.push(w)
  })
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[weighted[i], weighted[j]] = [weighted[j], weighted[i]]
  }
  const seen = new Set<string>()
  const result: Record<string, unknown>[] = []
  for (const w of weighted) {
    if (!seen.has(w.id as string) && result.length < max) {
      seen.add(w.id as string)
      result.push(w)
    }
  }
  return result
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Datamuse API로 유의어/반의어 조회 (무료, 키 불필요)
async function getThesaurus(word: string) {
  try {
    const [synRes, antRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`),
      fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=10`),
    ])
    const synonyms = ((await synRes.json()) as { word: string }[]).map((w) => w.word)
    const antonyms = ((await antRes.json()) as { word: string }[]).map((w) => w.word)
    return { synonyms, antonyms }
  } catch {
    return { synonyms: [], antonyms: [] }
  }
}

// Gemini API 호출 (thinking 파트 제외)
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      },
    )
    const data = await res.json()
    if (!res.ok) return ''  // 429 포함 모든 에러 → 빈 문자열 (Part2/3 건너뜀)
    const parts: { text?: string; thought?: boolean }[] =
      data.candidates?.[0]?.content?.parts ?? []
    const textPart = parts.find((p) => !p.thought) ?? parts[parts.length - 1]
    return textPart?.text ?? ''
  } catch {
    return ''
  }
}

// Gemini 응답에서 JSON 파싱 (마크다운 코드블록 처리)
function parseJSON(text: string): unknown[] | null {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleaned)
    return Array.isArray(result) ? result : null
  } catch {
    return null
  }
}

// Gemini 반환 어휘/문법 문제 유효성 검사
function validateProblem(p: unknown): boolean {
  if (!p || typeof p !== 'object') return false
  const prob = p as Record<string, unknown>
  // sentence에 빈칸 마커 필수
  if (!prob.sentence || typeof prob.sentence !== 'string' || !prob.sentence.includes('_____')) return false
  // answer 비어있으면 안 됨
  if (!prob.answer || typeof prob.answer !== 'string' || !prob.answer.trim()) return false
  // options: 4개 이상, 빈 항목 없음
  if (!Array.isArray(prob.options) || prob.options.length < 4) return false
  if ((prob.options as unknown[]).some((o) => !o || typeof o !== 'string' || !(o as string).trim())) return false
  return true
}

// 유효성 통과 후 options에 answer 보정 (Gemini가 options에 answer를 빠뜨린 경우 대비)
function fixOptions(p: Record<string, unknown>): Record<string, unknown> {
  const answer = p.answer as string
  const options = [...(p.options as string[])]
  if (!options.includes(answer)) {
    // 마지막 오답을 정답으로 교체 후 셔플
    options[options.length - 1] = answer
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
  }
  return { ...p, options }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!await verifyAdmin(req)) return unauthorized()

  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
  if (!GEMINI_KEY) return json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다. Supabase secrets에 추가하세요.' }, 500)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { studentIds, grammarIds } = await req.json()
  if (!studentIds?.length) return json({ error: '학생을 선택하세요' }, 400)

  // 오답 풀: 모든 승인된 단어
  const { data: allWords } = await supabase
    .from('words')
    .select('english, student_id')
    .eq('status', 'approved')

  const distractorPool = shuffle(
    [...new Set((allWords ?? []).map((w) => w.english).filter(Boolean))]
  )

  // 문법 전체 로드 (학생별 필터링에 사용)
  let allGrammar: Record<string, unknown>[] = []
  const hasGrammarIds = Array.isArray(grammarIds) && grammarIds.length > 0
  if (hasGrammarIds) {
    const { data } = await supabase
      .from('grammar_qa').select('*').eq('status', 'answered').in('id', grammarIds)
    allGrammar = data ?? []
  } else {
    const { data } = await supabase
      .from('grammar_qa').select('*').eq('status', 'answered').eq('include_in_print', true)
    allGrammar = data ?? []
  }

    // 학생별 Part 3용 문법 생성 헬퍼 (재시도 포함)
  async function buildPart3(studentId: string, studentGrade: number | null): Promise<unknown[]> {
    const forStudent = allGrammar.filter((g) => {
      // 학생 본인 질문이거나 선생님 Q&A는 항상 포함
      if (g.student_id === studentId) return true
      if (g.student_id) return false // 다른 학생 질문 제외
      // 학년 없는 문법(공통) 또는 학생 학년과 일치하는 문법
      const grammarGrade = g.grade as number | null
      return !grammarGrade || !studentGrade || grammarGrade === studentGrade
    })
    if (!forStudent.length) return []
    const selected = shuffle(forStudent).slice(0, 5)

    const buildPrompt = (items: typeof selected) =>
      `너는 수능 영어 교사야. 다음 문법 개념들로 빈칸 4지선다 문제를 만들어줘.

규칙:
- 자연스러운 영어 문장에 빈칸(_____) 포함
- 4지선다: 정답 1개 + 오답 3개 (그럴듯하게)
- 수능 지문 스타일
- 각 문제에 반드시 _____가 포함되어야 함
- options 배열에 answer가 반드시 포함되어야 함

문법 개념:
${items.map((g, i) => `${i + 1}. Q: ${g.question} / A: ${g.answer}`).join('\n')}

반드시 아래 JSON 배열로만 응답 (다른 텍스트 없이):
[{"sentence":"...","answer":"...","options":["답1","답2","답3","답4"],"grammar_point":"문법개념명"}]

options는 answer를 포함한 4개를 랜덤 순서로.`

    const results: unknown[] = []
    const MAX_RETRIES = 3

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const needed = selected.length - results.length
      if (needed <= 0) break
      // 남은 개수만큼의 문법 항목으로 재시도
      const pendingItems = selected.slice(results.length, results.length + needed)
      const res = await callGemini(buildPrompt(pendingItems), GEMINI_KEY)
      const valid = (parseJSON(res) ?? []).filter(validateProblem)
      results.push(...valid)
    }

    return results.slice(0, selected.length)
  }

  // 학생별 처리
  const jobs = []

  for (const studentId of studentIds) {
    const { data: student } = await supabase
      .from('students').select('name, grade').eq('id', studentId).single()
    if (!student) continue

    const { data: studentWords } = await supabase
      .from('words').select('*').eq('student_id', studentId).eq('status', 'approved')
    if (!studentWords?.length) continue

    // Part 1: Anki 가중치로 단어 10개 선택
    const part1 = selectWords(studentWords, 10)

    // Part 2: 어휘 맥락 문제 — 5개 단어에 대해 Datamuse + Gemini
    const vocabCandidates = shuffle(part1).slice(0, 5)

    const thesaurusResults = await Promise.all(
      vocabCandidates.map(async (w) => {
        const { synonyms, antonyms } = await getThesaurus(w.english as string)
        return { word: w, synonyms, antonyms }
      }),
    )

    // answer/type/distractors를 코드에서 미리 확정
    type VocabItem = {
      _id: number
      answer: string
      type: 'synonym' | 'antonym'
      hint_ko: string
      distractors: string[]
    }

    const vocabItems: VocabItem[] = thesaurusResults
      .filter((d) => d.synonyms.length > 0 || d.antonyms.length > 0)
      .map((d) => {
        const useSynonym = d.synonyms.length > 0 &&
          (d.antonyms.length === 0 || Math.random() > 0.5)
        const pool = useSynonym ? d.synonyms : d.antonyms
        const answer = pool[Math.floor(Math.random() * pool.length)]
        const distractors = distractorPool
          .filter((w) => w !== answer && w !== (d.word.english as string))
          .slice(0, 3)
        return {
          _id: 0,
          answer,
          type: (useSynonym ? 'synonym' : 'antonym') as 'synonym' | 'antonym',
          hint_ko: d.word.korean as string,
          distractors,
        }
      })
      .filter((d) => d.distractors.length >= 3)
      .slice(0, 5)
      .map((d, i) => ({ ...d, _id: i }))

    let part2: unknown[] = []
    if (vocabItems.length > 0) {
      // Gemini에게는 "이 단어가 빈칸에 들어가는 문장만 만들어줘"만 요청
      const buildSentencePrompt = (items: VocabItem[]) =>
        `수능 스타일 영어 문장을 만들어줘. 각 단어가 빈칸(_____) 자리에 자연스럽게 들어가는 문장 하나씩.

단어 목록:
${items.map((v) => `_id=${v._id} 단어="${v.answer}"`).join('\n')}

규칙:
- 각 문장에 반드시 _____ 포함 (빈칸 자리)
- 수능 지문 수준의 자연스러운 영어
- 다른 텍스트 없이 JSON 배열만 응답

[{"_id":0,"sentence":"문장..._____...문장"}]`

      const MAX_RETRIES = 3
      const sentences = new Map<number, string>() // _id → sentence

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const pending = vocabItems.filter((v) => !sentences.has(v._id))
        if (!pending.length) break
        const res = await callGemini(buildSentencePrompt(pending), GEMINI_KEY)
        const parsed = parseJSON(res) ?? []
        for (const p of parsed) {
          const item = p as Record<string, unknown>
          const id = item._id as number
          const sentence = item.sentence as string
          if (
            typeof id === 'number' &&
            typeof sentence === 'string' &&
            sentence.includes('_____') &&
            !sentences.has(id) &&
            vocabItems.some((v) => v._id === id)
          ) {
            sentences.set(id, sentence)
          }
        }
      }

      // answer + distractors로 options 직접 조립 (Gemini 관여 없음)
      part2 = vocabItems
        .filter((v) => sentences.has(v._id))
        .map((v) => {
          const options = shuffle([v.answer, ...v.distractors])
          return {
            sentence: sentences.get(v._id),
            answer: v.answer,
            options,
            type: v.type,
            hint_ko: v.hint_ko,
          }
        })
    }

    // Part 3: 학생별 개인화 문법 문제 (본인 질문 + 선생님 Q&A + 학년별 문법)
    const studentGrade = (student as Record<string, unknown>).grade as number | null
    const part3 = await buildPart3(studentId, studentGrade)

    jobs.push({
      studentName: student.name,
      part1,
      part2,
      part3,
    })
  }

  return json({ jobs })
})
