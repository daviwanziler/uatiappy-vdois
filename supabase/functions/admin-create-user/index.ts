import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Não autenticado.' }, 401)

  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !anonKey || !serviceRoleKey) return json({ error: 'Serviço não configurado.' }, 500)

  const token = authorization.slice(7)
  const callerClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: caller, error: authError } = await callerClient.auth.getUser(token)
  if (authError || !caller.user) return json({ error: 'Sessão inválida.' }, 401)
  if (caller.user.app_metadata?.role !== 'ADMINISTRADOR') {
    return json({ error: 'Somente Administradores podem cadastrar funcionários.' }, 403)
  }

  let payload: { email?: string; password?: string }
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Requisição inválida.' }, 400)
  }

  const email = String(payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return json({ error: 'Informe e-mail válido e senha com pelo menos 8 caracteres.' }, 400)
  }

  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'FUNCIONARIO' },
  })

  if (error) return json({ error: 'Não foi possível criar a conta. Verifique se o e-mail já está em uso.' }, 400)
  return json({ id: data.user.id, email: data.user.email })
})
