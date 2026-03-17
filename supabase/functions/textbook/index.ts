import { getCorsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/textbooks`

async function fetchJson(filename: string) {
  const res = await fetch(`${STORAGE_BASE}/${filename}`)
  if (!res.ok) throw new Error(`교재 데이터를 찾을 수 없습니다: ${filename}`)
  return res.json()
}

function jsonRes(data: unknown, status = 200, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  // pathname: /textbook/:textbookId/words  or  /textbook/:textbookId/grammar
  const match = url.pathname.match(/\/textbook\/([^/]+)\/(words|grammar)/)

  if (!match) {
    return jsonRes({ error: '잘못된 경로입니다' }, 400, corsHeaders)
  }

  const [, textbookId, type] = match
  const unit = url.searchParams.get('unit') ? Number(url.searchParams.get('unit')) : null

  // textbookId 유효성 체크 (path traversal 방지)
  if (!/^[a-z0-9_]+$/.test(textbookId)) {
    return jsonRes({ error: '잘못된 교재 ID입니다' }, 400, corsHeaders)
  }

  try {
    const data = await fetchJson(`${textbookId}.json`)

    if (type === 'words') {
      let words = data.textbook_words ?? []
      if (unit) words = words.filter((w: { unit: number }) => w.unit === unit)
      return jsonRes({
        textbook_info: data.textbook_info,
        lesson_info: data.lesson_info,
        words,
        stats: data.stats,
      }, 200, corsHeaders)
    }

    if (type === 'grammar') {
      let grammar = data.textbook_grammar ?? []
      if (unit) grammar = grammar.filter((g: { unit: number }) => g.unit === unit)
      return jsonRes({
        textbook_info: data.textbook_info,
        lesson_info: data.lesson_info,
        grammar,
        stats: data.stats,
      }, 200, corsHeaders)
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return jsonRes({ error: msg }, 404, corsHeaders)
  }

  return jsonRes({ error: '잘못된 요청입니다' }, 400, corsHeaders)
})
