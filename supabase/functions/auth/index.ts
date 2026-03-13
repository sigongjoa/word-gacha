import { getCorsHeaders } from '../_shared/cors.ts'
import { getAdminToken, json } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const path = url.pathname.match(/\/auth(.*)/)?.[1] ?? ''

  if (req.method === 'POST' && path === '/login') {
    const { password } = await req.json()
    const adminPw = Deno.env.get('ADMIN_PASSWORD') ?? 'admin1234'
    if (password !== adminPw) return json({ error: '비밀번호가 틀렸습니다' }, 401)
    const token = await getAdminToken()
    return json({ success: true, token })
  }

  if (req.method === 'POST' && path === '/logout') {
    return json({ success: true })
  }

  if (req.method === 'GET' && path === '/check') {
    const auth = req.headers.get('authorization') ?? ''
    if (!auth.startsWith('Bearer ')) return json({ isAdmin: false })
    const token = auth.slice(7)
    const expected = await getAdminToken()
    return json({ isAdmin: token === expected })
  }

  return json({ error: 'Not found' }, 404)
})
