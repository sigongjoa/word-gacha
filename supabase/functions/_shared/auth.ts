import { corsHeaders } from './cors.ts'

async function getAdminToken(): Promise<string> {
  const secret = Deno.env.get('SESSION_SECRET') ?? 'word-gacha-secret'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('admin-token'))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export { getAdminToken }

export async function verifyAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const expected = await getAdminToken()
  return token === expected
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function unauthorized(): Response {
  return json({ error: '관리자 로그인이 필요합니다' }, 401)
}
