import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const allDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
const forbiddenPackages = Object.keys(allDependencies).filter(name =>
  /^(react|react-dom|vite|@vitejs\/plugin-react)$/.test(name),
)
const errors = forbiddenPackages.map(name => `package.json: dependência proibida ${name}`)
const forbidden = /\b(?:ReactDOM|React\.createElement|import\.meta\.env|from\s*['"]react['"]|from\s*['"]vite['"])/
const frontendFiles = []
const javascriptFiles = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ['.git', 'node_modules'].includes(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else {
      if (/\.jsx$|\.tsx$/.test(entry.name) || /^vite\.config\./.test(entry.name)) {
        errors.push(`${path}: arquivo React/Vite não permitido`)
      }
      if (['.html', '.js', '.css'].includes(extname(path))) frontendFiles.push(path)
      if (['.js', '.mjs'].includes(extname(path))) javascriptFiles.push(path)
    }
  }
}
await walk('.')
for (const file of frontendFiles.filter(path => path.startsWith('public/'))) {
  const content = await readFile(file, 'utf8')
  if (forbidden.test(content)) errors.push(file + ': dependência React/Vite detectada')
  if (file.endsWith('.html') && /<script(?![^>]*type=["']module["'])/i.test(content)) {
    errors.push(file + ': scripts devem usar módulos ES')
  }
}
for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) errors.push(`${file}: sintaxe JavaScript inválida\\n${result.stderr}`)
}
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'))
if (vercel.outputDirectory !== 'public' || vercel.buildCommand !== 'npm run build' || vercel.framework !== null) {
  errors.push('vercel.json: configuração esperada para hospedagem estática em public não encontrada')
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Frontend validado: ${frontendFiles.length} arquivos web, sem dependências React/JSX/Vite.`)
