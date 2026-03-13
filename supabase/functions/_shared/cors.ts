const ALLOWED_ORIGINS = [
  'https://sigongjoa.github.io',
  'http://localhost:3002',
  'http://localhost:3000',
]

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Vary': 'Origin',
  }
}

// 하위 호환용 (기존 코드에서 corsHeaders를 직접 쓰는 경우)
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sigongjoa.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Vary': 'Origin',
}
