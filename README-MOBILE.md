# UatiAppy — aplicativo mobile

Aplicativo institucional de comunicação e troca de mensagens, desenvolvido com React Native, Expo e JavaScript.

## Stack

- React Native
- Expo SDK 58
- JavaScript
- React 19.3
- Node.js 22.13 ou superior
- Supabase / PostgreSQL (integração futura)
- GitHub Actions

## Pré-requisitos

- Node.js 22.13 ou superior
- npm
- Expo Go instalado em um dispositivo compatível, ou emulador Android configurado
- VS Code (recomendado)

## Executar

    npm install
    npx expo start

Leia o QR Code com o Expo Go ou use as opções do terminal para iniciar em um emulador.

Comandos alternativos:

    npm run android
    npm run ios
    npm run doctor
    npm run export

O comando iOS requer macOS e Xcode para simulador local. Também é possível desenvolver em um dispositivo físico compatível com Expo Go.

## Estrutura inicial

- App.js: componente raiz da aplicação.
- app.json: metadados e configuração Expo.
- package.json: dependências e comandos.

A estrutura será ampliada conforme as funcionalidades forem implementadas.

## Segurança

- Nunca versionar arquivos .env ou credenciais.
- Chaves administrativas/secretas do Supabase nunca podem ser incluídas no aplicativo.
- A integração deverá usar somente credenciais públicas apropriadas ao cliente e políticas RLS no banco.
- A autorização efetiva deve ser garantida no backend, não apenas pela interface.

## Estado do bootstrap

Esta etapa prepara a aplicação Expo e uma tela inicial. Não implementa autenticação, cadastro, banco de dados ou troca de mensagens.
