import { getCorsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/textbooks`

function jsonRes(data: unknown, status = 200, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const res = await fetch(`${STORAGE_BASE}/schools.json`)
    if (!res.ok) throw new Error('학교 데이터를 불러올 수 없습니다')
    const data = await res.json()
    return jsonRes(data, 200, corsHeaders)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return jsonRes({ error: msg }, 500, corsHeaders)
  }
})
