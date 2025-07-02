# Documentação da API Alugo

Esta documentação descreve os endpoints da API RESTful para o projeto Alugo.

**URL Base:** `http://localhost:9002/api` (em desenvolvimento)

## Autenticação

Todos os endpoints que requerem autenticação esperam um token JWT no cabeçalho da requisição:

`Authorization: Bearer <SEU_TOKEN_JWT>`

---

### 1. Auth: Registro de Usuário

- **Endpoint:** `POST /auth/register`
- **Descrição:** Cria um novo usuário na plataforma.
- **Autenticação:** Nenhuma.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "password": "senha_segura_aqui"
  }
  ```
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "id": "a1b2c3d4-e5f6-...",
    "email": "usuario@exemplo.com"
  }
  ```

---

### 2. Auth: Login de Usuário

- **Endpoint:** `POST /auth/login`
- **Descrição:** Autentica um usuário e retorna um token de sessão.
- **Autenticação:** Nenhuma.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "senha_segura_aqui"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "user": {
      "id": "a1b2c3d4-e5f6-...",
      "email": "usuario@exemplo.com",
      "user_metadata": { "name": "Nome do Usuário", "is_admin": false }
      // ... outros campos do Supabase
    },
    "session": {
      "access_token": "ey...",
      "refresh_token": "ey...",
      // ... outros campos de sessão
    }
  }
  ```

---

### 3. Auth: Recuperar Senha

- **Endpoint:** `POST /auth/forgot-password`
- **Descrição:** Inicia o fluxo de redefinição de senha para um e-mail.
- **Autenticação:** Nenhuma.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "usuario@exemplo.com"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "message": "Se um usuário com este email existir, um link de redefinição de senha foi enviado."
  }
  ```

---

### 4. Auth: Buscar Dados do Usuário Logado

- **Endpoint:** `GET /auth/me`
- **Descrição:** Retorna os dados do perfil do usuário autenticado.
- **Autenticação:** **Requerida**.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "id": "a1b2c3d4-e5f6-...",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "avatar_url": null,
    "is_admin": false
  }
  ```

---

### 5. Auth: Atualizar Dados do Usuário

- **Endpoint:** `PUT /auth/me`
- **Descrição:** Atualiza as informações do perfil do usuário autenticado.
- **Autenticação:** **Requerida**.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Novo Nome do Usuário"
  }
  ```
- **Resposta de Sucesso (200 OK):** Retorna o perfil atualizado, semelhante à resposta do `GET /auth/me`.

---

### 6. Auth: Logout

- **Endpoint:** `POST /auth/logout`
- **Descrição:** Invalida o token de sessão do usuário no servidor.
- **Autenticação:** **Requerida**.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "message": "Successfully logged out."
  }
  ```

---
---

## Listagens (Quartos)

### 1. Listar Categorias

- **Endpoint:** `GET /categories`
- **Descrição:** Retorna todas as categorias de quartos disponíveis.
- **Autenticação:** Nenhuma.
- **Resposta de Sucesso (200 OK):**
  ```json
  [
    {
      "id": "design",
      "label": "Design",
      "description": "Quartos com decoração e design diferenciados.",
      "icon": "Palette"
    },
    // ... outras categorias
  ]
  ```

### 2. Listar Quartos (com Filtros)

- **Endpoint:** `GET /listings`
- **Descrição:** Retorna uma lista paginada de quartos. Suporta filtros via query parameters.
- **Autenticação:** Nenhuma.
- **Query Parameters:**
  - `page` (number, opcional): Número da página. Default: 1.
  - `limit` (number, opcional): Itens por página. Default: 10.
  - `searchTerm` (string, opcional): Termo para buscar no título, descrição ou cidade.
  - `category` (string, opcional): ID da categoria para filtrar.
- **Exemplo:** `/api/listings?page=1&limit=12&category=prox-campus`
- **Resposta de Sucesso (200 OK):** Um array de objetos `listing`.

---

### 3. Detalhes de um Quarto

- **Endpoint:** `GET /listings/[id]`
- **Descrição:** Retorna os detalhes completos de um quarto específico.
- **Autenticação:** Nenhuma.
- **Exemplo:** `/api/listings/a1b2c3d4-e5f6-...`
- **Resposta de Sucesso (200 OK):** Um objeto `listing` completo.

---
---

## Reservas (Bookings)

### 1. Listar Minhas Reservas

- **Endpoint:** `GET /bookings`
- **Descrição:** Retorna o histórico de reservas (ativas e passadas) do usuário autenticado.
- **Autenticação:** **Requerida**.
- **Resposta de Sucesso (200 OK):** Um array de objetos `booking`, cada um com o objeto `listing` aninhado.

---

### 2. Criar uma Reserva

- **Endpoint:** `POST /bookings`
- **Descrição:** Cria uma nova reserva para um quarto.
- **Autenticação:** **Requerida**.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "listing_id": "a1b2c3d4-e5f6-...",
    "check_in_date": "2024-08-01",
    "check_out_date": "2024-12-15",
    "total_price": 5400.00,
    "guests": 1
  }
  ```
- **Resposta de Sucesso (201 Created):** O objeto da reserva recém-criada.

---

### 3. Destrancar Porta

- **Endpoint:** `POST /bookings/[id]/unlock`
- **Descrição:** Endpoint seguro para simular a lógica de destrancar a porta de uma reserva ativa.
- **Autenticação:** **Requerida**.
- **Exemplo:** `/api/bookings/b1c2d3e4-f5g6-.../unlock`
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Porta para a reserva b1c2d3e4... destrancada com sucesso."
  }
  ```

---
---

## Mensagens

### 1. Listar Minhas Conversas

- **Endpoint:** `GET /messages/conversations`
- **Descrição:** Busca a lista de todas as conversas do usuário autenticado.
- **Autenticação:** **Requerida**.
- **Resposta de Sucesso (200 OK):** Um array de objetos `conversation`.

---

### 2. Buscar Mensagens de uma Conversa

- **Endpoint:** `GET /messages/conversations/[id]`
- **Descrição:** Busca todas as mensagens de uma conversa específica.
- **Autenticação:** **Requerida**.
- **Exemplo:** `/api/messages/conversations/c1d2e3f4-...`
- **Resposta de Sucesso (200 OK):** Um array de objetos `message`.

---

### 3. Enviar uma Mensagem

- **Endpoint:** `POST /messages/conversations/[id]`
- **Descrição:** Envia uma nova mensagem para uma conversa existente.
- **Autenticação:** **Requerida**.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "content": "Olá! Gostaria de confirmar minha chegada."
  }
  ```
- **Resposta de Sucesso (201 Created):** O objeto da mensagem recém-criada.
