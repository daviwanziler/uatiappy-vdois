function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <span className="brand-mark" aria-hidden="true">U</span>
        <p className="eyebrow">Comunicação institucional</p>
        <h1 id="welcome-title">Bem-vindo ao UatiAppy</h1>
        <p className="intro">
          Um espaço para conectar pessoas por meio de conversas individuais
          e mensagens de texto.
        </p>
        <div className="status" role="status">
          <span className="status-dot" />
          Estrutura inicial em desenvolvimento
        </div>
      </section>
    </main>
  )
}

export default App
