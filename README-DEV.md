# UatiAppy — desenvolvimento

## Stack inicial

- React
- JavaScript (ES modules)
- Vite
- Node.js e npm

O frontend é uma aplicação web. O Supabase/PostgreSQL e a hospedagem Vercel
fazem parte da arquitetura proposta, mas ainda não foram conectados nesta
etapa de bootstrap.

## Pré-requisitos

- Node.js 22 ou versão LTS compatível
- npm

## Executar localmente

```bash
npm install
npm run dev
```

O Vite informará o endereço local para abrir no navegador.

## Verificar a compilação

```bash
npm run build
npm run preview
```

Os arquivos compilados são gerados em `dist/`. Não versionar `node_modules/`
ou `dist/`.

## Variáveis de ambiente

Não coloque chaves, tokens ou credenciais no código-fonte. Quando a integração
com serviços externos for implementada, documentaremos as variáveis necessárias
em um arquivo `.env.example`, sem valores secretos.
