# 🗄️ PostgreSQL Dedicado para Guarany FC

Este guia cria um PostgreSQL separado, dedicado apenas para o Guarany FC.

## 🚀 Opção 1: Via SSH no Servidor

### 1. Faça Upload dos arquivos:

Upload via SCP ou Git:
```bash
# No servidor
cd /caminho/desejado
git clone https://github.com/LisboaCodes/guarany-fc.git
cd guarany-fc
```

### 2. Execute o script:

```bash
chmod +x setup-postgres.sh
./setup-postgres.sh
```

### 3. Atualize as variáveis de ambiente no Coolify:

**DATABASE_URL (interno - aplicação no Coolify):**
```
postgresql://guarany_user:Guarany2024!Secure@guarany-postgres:5432/guarany_fc
```

**OU DATABASE_URL (externo - se precisar acessar de fora):**
```
postgresql://guarany_user:Guarany2024!Secure@201.23.70.201:5433/guarany_fc
```

### 4. Restart e execute migrations:

No Coolify, aplicação GUARANY FC:
- **Restart**
- **Terminal:**
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 🚀 Opção 2: Via Coolify Interface

Se preferir criar via interface do Coolify:

1. Dashboard → + New → Database → PostgreSQL
2. Configure:
   - Name: `guarany-postgres`
   - Database: `guarany_fc`
   - User: `guarany_user`
   - Password: (gere ou use `Guarany2024!Secure`)
3. Create
4. Copie a DATABASE_URL gerada
5. Cole nas variáveis de ambiente do GUARANY FC
6. Restart e execute migrations

---

## 📊 Credenciais

```
Database: guarany_fc
User: guarany_user
Password: Guarany2024!Secure
Port Interna: 5432
Port Externa: 5433
```

---

## ✅ Vantagens

- ✅ Banco dedicado para Guarany FC
- ✅ Sem dependência do FileHub
- ✅ Isolamento e segurança
- ✅ Fácil backup e manutenção

---

## 🔧 Comandos Úteis

**Parar:**
```bash
docker-compose -f docker-compose.postgres.yml down
```

**Ver logs:**
```bash
docker-compose -f docker-compose.postgres.yml logs -f
```

**Backup:**
```bash
docker exec guarany-postgres pg_dump -U guarany_user guarany_fc > backup.sql
```

**Restore:**
```bash
docker exec -i guarany-postgres psql -U guarany_user guarany_fc < backup.sql
```
