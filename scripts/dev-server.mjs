import { createServer } from 'node:http'
import { isIP } from 'node:net'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../public/', import.meta.url))
const generated = spawnSync(process.execPath, ['--env-file-if-exists=.env', 'scripts/write-config.mjs'], { stdio: 'inherit' })
if (generated.status !== 0) process.exit(generated.status ?? 1)

const host = (process.env.HOST ?? '127.0.0.1').trim()
const isLoopback = host === 'localhost' || host === '127.0.0.1' || host === '::1'
if (!host || (isIP(host) === 0 && host !== 'localhost')) {
  throw new Error('HOST inválido. Use localhost, 127.0.0.1 ou ::1; para expor na rede, informe um IP explícito.')
}
if (!isLoopback && process.env.ALLOW_EXTERNAL_DEV_HOST !== 'true') {
  throw new Error('Exposição externa bloqueada. Defina ALLOW_EXTERNAL_DEV_HOST=true explicitamente para habilitá-la.')
}

const port = Number(process.env.PORT ?? 5173)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT deve ser um inteiro entre 1 e 65535.')

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' }
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const relative = normalize(pathname).replace(/^([/\\]|\.\.(?:[/\\]|$))+/g, '')
    let file = join(root, relative || 'index.html')
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html') } catch {}
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Não encontrado')
  }
})
server.listen(port, host, () => console.log(`UatiAppy em http://${host}:${port}`))
