import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, json, unauthorized } from '../_shared/auth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/textbooks`

// ── PIN 해싱 (SHA-256 + SESSION_SECRET pepper) ─────────────────
async function hashPin(studentId: string, pin: string): Promise<string> {
  const secret = Deno.env.get('SESSION_SECRET') ?? ''
  const msg = `word-gacha-pin:${studentId}:${pin}:${secret}`
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── 클라이언트 반환용: pin_hash 제거, has_pin 추가 ──────────────
function maskPin(s: Record<string, unknown>) {
  const { pin_hash, ...rest } = s
  return { ...rest, has_pin: !!pin_hash }
}

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
  const sub = parts[1] // e.g. "textbook", "verify-pin"

  // GET /students — public (pin_hash 제외, has_pin만 반환)
  if (req.method === 'GET' && !id) {
    const { data, error } = await supabase.from('students').select('*').order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json((data as Record<string, unknown>[]).map(maskPin))
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

  // POST /students/:id/verify-pin — public (PIN 검증)
  if (req.method === 'POST' && id && sub === 'verify-pin') {
    const body = await req.json()
    const pin = String(body.pin ?? '')
    if (!/^\d{4}$/.test(pin)) return json({ error: 'PIN은 4자리 숫자여야 합니다' }, 400)

    const { data: student, error } = await supabase
      .from('students').select('pin_hash').eq('id', id).single()
    if (error || !student) return json({ error: '학생을 찾을 수 없습니다' }, 404)

    // PIN 미설정 학생 → 바로 통과
    if (!student.pin_hash) return json({ valid: true, noPinSet: true })

    const hash = await hashPin(id, pin)
    return json({ valid: hash === student.pin_hash })
  }

  // GET /students/:id — public (pin_hash 제외)
  if (req.method === 'GET' && id) {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single()
    if (error) return json({ error: '학생을 찾을 수 없습니다' }, 404)
    return json(maskPin(data as Record<string, unknown>))
  }

  // POST /students — admin only
  if (req.method === 'POST' && !id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const body = await req.json()
    const { name, school, grade } = body
    if (!name?.trim()) return json({ error: '이름을 입력하세요' }, 400)
    const { data, error } = await supabase
      .from('students')
      .insert({ name: name.trim(), school: school || null, grade: grade ? Number(grade) : null })
      .select().single()
    if (error) return json({ error: '이미 존재하는 이름이거나 오류가 발생했습니다' }, 500)
    return json(maskPin(data as Record<string, unknown>))
  }

  // PATCH /students/:id — admin only (pin 설정/초기화 포함)
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
    // PIN 설정: pin = "1234" → 해시 저장 / pin = "" → 초기화(null)
    if (body.pin !== undefined) {
      if (body.pin === '') {
        updates.pin_hash = null
      } else {
        if (!/^\d{4}$/.test(String(body.pin))) return json({ error: 'PIN은 4자리 숫자여야 합니다' }, 400)
        updates.pin_hash = await hashPin(id, String(body.pin))
      }
    }
    const { data, error } = await supabase
      .from('students').update(updates).eq('id', id).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(maskPin(data as Record<string, unknown>))
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
