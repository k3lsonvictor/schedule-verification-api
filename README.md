# Consultar Agendamentos (Schedule Verification API)

API em **Node.js** + **Express** + **TypeScript** que cadastra e-mails e códigos de agendamento, consulta periodicamente um portal de agendamento e envia **alerta por e-mail** quando a página indicar que o encaminhamento foi marcado.

## O que faz

- **Cadastro de usuários** com um ou mais códigos de consulta (MongoDB).
- **Verificação automática** em intervalo de **12 horas**: para cada código ainda não notificado, faz uma requisição HTTP e procura o texto `ENCAMINHAMENTO MARCADO` no HTML retornado.
- Se encontrar, **envia e-mail** (via Gmail/Nodemailer) com o resumo da página e marca o código como já notificado para não repetir o envio.

## Requisitos

- [Node.js](https://nodejs.org/) (versão compatível com o projeto; recomendado LTS atual)
- [MongoDB](https://www.mongodb.com/) acessível (local ou Atlas)
- Conta Gmail com **senha de app** (ou outro SMTP, se você adaptar o transporter em `src/services/schedules.ts`)

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

| Variável     | Descrição |
|-------------|-----------|
| `MONGO_URI` | URI de conexão MongoDB (ex.: `mongodb://localhost:27017/seu_banco`) |
| `BASE_URL`  | URL base do site de agendamento (sem barra final desnecessária; usada para montar `/detail_scheduling/index?...`) |
| `EMAIL_USER`| E-mail usado para autenticar no Nodemailer |
| `EMAIL_PASS`| Senha de app ou credencial do provedor de e-mail |

> Sem `MONGO_URI`, o código usa o fallback `mongodb://localhost:27017/seu_banco` — ajuste conforme seu ambiente.

## Instalação e execução

```bash
npm install
```

**Desenvolvimento** (recarrega ao salvar):

```bash
npm run dev
```

**Produção**:

```bash
npm run build
npm start
```

O servidor sobe na porta **3000** por padrão (`src/app.ts`).

## Rotas da API

Base: `http://localhost:3000`

| Método | Rota              | Descrição |
|--------|-------------------|-----------|
| `POST` | `/users/register` | Cadastra e-mail e códigos ou complementa códigos de um e-mail já existente |
| `GET`  | `/users/test`     | Health check simples |

### `POST /users/register`

**Corpo (JSON):**

```json
{
  "email": "usuario@exemplo.com",
  "codes": [
    { "value": "CODIGO_DO_AGENDAMENTO_1" },
    { "value": "CODIGO_DO_AGENDAMENTO_2" }
  ]
}
```

- Se o e-mail **não existir**, cria o usuário com `status: false` em cada código.
- Se **já existir**, adiciona apenas códigos novos (duplicados são ignorados).

**Respostas típicas:** `201` (novo usuário), `200` (atualização ou já cadastrado), `400` (dados inválidos), `500` (erro no servidor).

### `GET /users/test`

Retorna JSON confirmando que a API está respondendo.

## Estrutura do projeto

```
src/
  app.ts                 # Express, CORS, rotas e inicialização do job
  config/db.ts           # Conexão MongoDB (helper)
  controllers/           # Lógica HTTP dos usuários
  models/user-model.ts   # Schema Mongoose (email + codes com status)
  routes/user-routes.ts  # Rotas /users
  services/schedules.ts  # Verificação periódica, HTTP e envio de e-mail
```

## Stack principal

Express 5, Mongoose, Axios, Nodemailer, dotenv, CORS, TypeScript.

## Licença

ISC (conforme `package.json`).
