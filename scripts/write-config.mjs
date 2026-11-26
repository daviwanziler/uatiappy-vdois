import { mkdir, writeFile } from 'node:fs/promises'

const url = process.env.SUPABASE_URL ?? ''
const anonKey = process.env.SUPABASE_ANON_KEY ?? ''

if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  throw new Error('SUPABASE_URL deve ser a URL HTTPS do projeto Supabase.')
}
if (anonKey && /service_role/i.test(anonKey)) {
  throw new Error('Uma chave service_role não pode ser usada no frontend.')
}
if (Boolean(url) !== Boolean(anonKey)) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY juntas.')
}

await mkdir('public/js', { recursive: true })
const config = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
}
await writeFile(
  'public/js/config.js',
  `// Gerado durante o build. Contém somente configuração pública.\nexport default Object.freeze(${JSON.stringify(config, null, 2)})\n`,
  'utf8',
)
console.log(url ? 'Configuração pública do Supabase gerada.' : 'Build sem Supabase: configure as variáveis na Vercel para habilitar autenticação.')
