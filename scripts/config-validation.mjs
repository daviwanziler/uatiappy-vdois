export function validatePublicSupabaseConfig(urlValue, keyValue) {
  const url = String(urlValue ?? '').trim()
  const key = String(keyValue ?? '').trim()
  if (Boolean(url) !== Boolean(key)) {
    throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY juntas.')
  }
  if (!url && !key) return { supabaseUrl: '', supabaseAnonKey: '' }

  let parsed
  try { parsed = new URL(url) } catch { throw new Error('SUPABASE_URL inválida.') }
  const localHttp = parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
  if (parsed.protocol !== 'https:' && !localHttp) {
    throw new Error('SUPABASE_URL deve usar HTTPS; HTTP só é permitido em localhost.')
  }
  if (parsed.username || parsed.password) throw new Error('SUPABASE_URL não pode conter credenciais.')

  if (/^sb_secret_/i.test(key)) throw new Error('Uma chave secreta não pode ser usada no frontend.')
  const segments = key.split('.')
  if (segments.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8'))
      if (['service_role', 'supabase_admin'].includes(payload.role)) {
        throw new Error('Uma chave privilegiada não pode ser usada no frontend.')
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Chaves publicáveis não-JWT são aceitas; JWT malformado não concede privilégios.
      } else {
        throw error
      }
    }
  }
  return { supabaseUrl: parsed.href.replace(/\/$/, ''), supabaseAnonKey: key }
}
