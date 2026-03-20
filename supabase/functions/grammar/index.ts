import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, json, unauthorized } from '../_shared/auth.ts'

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
      }),
    }
  )
  const data = await res.json()
  const parts: { text?: string; thought?: boolean }[] =
    data.candidates?.[0]?.content?.parts ?? []
  const textPart = parts.find((p) => !p.thought) ?? parts[parts.length - 1]
  return textPart?.text?.trim() ?? '답변 생성 실패'
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const url  = new URL(req.url)
  const rest = url.pathname.match(/\/grammar(.*)/)?.[1] ?? ''
  const parts = rest.split('/').filter(Boolean)
  const id    = parts[0]
  const sub   = parts[1] // e.g. "ai-answer"

  // ── GET /grammar ─────────────────────────────────────────── (공개)
  if (req.method === 'GET' && !id) {
    const { data, error } = await supabase
      .from('grammar_qa').select('*').order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // ── POST /grammar/:id/ai-answer ──────────────────────────── (관리자)
  if (req.method === 'POST' && id && sub === 'ai-answer') {
    if (!await verifyAdmin(req)) return unauthorized()
    const { data: g, error: ge } = await supabase
      .from('grammar_qa').select('question').eq('id', id).single()
    if (ge || !g) return json({ error: '항목을 찾을 수 없습니다' }, 404)

    const answer = await callGemini(
      `다음 영어 문법 질문에 한국어로 간결하고 명확하게 답변해주세요.\n\n질문: ${g.question}\n\n답변:`
    )
    const { data, error } = await supabase
      .from('grammar_qa')
      .update({ answer, status: 'answered', answered_by: 'ai' })
      .eq('id', id).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // ── POST /grammar ────────────────────────────────────────────
  if (req.method === 'POST' && !id) {
    const body = await req.json()
    const isAdmin = await verifyAdmin(req)

    // 선생님: 질문 + 답변 동시 등록
    if (isAdmin) {
      const { question, answer, include_in_print } = body
      if (!question?.trim()) return json({ error: '질문을 입력하세요' }, 400)
      if (!answer?.trim())   return json({ error: '답변을 입력하세요' }, 400)
      const { data, error } = await supabase.from('grammar_qa').insert({
        question: question.trim(),
        answer:   answer.trim(),
        include_in_print: include_in_print !== false,
        status:      'answered',
        answered_by: 'teacher',
      }).select().single()
      if (error) return json({ error: error.message }, 500)
      return json(data)
    }

    // 학생: 질문만 등록 (student_id 필수)
    const { student_id, student_name, question } = body
    if (!student_id)      return json({ error: 'student_id가 필요합니다' }, 400)
    if (!question?.trim()) return json({ error: '질문을 입력하세요' }, 400)

    // student 존재 확인
    const { error: se } = await supabase
      .from('students').select('id').eq('id', student_id).single()
    if (se) return json({ error: '학생을 찾을 수 없습니다' }, 404)

    const { data, error } = await supabase.from('grammar_qa').insert({
      question:     question.trim(),
      answer:       null,
      include_in_print: false,
      student_id,
      student_name: student_name ?? null,
      status:       'pending',
      answered_by:  null,
    }).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // ── PATCH /grammar/:id ───────────────────────────────────── (관리자)
  if (req.method === 'PATCH' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const body = await req.json()
    const allowed = ['question', 'answer', 'include_in_print', 'status', 'answered_by']
    const updates: Record<string, unknown> = {}
    allowed.forEach((k) => { if (body[k] !== undefined) updates[k] = body[k] })
    const { data, error } = await supabase
      .from('grammar_qa').update(updates).eq('id', id).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // ── DELETE /grammar/:id ────────────────── (관리자 전용)
  // 학생 ID를 요청에서 그대로 신뢰하면 IDOR가 발생하므로 관리자만 삭제 가능
  if (req.method === 'DELETE' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const { error } = await supabase.from('grammar_qa').delete().eq('id', id)
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  return json({ error: 'Not found' }, 404)
})
