import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'

const forbidden = /\b(?:ReactDOM|React\.createElement|import\.meta\.env|from\s*['"]react['"]|from\s*['"]vite['"])/
const files = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (['.html', '.js', '.css'].includes(extname(path))) files.push(path)
  }
}
await walk('public')
const errors = []
for (const file of files) {
  const content = await readFile(file, 'utf8')
  if (forbidden.test(content)) errors.push(file + ': dependência React/Vite detectada')
  if (file.endsWith('.html') && /<script(?![^>]*type=["']module["'])/i.test(content)) errors.push(file + ': scripts devem usar módulos ES')
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Frontend estático verificado: ${files.length} arquivos HTML/CSS/JS, sem padrões React/Vite proibidos.`)
