import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, json, unauthorized } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const url = new URL(req.url)
  const rest = url.pathname.match(/\/words(.*)/)?.[1] ?? ''
  const parts = rest.split('/').filter(Boolean)
  const wordId = parts[0]
  const subaction = parts[1] // 'review'
  const studentId = url.searchParams.get('student_id')
  const status = url.searchParams.get('status')
  const isAdmin = await verifyAdmin(req)

  // GET /words?student_id=X — public: get student's words
  if (req.method === 'GET' && !wordId && studentId) {
    const { data, error } = await supabase
      .from('words').select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // GET /words — admin only: all words
  if (req.method === 'GET' && !wordId) {
    if (!isAdmin) return unauthorized()
    let q = supabase.from('words').select('*, students(name)').order('created_at', { ascending: false })
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // POST /words — public: add word (status set server-side by auth level)
  if (req.method === 'POST' && !wordId) {
    const { student_id, english, korean, blank_type } = await req.json()
    if (!english?.trim()) return json({ error: '영어 단어를 입력하세요' }, 400)
    if (!korean?.trim()) return json({ error: '한국어 뜻을 입력하세요' }, 400)
    const { data, error } = await supabase.from('words').insert({
      student_id,
      english: english.trim(),
      korean: korean.trim(),
      blank_type: blank_type || 'korean',
      status: isAdmin ? 'approved' : 'pending',
      added_by: isAdmin ? 'teacher' : 'student',
    }).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // PATCH /words/:id — admin only
  if (req.method === 'PATCH' && wordId) {
    if (!isAdmin) return unauthorized()
    const body = await req.json()
    const allowed = ['english', 'korean', 'blank_type', 'status', 'box']
    const updates: Record<string, unknown> = {}
    allowed.forEach((k) => { if (body[k] !== undefined) updates[k] = body[k] })
    const { data, error } = await supabase
      .from('words').update(updates).eq('id', wordId).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // POST /words/:id/review — admin only
  if (req.method === 'POST' && wordId && subaction === 'review') {
    if (!isAdmin) return unauthorized()
    const { correct } = await req.json()
    const { data: w, error: e } = await supabase
      .from('words').select('box,review_count,wrong_count').eq('id', wordId).single()
    if (e) return json({ error: '단어를 찾을 수 없습니다' }, 404)
    const upd = {
      box: correct ? Math.min(w.box + 1, 5) : 1,
      review_count: w.review_count + 1,
      wrong_count: correct ? w.wrong_count : w.wrong_count + 1,
    }
    const { data, error } = await supabase
      .from('words').update(upd).eq('id', wordId).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // DELETE /words/:id — admin only
  if (req.method === 'DELETE' && wordId) {
    if (!isAdmin) return unauthorized()
    const { error } = await supabase.from('words').delete().eq('id', wordId)
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  return json({ error: 'Not found' }, 404)
})
