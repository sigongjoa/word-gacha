import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { json } from '../_shared/auth.ts'

// ── $variable$ 치환 ────────────────────────────────────────────
function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`$${k}$`, v), template)
}

// ── 프롬프트 템플릿 ────────────────────────────────────────────
const GENERATE_TEMPLATE = `너는 한국 $school_level$ 영어 수행평가 출제 전문가야.
$type_label$ 문제를 하나 출제해줘.

[참고 어휘 맥락]
학생이 취약한 단어들: $vocab_context$
→ 이 단어들의 의미 영역이 자연스럽게 녹아들 수 있는 주제로 출제하되,
  단어를 직접 쓰라고 강요하지 말 것 (학생 자율에 맡길 것)

[출제 기준]
- 실제 수능·내신에서 나올 법한 자연스러운 주제 (매 요청마다 다른 주제)
- 조건은 2-3개: 문법 조건 1개 + 내용 조건 1-2개
- 기대 답안 길이: $expected_length$
- 흥미로운 소재 (환경, 기술, 사회, 심리, 문화 등 다양하게)

[유형 안내]
$type_guide$

반드시 아래 JSON 하나만 응답 (다른 텍스트 없이):
{"type":"$problem_type$","instruction":"...","prompt":"지문(없으면 빈 문자열)","conditions":["조건1","조건2"],"expected_length":"$expected_length$"}`

const GRADE_TEMPLATE = `너는 한국 $school_level$ 영어 수행평가 채점 전문가야.
아래 루브릭으로 학생 답안을 채점하고, 항목별 근거·개선점과 모범 답안을 제시해줘.

[문제]
지시문: $problem_instruction$
$prompt_section$조건:
$conditions$

[학생 답안]
$student_answer$

[참고 어휘 — 학생이 활용했으면 expression 코멘트에 긍정 언급, 미사용 감점 없음]
$vocab_hints$

[루브릭 — $school_level$ 기준]
내용(Content) 0-3점
  3: 주제 완전 부합, 핵심 아이디어 명확·충분
  2: 대체로 부합하나 일부 핵심 요소 부족
  1: 주제와 관련은 있으나 핵심 미달
  0: 주제와 무관하거나 무응답

구성(Structure) 0-3점
  3: 도입/전개/마무리 명확, 논리적 흐름 자연스러움
  2: 구조는 있으나 전환 어색하거나 일부 불명확
  1: 구조 불분명하나 어느 정도 흐름 존재
  0: 구조 없음

표현(Expression) 0-3점
  3: 문법 정확, 다양한 어휘, 모든 조건 충족
  2: 소수 문법 오류, 조건 대부분 충족
  1: 다수 문법 오류, 조건 일부만 충족
  0: 이해 불가 또는 조건 전혀 미충족

반드시 아래 JSON 하나만 응답 (다른 텍스트 없이):
{"content":{"score":0,"comment":"한국어","improvement":"한국어"},"structure":{"score":0,"comment":"한국어","improvement":"한국어"},"expression":{"score":0,"comment":"한국어","improvement":"한국어"},"total":0,"model_answer":"영어 모범 답안 전문","word_usage":$word_usage_tpl$}`

// ── 유형 메타 ──────────────────────────────────────────────────
const TYPES: Record<string, { label: string; guide: string; length: string }> = {
  sentence_completion: {
    label: '조건영작',
    guide: '주어진 지문·상황에 대해 조건(문법·어휘)에 맞게 영어 문장을 완성하거나 영작하는 유형. 지문은 50-100단어 내외 또는 없을 수 있음.',
    length: '3-5문장',
  },
  word_arrangement: {
    label: '단어 배열',
    guide: '주어진 영단어 7-10개를 올바른 순서로 배열하여 문장을 완성하는 유형. conditions에 제공할 단어 목록(단어1/단어2/...) 포함. 형태 변형 가능 여부 명시.',
    length: '2-3문장',
  },
  summary_writing: {
    label: '요약문 완성',
    guide: '100-150단어 영어 지문을 prompt에 포함하고 학생이 핵심을 2-3문장으로 요약하는 유형. prompt 필수.',
    length: '2-3문장',
  },
  free_writing: {
    label: '자유 영작',
    guide: '제시된 주제·질문에 대해 자신의 의견이나 경험을 자유롭게 쓰는 유형. 학생 일상과 연결되는 친숙한 소재.',
    length: '4-6문장',
  },
}

// ── Gemini 호출 ────────────────────────────────────────────────
async function callGemini(prompt: string, apiKey: string): Promise<{ text: string; status: number }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 2048 },
        }),
      },
    )
    if (!res.ok) return { text: '', status: res.status }
    const data = await res.json()
    const parts: { text?: string; thought?: boolean }[] =
      data.candidates?.[0]?.content?.parts ?? []
    const textPart = parts.find((p) => !p.thought) ?? parts[parts.length - 1]
    return { text: textPart?.text ?? '', status: 200 }
  } catch {
    return { text: '', status: 500 }
  }
}

function parseObj(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const r = JSON.parse(cleaned)
    return r && typeof r === 'object' && !Array.isArray(r) ? r : null
  } catch {
    return null
  }
}

// ── 우선순위 기반 단어 선택 ─────────────────────────────────────
// priority = (3 - box) * 3 + wrong_count  → 모를수록 높음
function pickTargetWords(words: Record<string, unknown>[], req: number, opt: number) {
  const scored = words
    .map(w => ({ ...w, _p: (3 - Math.min(Number(w.box) || 1, 3)) * 3 + (Number(w.wrong_count) || 0) }))
    .sort((a, b) => b._p - a._p)
  return {
    required: scored.slice(0, req),
    optional: scored.slice(req, req + opt),
  }
}

// ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
  if (!GEMINI_KEY) return json({ error: 'GEMINI_API_KEY 미설정' }, 500)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()
  const { action, studentId } = body as Record<string, unknown>
  if (!studentId) return json({ error: 'studentId 필요' }, 400)

  // 학생 정보 + 학교급 판별
  const { data: stu } = await supabase
    .from('students').select('name, school, grade').eq('id', studentId).single()
  if (!stu) return json({ error: '학생 없음' }, 404)

  const schoolName = String((stu as Record<string, unknown>).school ?? '')
  const schoolLevel = schoolName.includes('중') ? '중학교' : '고등학교'

  // ══════════════════════════════════════════════════════════
  // generate: 문제 생성
  // ══════════════════════════════════════════════════════════
  if (action === 'generate') {
    const rawType = String(body.problemType ?? 'sentence_completion')
    const typeKey = rawType in TYPES ? rawType : 'sentence_completion'
    const typeInfo = TYPES[typeKey]

    const { data: words } = await supabase
      .from('words').select('id, english, korean, box, wrong_count')
      .eq('student_id', studentId).eq('status', 'approved')

    if (!words?.length) {
      return json({ error: '승인된 단어가 없습니다. 단어를 추가하고 선생님 승인을 받으세요.' }, 400)
    }

    const { required: reqW, optional: optW } = pickTargetWords(words, Math.min(3, words.length), Math.min(2, Math.max(0, words.length - 3)))
    const allTarget = [...reqW, ...optW]

    const vocabCtx = allTarget.map(w => `${w.english}(${w.korean})`).join(', ')

    const prompt = fill(GENERATE_TEMPLATE, {
      school_level: schoolLevel,
      type_label: typeInfo.label,
      vocab_context: vocabCtx,
      expected_length: typeInfo.length,
      type_guide: typeInfo.guide,
      problem_type: typeKey,
    })

    const { text: raw, status: geminiStatus } = await callGemini(prompt, GEMINI_KEY)
    if (geminiStatus === 429) return json({ error: 'AI 사용량이 초과되었습니다. 내일 다시 시도해주세요.' }, 429)
    if (geminiStatus !== 200) return json({ error: 'AI 서비스 오류입니다. 잠시 후 다시 시도해주세요.' }, 500)
    const problem = parseObj(raw)
    if (!problem?.instruction) return json({ error: '문제 생성 실패. 다시 시도해주세요.' }, 500)

    const { data: session, error: se } = await supabase
      .from('writing_sessions')
      .insert({
        student_id: studentId,
        problem_type: typeKey,
        problem,
        target_words: allTarget.map(w => ({ id: w.id, english: w.english, korean: w.korean })),
      })
      .select('id').single()
    if (se) return json({ error: se.message }, 500)

    return json({
      sessionId: (session as Record<string, unknown>).id,
      problem,
      targetWords: allTarget.map(w => ({ id: w.id, english: w.english, korean: w.korean })),
    })
  }

  // ══════════════════════════════════════════════════════════
  // grade: 채점
  // ══════════════════════════════════════════════════════════
  if (action === 'grade') {
    const { sessionId, studentAnswer } = body as Record<string, string>
    if (!sessionId) return json({ error: 'sessionId 필요' }, 400)
    if (!studentAnswer?.trim()) return json({ error: '답안을 입력해주세요' }, 400)

    const { data: session } = await supabase
      .from('writing_sessions').select('*').eq('id', sessionId).single()
    if (!session) return json({ error: '세션 없음' }, 404)

    // 세션 소유권 검증: 요청한 studentId와 세션의 student_id가 일치해야 함
    const sess = session as Record<string, unknown>
    if (sess.student_id !== studentId) return json({ error: '권한 없음' }, 403)
    const problem = sess.problem as Record<string, unknown>
    const targetWords = sess.target_words as { id: string; english: string; korean: string }[]

    const vocabHints = targetWords.map(w => `${w.english}(${w.korean})`).join(', ')
    const wordUsageTpl = '{' + targetWords.map(w => `"${w.english}":true`).join(',') + '}'
    const promptSection = problem.prompt ? `지문: ${problem.prompt}\n` : ''
    const conditions = Array.isArray(problem.conditions)
      ? (problem.conditions as string[]).map((c, i) => `${i + 1}. ${c}`).join('\n')
      : String(problem.conditions ?? '')

    const prompt = fill(GRADE_TEMPLATE, {
      school_level: schoolLevel,
      problem_instruction: String(problem.instruction ?? ''),
      prompt_section: promptSection,
      conditions,
      student_answer: studentAnswer.trim(),
      vocab_hints: vocabHints,
      word_usage_tpl: wordUsageTpl,
    })

    const { text: raw, status: geminiStatus2 } = await callGemini(prompt, GEMINI_KEY)
    if (geminiStatus2 === 429) return json({ error: 'AI 사용량이 초과되었습니다. 내일 다시 시도해주세요.' }, 429)
    if (geminiStatus2 !== 200) return json({ error: 'AI 서비스 오류입니다. 잠시 후 다시 시도해주세요.' }, 500)
    const grade = parseObj(raw)
    if (grade?.total === undefined) return json({ error: '채점 실패. 다시 시도해주세요.' }, 500)

    // 사용된 단어 → box +1
    const wordUsage = (grade.word_usage ?? {}) as Record<string, boolean>
    const wordUpdates: { id: string; english: string; used: boolean; newBox?: number }[] = []

    await Promise.all(targetWords.map(async (w) => {
      const used = wordUsage[w.english] === true
      wordUpdates.push({ id: w.id, english: w.english, used })
      if (!used) return
      const { data: wd } = await supabase.from('words').select('box').eq('id', w.id).single()
      if (!wd) return
      const newBox = Math.min((wd as Record<string, number>).box + 1, 5)
      await supabase.from('words').update({ box: newBox }).eq('id', w.id)
      const entry = wordUpdates.find(e => e.id === w.id)
      if (entry) entry.newBox = newBox
    }))

    await supabase.from('writing_sessions')
      .update({ student_answer: studentAnswer.trim(), grade })
      .eq('id', sessionId)

    return json({ grade, wordUpdates })
  }

  // ══════════════════════════════════════════════════════════
  // history: 최근 연습 기록
  // ══════════════════════════════════════════════════════════
  if (action === 'history') {
    const { data } = await supabase
      .from('writing_sessions')
      .select('id, problem_type, grade, created_at')
      .eq('student_id', studentId)
      .not('grade', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10)
    return json(data ?? [])
  }

  return json({ error: '알 수 없는 action' }, 400)
})
