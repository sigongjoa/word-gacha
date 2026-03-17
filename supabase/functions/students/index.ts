import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, json, unauthorized } from '../_shared/auth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/textbooks`

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    SUPABASE_URL,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const url = new URL(req.url)
  const rest = url.pathname.match(/\/students(.*)/)?.[1] ?? ''
  const parts = rest.split('/').filter(Boolean)
  const id = parts[0]
  const sub = parts[1] // e.g. "textbook"

  // GET /students — public
  if (req.method === 'GET' && !id) {
    const { data, error } = await supabase.from('students').select('*').order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // GET /students/:id/textbook — 학생 교재 자동 조회
  if (req.method === 'GET' && id && sub === 'textbook') {
    const { data: student, error } = await supabase.from('students').select('*').eq('id', id).single()
    if (error) return json({ error: '학생을 찾을 수 없습니다' }, 404)
    if (!student.school || !student.grade) {
      return json({ textbook_id: null, message: '학교/학년이 설정되지 않았습니다' })
    }
    try {
      const schoolsRes = await fetch(`${STORAGE_BASE}/schools.json`)
      const schoolsData = await schoolsRes.json()
      const schoolInfo = schoolsData.schools[student.school]
      if (!schoolInfo) return json({ textbook_id: null, message: '등록되지 않은 학교입니다' })
      const gradeData = schoolInfo.textbooks[String(student.grade)]
      if (!gradeData) return json({ textbook_id: null, message: '해당 학년 교재가 없습니다' })
      const month = new Date().getMonth() + 1
      const semester = (month >= 3 && month <= 8) ? 'semester1' : 'semester2'
      const textbookId = gradeData[semester]
      if (!textbookId) return json({ textbook_id: null, message: '해당 학기 교재가 없습니다' })
      const tbRes = await fetch(`${STORAGE_BASE}/${textbookId}.json`)
      if (!tbRes.ok) return json({ textbook_id: textbookId, message: '교재 데이터 준비 중입니다' })
      const tbData = await tbRes.json()
      return json({
        textbook_id: textbookId,
        textbook_info: tbData.textbook_info,
        lesson_info: tbData.lesson_info,
        stats: tbData.stats,
        school: schoolInfo.name,
        grade: student.grade,
        semester,
      })
    } catch {
      return json({ error: '교재 정보를 불러올 수 없습니다' }, 500)
    }
  }

  // GET /students/:id — public
  if (req.method === 'GET' && id) {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single()
    if (error) return json({ error: '학생을 찾을 수 없습니다' }, 404)
    return json(data)
  }

  // POST /students — admin only
  if (req.method === 'POST') {
    if (!await verifyAdmin(req)) return unauthorized()
    const body = await req.json()
    const { name, school, grade } = body
    if (!name?.trim()) return json({ error: '이름을 입력하세요' }, 400)
    const { data, error } = await supabase
      .from('students')
      .insert({ name: name.trim(), school: school || null, grade: grade ? Number(grade) : null })
      .select().single()
    if (error) return json({ error: '이미 존재하는 이름이거나 오류가 발생했습니다' }, 500)
    return json(data)
  }

  // PATCH /students/:id — admin only
  if (req.method === 'PATCH' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const body = await req.json()
    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) {
      if (!body.name?.trim()) return json({ error: '이름을 입력하세요' }, 400)
      updates.name = body.name.trim()
    }
    if (body.school !== undefined) updates.school = body.school || null
    if (body.grade !== undefined) updates.grade = body.grade ? Number(body.grade) : null
    const { data, error } = await supabase
      .from('students').update(updates).eq('id', id).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // DELETE /students/:id — admin only
  if (req.method === 'DELETE' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  return json({ error: 'Not found' }, 404)
})
