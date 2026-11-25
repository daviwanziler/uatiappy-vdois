import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { setEmployeeAccountStatus } from '../auth/authService'

const STATUS_LABELS = { ACTIVE: 'Ativo', BLOCKED: 'Bloqueado', DISABLED: 'Desativado' }

export default function EmployeeAccountManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('employee_profiles')
      .select('user_id, email, account_status')
      .eq('role', 'FUNCIONARIO')
      .order('email')
    if (queryError) setError('Não foi possível carregar os funcionários.')
    else setEmployees(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  async function changeStatus(employee, status) {
    setBusyId(employee.user_id)
    setError('')
    setFeedback('')
    const { error: actionError } = await setEmployeeAccountStatus({ userId: employee.user_id, status })
    if (actionError) {
      setError(actionError.message || 'Não foi possível alterar o status da conta.')
    } else {
      setFeedback('Status da conta atualizado.')
      await loadEmployees()
    }
    setBusyId('')
  }

  return (
    <section className="auth-card admin-card">
      <div className="section-heading">
        <div><h2>Contas de funcionários</h2><p className="auth-description">Bloqueie temporariamente ou desative o acesso.</p></div>
        <button type="button" className="secondary-button" onClick={loadEmployees} disabled={loading}>Atualizar</button>
      </div>
      {error && <p className="message message-error" role="alert">{error}</p>}
      {feedback && <p className="message message-success" role="status">{feedback}</p>}
      {loading ? <p>Carregando contas…</p> : employees.length === 0 ? <p>Nenhum funcionário cadastrado.</p> : (
        <ul className="employee-list">
          {employees.map(employee => (
            <li key={employee.user_id} className="employee-row">
              <div>
                <strong>{employee.email}</strong>
                <span className="employee-status">{STATUS_LABELS[employee.account_status] ?? employee.account_status}</span>
              </div>
              <div className="employee-actions">
                {employee.account_status === 'ACTIVE' ? (
                  <>
                    <button type="button" className="secondary-button" disabled={busyId === employee.user_id} onClick={() => changeStatus(employee, 'BLOCKED')}>Bloquear</button>
                    <button type="button" className="secondary-button" disabled={busyId === employee.user_id} onClick={() => changeStatus(employee, 'DISABLED')}>Desativar</button>
                  </>
                ) : (
                  <button type="button" className="secondary-button" disabled={busyId === employee.user_id} onClick={() => changeStatus(employee, 'ACTIVE')}>Reativar</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
