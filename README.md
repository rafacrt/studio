# Alugo - Backend e Painel de Admin

Este projeto contém o backend completo e o painel administrativo para o aplicativo Alugo. Ele é construído com Next.js, TypeScript e Supabase.

## Visão Geral

- **Backend (API):** Um conjunto de endpoints RESTful para gerenciar usuários, autenticação, listagens de quartos, reservas e mensagens. Projetado para ser consumido por qualquer cliente (iOS, Android, Web).
- **Painel de Administrador:** Uma interface web para administradores gerenciarem usuários, aprovar quartos e visualizar estatísticas da plataforma.
- **Aplicação Web (Protótipo):** Uma aplicação web funcional que serve como um protótipo completo do aplicativo do usuário final e pode ser usada como uma versão web do Alugo.

## Como Iniciar o Projeto

### 1. Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Uma conta no [Supabase](https://supabase.com/)

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone <url_do_repositorio>
cd alugo-project
npm install
```

### 3. Configuração do Ambiente (Supabase)

Este projeto requer chaves do Supabase para se conectar ao banco de dados e ao sistema de autenticação.

1.  Crie um novo projeto no Supabase.
2.  Execute todos os scripts SQL fornecidos durante o desenvolvimento no **SQL Editor** do seu projeto Supabase para criar as tabelas e políticas necessárias.
3.  Vá para **Project Settings > API**.
4.  Crie um arquivo chamado `.env.local` na raiz do seu projeto Next.js.
5.  Copie e cole as seguintes variáveis de ambiente no arquivo, substituindo pelos valores do seu projeto Supabase:

```env
# Cole aqui as chaves do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_URL="https://SUA_URL_DO_PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_ANON"

# (Opcional) Chave de serviço para operações de admin, se necessário no futuro
# SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE_ROLE"
```

### 4. Rodando a Aplicação

Para iniciar o servidor de desenvolvimento do Next.js (que serve a API, o painel de admin e o app web), execute:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:9002`.

- **App do Usuário:** [http://localhost:9002/explore](http://localhost:9002/explore)
- **Login:** [http://localhost:9002/login](http://localhost:9002/login)
- **Painel de Admin:** [http://localhost:9002/admin](http://localhost:9002/admin)

### 5. (Opcional) Rodando o Genkit

Se você estiver desenvolvendo ou depurando os `flows` de IA/backend, pode iniciar o inspetor do Genkit:

```bash
npm run genkit:dev
```

Isso iniciará a UI de desenvolvimento do Genkit, geralmente em `http://localhost:4000`, onde você pode testar os flows isoladamente.
