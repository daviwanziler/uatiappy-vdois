const PAGE_SIZE = 30
const MAX_MESSAGE_LENGTH = 10000

export function isValidMessageBody(value) {
  const body = String(value ?? '').trim()
  return body.length > 0 && body.length <= MAX_MESSAGE_LENGTH
}

export function mergeMessages(existing, incoming) {
  const byId = new Map()
  for (const item of [...existing, ...incoming]) {
    if (item?.id) byId.set(item.id, item)
  }
  return [...byId.values()].sort((a, b) => {
    const time = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return time || String(a.id).localeCompare(String(b.id))
  })
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function formatPreview(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 72 ? `${text.slice(0, 69)}…` : text || 'Nenhuma mensagem ainda'
}

function renderMessage(item, currentUserId) {
  const own = item.sender_id === currentUserId
  return `<article class="chat-message ${own ? 'is-own' : 'is-other'}" data-message-id="${escapeHtml(item.id)}">
    <p>${escapeHtml(item.body)}</p>
    <time datetime="${escapeHtml(item.created_at)}">${escapeHtml(formatTime(item.created_at))}</time>
  </article>`
}

export async function renderMessaging(root, user, supabase) {
  root.innerHTML = `<main class="messaging-shell">
    <header class="messaging-header">
      <div><p class="eyebrow">Área do funcionário</p><h1>UatiAppy</h1><p class="header-email">${escapeHtml(user.email)}</p></div>
      <button class="secondary-button" id="logout" type="button">Sair</button>
    </header>
    <section class="messaging-layout" aria-label="Mensagens">
      <aside class="conversation-panel">
        <div class="conversation-panel-heading"><h2>Conversas</h2><button id="refresh-conversations" class="secondary-button" type="button">Atualizar</button></div>
        <p id="conversation-feedback" class="messaging-feedback" role="status"></p>
        <ul id="conversation-list" class="conversation-list"><li>Carregando conversas…</li></ul>
      </aside>
      <section class="chat-panel" aria-label="Conversa selecionada">
        <div id="chat-placeholder" class="chat-placeholder"><h2>Suas mensagens</h2><p>Selecione uma conversa para consultar o histórico.</p></div>
        <div id="chat-view" hidden>
          <header class="chat-heading"><button id="back-to-conversations" class="secondary-button" type="button">Conversas</button><div><h2 id="chat-name"></h2><p id="chat-status" role="status"></p></div></header>
          <div id="message-history" class="message-history" aria-live="polite" aria-relevant="additions"></div>
          <form id="message-form" class="message-form">
            <label class="visually-hidden" for="message-input">Digite sua mensagem</label>
            <textarea id="message-input" name="body" rows="1" maxlength="${MAX_MESSAGE_LENGTH}" placeholder="Digite uma mensagem…" required></textarea>
            <button class="primary-button" type="submit">Enviar</button>
          </form>
          <p id="send-feedback" class="messaging-feedback" role="status"></p>
        </div>
      </section>
    </section>
  </main>`

  const list = root.querySelector('#conversation-list')
  const feedback = root.querySelector('#conversation-feedback')
  const chatView = root.querySelector('#chat-view')
  const placeholder = root.querySelector('#chat-placeholder')
  const history = root.querySelector('#message-history')
  const form = root.querySelector('#message-form')
  const input = root.querySelector('#message-input')
  const sendFeedback = root.querySelector('#send-feedback')
  let activeConversation = null
  let messages = []
  let loadingOlder = false
  let hasMore = true
  let historyGeneration = 0

  async function loadConversations() {
    feedback.textContent = ''
    list.innerHTML = '<li>Carregando conversas…</li>'
    const { data, error } = await supabase.rpc('get_my_conversations')
    if (error) {
      list.innerHTML = '<li>Não foi possível carregar suas conversas.</li>'
      feedback.textContent = 'Verifique sua conexão e suas permissões e tente novamente.'
      return
    }
    if (!data?.length) {
      list.innerHTML = '<li class="conversation-empty">Você ainda não possui conversas.</li>'
      return
    }
    list.innerHTML = data.map(conversation => `<li>
      <button class="conversation-item" type="button" data-conversation-id="${escapeHtml(conversation.conversation_id)}" data-name="${escapeHtml(conversation.participant_name)}">
        <span class="conversation-avatar" aria-hidden="true">${escapeHtml((conversation.participant_name || '?').trim().slice(0, 1).toUpperCase())}</span>
        <span class="conversation-copy"><strong>${escapeHtml(conversation.participant_name)}</strong><span>${escapeHtml(formatPreview(conversation.last_message))}</span></span>
        <time>${escapeHtml(formatTime(conversation.activity_at))}</time>
      </button>
    </li>`).join('')
    list.querySelectorAll('[data-conversation-id]').forEach(button => {
      button.addEventListener('click', () => openConversation(button.dataset.conversationId, button.dataset.name))
    })
  }

  async function fetchPage(conversationId, before = null) {
    let query = supabase.from('messages')
      .select('id, conversation_id, sender_id, body, created_at')
      .eq('conversation_id', conversationId)
    if (before) {
      query = query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`)
    }
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(PAGE_SIZE)
    if (error) throw error
    return (data ?? []).reverse()
  }

  function renderHistory() {
    history.innerHTML = `${hasMore ? '<button type="button" data-load-older class="load-older">Carregar mensagens anteriores</button>' : '<p class="history-end">Início da conversa</p>'}${messages.map(item => renderMessage(item, user.id)).join('')}`
    history.querySelector('[data-load-older]')?.addEventListener('click', loadOlder)
    history.scrollTop = history.scrollHeight
    return markerHtml
  }

  async function loadOlder() {
    if (loadingOlder || !hasMore || !activeConversation || !messages.length) return
    loadingOlder = true
    const button = history.querySelector('[data-load-older]')
    if (button) { button.disabled = true; button.textContent = 'Carregando…' }
    const oldHeight = history.scrollHeight
    const oldTop = history.scrollTop
    const generation = historyGeneration
    try {
      const page = await fetchPage(activeConversation.id, messages[0])
      if (generation !== historyGeneration) return
      hasMore = page.length === PAGE_SIZE
      messages = mergeMessages(page, messages)
      history.innerHTML = `${hasMore ? '<button type="button" data-load-older class="load-older">Carregar mensagens anteriores</button>' : '<p class="history-end">Início da conversa</p>'}${messages.map(item => renderMessage(item, user.id)).join('')}`
      history.querySelector('[data-load-older]')?.addEventListener('click', loadOlder)
      history.scrollTop = oldTop + (history.scrollHeight - oldHeight)
    } catch {
      sendFeedback.textContent = 'Não foi possível carregar as mensagens anteriores.'
      if (button?.isConnected) { button.disabled = false; button.textContent = 'Tentar novamente' }
    } finally {
      loadingOlder = false
    }
  }

  async function openConversation(id, name) {
    historyGeneration += 1
    const generation = historyGeneration
    activeConversation = { id, name }
    messages = []
    hasMore = true
    loadingOlder = false
    placeholder.hidden = true
    chatView.hidden = false
    root.querySelector('#chat-name').textContent = name
    root.querySelector('#chat-status').textContent = 'Carregando histórico…'
    history.innerHTML = '<p>Carregando mensagens…</p>'
    sendFeedback.textContent = ''
    try {
      const page = await fetchPage(id)
      if (generation !== historyGeneration) return
      messages = mergeMessages([], page)
      hasMore = page.length === PAGE_SIZE
      root.querySelector('#chat-status').textContent = ''
      renderHistory()
      input.focus()
    } catch {
      if (generation !== historyGeneration) return
      history.innerHTML = '<p role="alert">Não foi possível carregar o histórico. Tente novamente.</p>'
      root.querySelector('#chat-status').textContent = 'Falha ao consultar mensagens.'
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const body = input.value.trim()
    if (!activeConversation || !isValidMessageBody(body)) {
      sendFeedback.textContent = 'Digite uma mensagem com até 10.000 caracteres.'
      return
    }
    const button = form.querySelector('button')
    button.disabled = true
    input.disabled = true
    sendFeedback.textContent = 'Enviando…'
    try {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        body,
      }).select('id, conversation_id, sender_id, body, created_at').single()
      if (error) throw error
      messages = mergeMessages(messages, [data])
      renderHistory()
      input.value = ''
      sendFeedback.textContent = 'Mensagem armazenada.'
      await loadConversations()
    } catch {
      sendFeedback.textContent = 'Não foi possível enviar a mensagem. Ela não foi marcada como enviada; tente novamente.'
    } finally {
      button.disabled = false
      input.disabled = false
      input.focus()
    }
  })

  history.addEventListener('scroll', () => {
    if (history.scrollTop < 80) loadOlder()
  }, { passive: true })
  root.querySelector('#refresh-conversations').addEventListener('click', loadConversations)
  root.querySelector('#back-to-conversations').addEventListener('click', () => {
    historyGeneration += 1
    activeConversation = null
    chatView.hidden = true
    placeholder.hidden = false
  })
  root.querySelector('#logout').addEventListener('click', async event => {
    const button = event.currentTarget
    button.disabled = true
    const { error } = await supabase.auth.signOut()
    if (error) {
      feedback.textContent = 'Não foi possível encerrar sua sessão. Tente novamente.'
      button.disabled = false
    }
  })

  await loadConversations()
}
