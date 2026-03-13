import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
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

// Gemini 1.5 Flash API 호출
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!await verifyAdmin(req)) return unauthorized()

  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
  if (!GEMINI_KEY) return json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다. Supabase secrets에 추가하세요.' }, 500)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { studentIds, includeGrammar = true } = await req.json()
  if (!studentIds?.length) return json({ error: '학생을 선택하세요' }, 400)

  // 오답 풀: 다른 학생들의 승인된 단어
  const { data: allWords } = await supabase
    .from('words')
    .select('english, student_id')
    .eq('status', 'approved')

  const distractorPool = shuffle(
    [...new Set((allWords ?? []).map((w) => w.english).filter(Boolean))]
  )

  // 문법 문제 생성 (모든 학생 공통 — 1회만 Gemini 호출)
  let sharedPart3: unknown[] = []
  if (includeGrammar) {
    const { data: grammarList } = await supabase
      .from('grammar_qa')
      .select('*')
      .eq('include_in_print', true)
      .order('created_at')

    if (grammarList?.length) {
      const selected = shuffle(grammarList).slice(0, 5)
      const grammarPrompt = `너는 수능 영어 교사야. 다음 문법 개념들로 빈칸 4지선다 문제를 만들어줘.

규칙:
- 자연스러운 영어 문장에 빈칸(_____) 포함
- 4지선다: 정답 1개 + 오답 3개 (그럴듯하게)
- 수능 지문 스타일

문법 개념:
${selected.map((g, i) => `${i + 1}. Q: ${g.question} / A: ${g.answer}`).join('\n')}

반드시 아래 JSON 배열로만 응답 (다른 텍스트 없이):
[{"sentence":"...","answer":"...","options":["답1","답2","답3","답4"],"grammar_point":"문법개념명"}]

options는 answer를 포함한 4개를 랜덤 순서로.`

      const res = await callGemini(grammarPrompt, GEMINI_KEY)
      sharedPart3 = parseJSON(res) ?? []
    }
  }

  // 학생별 처리
  const jobs = []

  for (const studentId of studentIds) {
    const { data: student } = await supabase
      .from('students').select('name').eq('id', studentId).single()
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

    const vocabInputs = thesaurusResults
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
          original: d.word.english,
          original_ko: d.word.korean,
          answer,
          type: useSynonym ? 'synonym' : 'antonym',
          distractors,
        }
      })
      .filter((d) => d.distractors.length >= 3)
      .slice(0, 5)

    let part2: unknown[] = []
    if (vocabInputs.length > 0) {
      const vocabPrompt = `너는 수능 영어 교사야. 다음 데이터를 바탕으로 빈칸 어휘 문제를 만들어줘.

규칙:
- 자연스러운 영어 문장에 빈칸(_____) 포함
- 빈칸에는 answer 단어가 문맥상 자연스럽게 들어감
- 문장이 answer의 의미를 암시해야 함 (직접적이지 않게)
- 수능 지문 스타일 (학문적, 간결한 영어)
- type이 synonym이면 원래단어(original)의 유의어, antonym이면 반의어가 answer임

입력:
${JSON.stringify(vocabInputs)}

반드시 아래 JSON 배열로만 응답 (다른 텍스트 없이):
[{"sentence":"...","answer":"...","options":["답1","답2","답3","답4"],"type":"synonym","hint_ko":"한국어힌트"}]

options는 answer + distractors 4개를 랜덤 순서로.`

      const res = await callGemini(vocabPrompt, GEMINI_KEY)
      part2 = parseJSON(res) ?? []
    }

    jobs.push({
      studentName: student.name,
      part1,
      part2,
      part3: sharedPart3,
    })
  }

  return json({ jobs })
})
