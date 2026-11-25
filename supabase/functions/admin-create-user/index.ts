import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response({ error: 'Método não permitido.' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return response({ error: 'Não autenticado.' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return response({ error: 'Serviço de provisionamento não configurado.' }, 500)
  }

  const token = authorization.slice('Bearer '.length)
  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: callerData, error: callerError } = await callerClient.auth.getUser(token)

  if (callerError || !callerData.user) return response({ error: 'Sessão inválida.' }, 401)
  if (callerData.user.app_metadata?.role !== 'ADMINISTRADOR') {
    return response({ error: 'Somente Administradores podem cadastrar funcionários.' }, 403)
  }

  let payload: { email?: string; password?: string }
  try {
    payload = await request.json()
  } catch {
    return response({ error: 'Corpo da requisição inválido.' }, 400)
  }

  const email = String(payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '')
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || !password) {
    return response({ error: 'Informe e-mail válido e senha inicial.' }, 400)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'FUNCIONARIO' },
  })

  if (error) return response({ error: 'Não foi possível criar a conta. Verifique os dados informados.' }, 400)
  return response({ id: data.user.id, email: data.user.email })
})
