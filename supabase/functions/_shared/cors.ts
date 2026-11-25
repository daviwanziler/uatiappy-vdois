const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

export function corsHeadersFor(request: Request) {
  const origin = request.headers.get('Origin')
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const allowedOrigins = configured.length ? configured : DEFAULT_DEV_ORIGINS
  const allowed = !origin || allowedOrigins.includes(origin)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
  if (origin && allowed) headers['Access-Control-Allow-Origin'] = origin
  return { headers, allowed }
}
