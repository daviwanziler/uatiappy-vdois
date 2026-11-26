export async function finalizeCreatedAccount(recordAccount: () => Promise<{ error?: unknown }>) {
  try {
    const result = await recordAccount()
    if (result?.error) return { auditStatus: 'PENDING_RECONCILIATION' as const }
    return { auditStatus: 'SUCCESS' as const }
  } catch {
    return { auditStatus: 'PENDING_RECONCILIATION' as const }
  }
}
