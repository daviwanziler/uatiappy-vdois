export function corsHeadersFor(request: Request) {
  const origin = request.headers.get('Origin')
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  // Fail closed in hosted environments. Local origins are implicit only when
  // the Supabase project URL itself points to localhost.
  let localDevelopment = false
  try {
    const host = new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname
    localDevelopment = host === 'localhost' || host === '127.0.0.1'
  } catch {
    localDevelopment = false
  }
  const allowedOrigins = configured.length
    ? configured
    : localDevelopment ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []
  const allowed = !origin || allowedOrigins.includes(origin)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
  if (origin && allowed) headers['Access-Control-Allow-Origin'] = origin
  return { headers, allowed }
}
