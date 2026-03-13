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
  const rest = url.pathname.match(/\/students(.*)/)?.[1] ?? ''
  const parts = rest.split('/').filter(Boolean)
  const id = parts[0]

  // GET /students — public
  if (req.method === 'GET' && !id) {
    const { data, error } = await supabase.from('students').select('*').order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json(data)
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
    const { name } = await req.json()
    if (!name?.trim()) return json({ error: '이름을 입력하세요' }, 400)
    const { data, error } = await supabase
      .from('students').insert({ name: name.trim() }).select().single()
    if (error) return json({ error: '이미 존재하는 이름이거나 오류가 발생했습니다' }, 500)
    return json(data)
  }

  // PATCH /students/:id — admin only
  if (req.method === 'PATCH' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const { name } = await req.json()
    if (!name?.trim()) return json({ error: '이름을 입력하세요' }, 400)
    const { data, error } = await supabase
      .from('students').update({ name: name.trim() }).eq('id', id).select().single()
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
