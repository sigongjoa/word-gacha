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
  const rest = url.pathname.match(/\/grammar(.*)/)?.[1] ?? ''
  const id = rest.split('/').filter(Boolean)[0]

  // GET /grammar — public
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('grammar_qa').select('*').order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // POST /grammar — admin only
  if (req.method === 'POST') {
    if (!await verifyAdmin(req)) return unauthorized()
    const { question, answer, include_in_print } = await req.json()
    if (!question?.trim()) return json({ error: '질문을 입력하세요' }, 400)
    if (!answer?.trim()) return json({ error: '답변을 입력하세요' }, 400)
    const { data, error } = await supabase.from('grammar_qa').insert({
      question: question.trim(),
      answer: answer.trim(),
      include_in_print: include_in_print !== false,
    }).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // PATCH /grammar/:id — admin only
  if (req.method === 'PATCH' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const body = await req.json()
    const allowed = ['question', 'answer', 'include_in_print']
    const updates: Record<string, unknown> = {}
    allowed.forEach((k) => { if (body[k] !== undefined) updates[k] = body[k] })
    const { data, error } = await supabase
      .from('grammar_qa').update(updates).eq('id', id).select().single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // DELETE /grammar/:id — admin only
  if (req.method === 'DELETE' && id) {
    if (!await verifyAdmin(req)) return unauthorized()
    const { error } = await supabase.from('grammar_qa').delete().eq('id', id)
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  return json({ error: 'Not found' }, 404)
})
