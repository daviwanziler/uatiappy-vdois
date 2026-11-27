import { supabase, isSupabaseConfigured } from './supabase.js'
import { renderMessaging } from './messaging.js'
import { validateAdminProvisionInput, validateLoginInput } from './validation.js'

const root = document.querySelector('#app')
let session = null
let loading = true
let authSubscription = null

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function message(text, type = 'error') {
  return text ? `<p class="message message-${type}" role="${type === 'error' ? 'alert' : 'status'}">${escapeHtml(text)}</p>` : ''
}
function shell(content, className = 'dashboard-shell') {
  root.innerHTML = `<main class="${className}">${content}</main>`
}
function header(section, email = '') {
  return `<header class="dashboard-header"><div><p class="eyebrow">${section}</p><h1>UatiAppy</h1><p class="header-email">${escapeHtml(email)}</p></div><button class="secondary-button" id="logout" type="button">Sair</button></header>`
}
function bindLogout() {
  document.querySelector('#logout')?.addEventListener('click', async event => {
    const button = event.currentTarget
    button.disabled = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) showLogoutError('Não foi possível encerrar sua sessão. Tente novamente.')
    } catch {
      showLogoutError('Não foi possível encerrar sua sessão. Tente novamente.')
    } finally {
      if (button.isConnected) button.disabled = false
    }
  })
}
function showLogoutError(text) {
  const host = document.querySelector('[data-feedback]')
  if (host) host.innerHTML = message(text)
}
function renderLoading() {
  shell('<section class="auth-card"><p role="status">Verificando sessão…</p></section>', 'auth-shell')
}
function renderLogin(error = '', warning = '') {
  shell(`<section class="auth-card" aria-labelledby="login-title">
    <span class="brand-mark" aria-hidden="true">U</span>
    <p class="eyebrow">Comunicação institucional</p>
    <h1 id="login-title">Entrar no UatiAppy</h1>
    <p class="auth-description">Acesse com as credenciais fornecidas pela administração.</p>
    ${message(warning, 'warning')}${message(error)}
    <form id="login-form">
      <label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="username" required>
      <label for="password">Senha</label><input id="password" name="password" type="password" autocomplete="current-password" required>
      <button class="primary-button" type="submit" ${!isSupabaseConfigured ? 'disabled' : ''}>Entrar</button>
    </form>
    <p class="auth-footnote">Não existe autocadastro. Solicite seu acesso à administração.</p>
  </section>`, 'auth-shell')
  if (!isSupabaseConfigured) {
    const form = document.querySelector('#login-form')
    form.insertAdjacentHTML('beforebegin', message('Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no ambiente de build.', 'warning'))
  }
  document.querySelector('#login-form')?.addEventListener('submit', async event => {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const validation = validateLoginInput(values)
    if (validation) return renderLogin(validation)
    const button = form.querySelector('button')
    button.disabled = true
    button.textContent = 'Entrando…'
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(), password: values.password,
      })
      if (signInError) renderLogin('Não foi possível entrar. Verifique suas credenciais e tente novamente.')
    } catch {
      renderLogin('Serviço indisponível no momento. Tente novamente.')
    }
  })
}
function renderUnauthorized() {
  shell(`<section class="auth-card"><h1>Acesso não autorizado</h1>
    <p class="auth-description">Seu perfil não possui permissão. Procure a administração.</p>
    <div data-feedback></div><button class="secondary-button" id="logout" type="button">Sair</button>
  </section>`, 'auth-shell')
  bindLogout()
}
async function createEmployee({ email, password }) {
  return supabase.functions.invoke('admin-create-user', {
    body: { email: email.trim().toLowerCase(), password },
  })
}
async function setAccountStatus(userId, status) {
  if (!['ACTIVE', 'BLOCKED', 'DISABLED'].includes(status)) throw new Error('Status inválido.')
  return supabase.functions.invoke('admin-set-account-status', { body: { userId, status } })
}
async function loadEmployees() {
  const { data, error } = await supabase.from('employee_profiles')
    .select('user_id, email, account_status')
    .eq('role', 'FUNCIONARIO').order('email')
  if (error) throw error
  return data ?? []
}
function employeeRows(employees) {
  if (!employees.length) return '<p>Nenhum funcionário cadastrado.</p>'
  const labels = { ACTIVE: 'Ativo', BLOCKED: 'Bloqueado', DISABLED: 'Desativado' }
  return `<ul class="employee-list">${employees.map(employee => `<li class="employee-row">
    <div><strong>${escapeHtml(employee.email)}</strong><span class="employee-status">${labels[employee.account_status] ?? escapeHtml(employee.account_status)}</span></div>
    <div class="employee-actions">${employee.account_status === 'ACTIVE'
      ? `<button class="secondary-button" data-user="${escapeHtml(employee.user_id)}" data-status="BLOCKED">Bloquear</button><button class="secondary-button" data-user="${escapeHtml(employee.user_id)}" data-status="DISABLED">Desativar</button>`
      : `<button class="secondary-button" data-user="${escapeHtml(employee.user_id)}" data-status="ACTIVE">Reativar</button>`}</div>
  </li>`).join('')}</ul>`
}
async function renderAdmin() {
  shell(`${header('Área administrativa', session.user.email)}
    <div data-feedback></div>
    <section class="auth-card admin-card"><h2>Cadastrar funcionário</h2>
      <p class="auth-description">Crie uma conta. A senha deve ter de 12 a 128 caracteres, com maiúscula, minúscula, número e símbolo.</p>
      <form id="create-form">
        <label for="employee-email">E-mail de acesso</label><input id="employee-email" name="email" type="email" autocomplete="off" required>
        <label for="initial-password">Senha inicial</label><input id="initial-password" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required>
        <label for="confirm-password">Confirmar senha</label><input id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required>
        <div id="create-feedback" aria-live="polite"></div>
        <button class="primary-button" type="submit">Criar conta</button>
      </form>
    </section>
    <section class="auth-card admin-card accounts-card">
      <div class="section-heading"><div><h2>Contas de funcionários</h2><p class="auth-description">Bloqueie temporariamente ou desative o acesso.</p></div><button id="refresh" class="secondary-button" type="button">Atualizar</button></div>
      <div id="employee-list" aria-live="polite"><p>Carregando contas…</p></div>
    </section>`)
  bindLogout()
  const createForm = document.querySelector('#create-form')
  createForm.addEventListener('submit', async event => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(createForm))
    const validation = validateAdminProvisionInput(values)
    const feedback = document.querySelector('#create-feedback')
    if (validation) { feedback.innerHTML = message(validation); return }
    const button = createForm.querySelector('button')
    button.disabled = true
    button.textContent = 'Criando…'
    feedback.innerHTML = ''
    try {
      const { data, error } = await createEmployee(values)
      if (error) throw error
      if (data?.auditStatus === 'PENDING_RECONCILIATION') {
        feedback.innerHTML = message('A conta foi criada, mas a auditoria está sendo reconciliada. Não tente cadastrar novamente.', 'warning')
      } else {
        feedback.innerHTML = message(data?.recovered
          ? 'A conta já existia e a auditoria foi reconciliada. Nenhuma conta duplicada foi criada.'
          : `Conta criada para ${escapeHtml(data?.email ?? values.email)}. Entregue as credenciais por um canal seguro.`, 'success')
      }
      createForm.reset()
    } catch (error) {
      feedback.innerHTML = message(error?.message || 'Não foi possível criar a conta.')
    } finally {
      button.disabled = false
      button.textContent = 'Criar conta'
    }
  })
  async function refresh() {
    const target = document.querySelector('#employee-list')
    target.innerHTML = '<p>Carregando contas…</p>'
    try {
      target.innerHTML = employeeRows(await loadEmployees())
      target.querySelectorAll('[data-user][data-status]').forEach(button => {
        button.addEventListener('click', async () => {
          button.disabled = true
          try {
            const { error } = await setAccountStatus(button.dataset.user, button.dataset.status)
            if (error) throw error
            document.querySelector('[data-feedback]').innerHTML = message('Status da conta atualizado.', 'success')
            await refresh()
          } catch (error) {
            document.querySelector('[data-feedback]').innerHTML = message(error?.message || 'Não foi possível alterar o status da conta.')
            button.disabled = false
          }
        })
      })
    } catch {
      target.innerHTML = message('Não foi possível carregar os funcionários. Verifique as permissões e a conexão.')
    }
  }
  document.querySelector('#refresh').addEventListener('click', refresh)
  await refresh()
}
function renderEmployee() {
  return renderMessaging(root, session.user, supabase)
}
async function render() {
  if (loading) return renderLoading()
  if (!isSupabaseConfigured || !session?.user) return renderLogin()
  const role = session.user.app_metadata?.role
  if (role === 'ADMINISTRADOR') return renderAdmin()
  if (role === 'FUNCIONARIO') return renderEmployee()
  return renderUnauthorized()
}

if (!isSupabaseConfigured) {
  loading = false
  render()
} else {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
    session = nextSession
    loading = false
    queueMicrotask(() => render())
  })
  authSubscription = subscription
  try {
    const { data, error } = await supabase.auth.getSession()
    session = error ? null : data.session
  } catch {
    session = null
  } finally {
    loading = false
    await render()
  }
}
window.addEventListener('pagehide', () => authSubscription?.unsubscribe(), { once: true })
