# 🚀 Setup Rápido - Coolify Guarany FC

## 📋 Dados Encontrados

✅ **PostgreSQL já existe no Coolify:**
- Host Interno: `kg8cwk8kw0ggcooog0w0kws0:5432`
- Host Externo: `201.23.70.201:5432`
- Usuário: `filehub`
- Senha: `FileHub2024@Secure!Pass`

✅ **Evolution API configurada:**
- URL: `https://evolution.creativenext.com.br`
- API Key: `Mel102424`

---

## 🔥 PASSO A PASSO - COPIE E COLE NO COOLIFY

### 1️⃣ CRIAR BANCO DE DADOS

No terminal do Coolify (ou qualquer cliente PostgreSQL), execute:

```sql
CREATE DATABASE guarany_fc;
GRANT ALL PRIVILEGES ON DATABASE guarany_fc TO filehub;
```

**OU** use o painel do Coolify para criar um novo database chamado `guarany_fc`

---

### 2️⃣ VARIÁVEIS DE AMBIENTE

No Coolify, vá em **Environment Variables** e adicione:

```env
DATABASE_URL=postgresql://filehub:FileHub2024@Secure!Pass@kg8cwk8kw0ggcooog0w0kws0:5432/guarany_fc
NEXTAUTH_URL=http://creativenext.com.br/guarany
NEXTAUTH_SECRET=<CLIQUE EM GENERATE RANDOM>
EVOLUTION_API_URL=https://evolution.creativenext.com.br
EVOLUTION_API_KEY=Mel102424
EVOLUTION_INSTANCE=GUARANY
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Guarany FC
CRON_SECRET=<CLIQUE EM GENERATE RANDOM>
```

**IMPORTANTE:**
- Use o botão **"Generate Random"** do Coolify para gerar `NEXTAUTH_SECRET` e `CRON_SECRET`
- O host `kg8cwk8kw0ggcooog0w0kws0` é o hostname interno do PostgreSQL no Coolify

---

### 3️⃣ DEPLOY

1. Salve as variáveis de ambiente
2. Clique em **Deploy** (botão verde no topo)
3. Aguarde o build terminar

---

### 4️⃣ EXECUTAR MIGRATIONS

Após o deploy, vá no **Terminal** da aplicação e execute:

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎯 LOGIN APÓS DEPLOY

Acesse: `http://creativenext.com.br/guarany/login`

**Credenciais:**
- Email: `admin@guarany.com`
- Senha: `Admin123!`

---

## ✅ RESUMO DA CONFIGURAÇÃO COOLIFY

```
Repository: https://github.com/LisboaCodes/guarany-fc
Branch: main
Build Pack: Dockerfile
Port: 3005
Domains: http://creativenext.com.br/guarany
```

---

## 🆘 Se der erro no build

Verifique os logs e confirme que:
1. O Dockerfile está sendo usado (não Nixpacks)
2. Todas as variáveis de ambiente estão configuradas
3. O banco de dados `guarany_fc` foi criado
4. A porta está 3005

---

**Pronto para deployar! 🚀**
