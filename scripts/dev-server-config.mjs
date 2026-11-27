export function resolveDevServerHost(host = process.env.HOST) {
  return typeof host === 'string' && host.trim() ? host.trim() : '127.0.0.1'
}
