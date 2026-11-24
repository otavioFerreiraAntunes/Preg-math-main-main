# 🚀 Guia de Deploy — PregMath (Supabase + Vercel)

> [!IMPORTANT]
> Siga as etapas **na ordem**. Não pule para o deploy antes de configurar o banco e o `.env`.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configurar o Supabase (banco de dados)](#2-configurar-o-supabase-banco-de-dados)
3. [Criar as tabelas no banco](#3-criar-as-tabelas-no-banco)
4. [Preencher o `.env` local](#4-preencher-o-env-local)
5. [Testar localmente](#5-testar-localmente)
6. [Publicar no GitHub](#6-publicar-no-github)
7. [Deploy na Vercel](#7-deploy-na-vercel)
8. [Variáveis de ambiente na Vercel](#8-variáveis-de-ambiente-na-vercel)
9. [Verificar o deploy](#9-verificar-o-deploy)
10. [Solução de problemas](#10-solução-de-problemas)

---

## 1. Pré-requisitos

| Ferramenta | Onde obter |
|---|---|
| Node.js ≥ 18 | https://nodejs.org |
| Git | https://git-scm.com |
| Conta Supabase (gratuita) | https://supabase.com |
| Conta Vercel (gratuita) | https://vercel.com |
| Conta GitHub | https://github.com |

---

## 2. Configurar o Supabase (banco de dados)

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Dê um nome (ex.: `pregmath`), escolha a região **South America (São Paulo)** e defina uma senha forte para o banco
3. Aguarde a criação (≈ 2 min)
4. Vá em **Settings → Database** e copie a **Connection String** no modo **URI**:
   - Clique em **Transaction mode (port 6543)**
   - A URL terá o formato:
     ```
     postgresql://postgres.[ref]:[SUA_SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
     ```
5. Guarde essa URL — ela será o valor de `DATABASE_URL`

> [!NOTE]
> Use sempre a porta **6543** (Transaction pooler), não a 5432, para funcionar na Vercel (ambiente serverless).

---

## 3. Criar as tabelas no banco

No Supabase vá em **SQL Editor → New query** e execute o script abaixo:

```sql
-- Tabela de questões
CREATE TABLE IF NOT EXISTS questoes (
  id          SERIAL PRIMARY KEY,
  tema        VARCHAR(255) NOT NULL,
  enunciado   TEXT        NOT NULL,
  alternativas JSONB,
  gabarito    VARCHAR(10),
  fonte       VARCHAR(255),
  ano         INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscas por tema (melhora performance)
CREATE INDEX IF NOT EXISTS idx_questoes_tema ON questoes(tema);
```

> [!TIP]
> Se o projeto já tiver um arquivo de seed com questões (ex.: `seed.sql`), rode-o aqui também.

---

## 4. Preencher o `.env` local

Abra o arquivo [`.env`](./.env) na raiz do projeto e preencha **todos os campos marcados**:

```env
PORT=3000
NODE_ENV=development

# Cole aqui a URL copiada do Supabase (passo 2.4)
DATABASE_URL=postgresql://postgres.[ref]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Credenciais do administrador da plataforma
AUTH_USER=admin@pregmath.com
AUTH_PASSWORD=SenhaForteAqui123!

# Já foi gerada automaticamente — pode trocar se quiser
JWT_SECRET=00a53e6460117b07be53fafd92fb457662c184e70c44d6029c39664dab3ffed0bb9f2629edf9bde0839ba4825e79b9923ff0196d071102ee2992e1e2aa4e750a
```

> [!CAUTION]
> **Nunca** faça commit do `.env`. Ele já está no `.gitignore`.

Para gerar um novo `JWT_SECRET` a qualquer momento:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Testar localmente

```bash
# 1. Instalar dependências do backend
npm install

# 2. Instalar dependências do frontend
npm run client:install

# 3. Iniciar o backend (mantém aberto no terminal 1)
npm start

# 4. Em outro terminal: iniciar o frontend
npm run client:dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Teste de rota**: http://localhost:3000/busca/questoes-tema

> [!TIP]
> O Vite está configurado com **proxy**: chamadas do frontend para `/auth/*` e `/busca/*` são automaticamente redirecionadas para o backend em `localhost:3000`. Não é necessário configurar CORS manualmente em desenvolvimento.

---

## 6. Publicar no GitHub

```bash
# Na raiz do projeto
git init                        # (só na primeira vez)
git add .
git commit -m "feat: configuração de deploy Supabase + Vercel"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/pregmath.git
git push -u origin main
```

> [!IMPORTANT]
> Confirme que `.env` e `client/.env.local` **não aparecem** no `git status` antes do commit.

---

## 7. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New → Project**
2. Conecte sua conta GitHub e selecione o repositório `pregmath`
3. Na tela de configuração:
   - **Framework Preset**: Other
   - **Root Directory**: `. ` (raiz — deixe em branco)
   - **Build Command**: `npm run client:build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install && npm run client:install`
4. **Não clique em Deploy ainda** — vá para o passo 8 primeiro

---

## 8. Variáveis de ambiente na Vercel

Ainda na tela de configuração do projeto (aba **Environment Variables**), adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres` |
| `AUTH_USER` | `admin@pregmath.com` |
| `AUTH_PASSWORD` | *(sua senha de admin)* |
| `JWT_SECRET` | *(valor do JWT_SECRET do seu .env)* |
| `NODE_ENV` | `production` |
| `VITE_API_URL` | *(deixe vazio por enquanto — será a URL do próprio projeto)* |

> [!NOTE]
> Depois do primeiro deploy, copie a URL gerada (ex.: `https://pregmath-abc.vercel.app`) e volte em **Settings → Environment Variables** para definir `VITE_API_URL` com esse valor. Faça um novo deploy em seguida.

Agora clique em **Deploy** ✅

---

## 9. Verificar o deploy

Após o deploy concluir:

```
✅ https://pregmath-abc.vercel.app            → frontend carrega
✅ https://pregmath-abc.vercel.app/auth/login → retorna JSON (POST)
✅ https://pregmath-abc.vercel.app/busca/questoes-tema → retorna questões
```

Teste o login via terminal:
```bash
curl -X POST https://SEU-PROJETO.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pregmath.com","password":"SenhaForteAqui123!"}'
```

Resposta esperada:
```json
{ "token": "eyJ...", "user": { "name": "Administrador", ... } }
```

---

## 10. Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| `❌ Erro ao conectar ao PostgreSQL` | `DATABASE_URL` incorreta | Verifique a URL no Supabase Settings → Database (porta 6543) |
| `401 Credenciais inválidas` | `AUTH_USER`/`AUTH_PASSWORD` não batem | Confira as variáveis de ambiente na Vercel |
| `401 Token inválido` | `JWT_SECRET` diferente entre deploys | Use o mesmo valor em todos os ambientes |
| Frontend carrega mas API falha | `VITE_API_URL` não configurada | Defina a URL do projeto Vercel e faça redeploy |
| `Cannot find module` | Dependências não instaladas | Certifique-se que `npm install && npm run client:install` está no Install Command |
| Rota `/*` retorna 404 na Vercel | `vercel.json` mal configurado | O `vercel.json` já está corrigido neste projeto |

---

> Feito com 💙 por alunos do SESI Vinhedo - CE 242
