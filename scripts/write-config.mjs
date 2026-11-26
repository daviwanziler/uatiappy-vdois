import { mkdir, writeFile } from 'node:fs/promises'
import { validatePublicSupabaseConfig } from './config-validation.mjs'

const config = validatePublicSupabaseConfig(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
await mkdir('public/js', { recursive: true })
await writeFile(
  'public/js/config.js',
  `// Gerado durante o build. Contém somente configuração pública.\nexport default Object.freeze(${JSON.stringify(config, null, 2)})\n`,
  'utf8',
)
console.log(config.supabaseUrl ? 'Configuração pública do Supabase gerada.' : 'Build sem Supabase: configure as variáveis na Vercel para habilitar autenticação.')
