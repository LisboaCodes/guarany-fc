# Como Criar o Banco guarany_fc no Coolify

## Opção 1: Via Coolify UI (RECOMENDADO)

1. Acesse seu Coolify
2. Vá em **PostgreSQL** → **Databases**
3. Clique em **"Create Database"** ou **"New Database"**
4. Nome: `guarany_fc`
5. Owner: `filehub` (use o mesmo usuário)
6. Salve

## Opção 2: Via Terminal/SSH

Conecte no servidor onde o Coolify está rodando e execute:

```bash
# Entrar no container PostgreSQL
docker exec -it <nome-do-container-postgres> psql -U filehub -d postgres

# Criar o banco
CREATE DATABASE guarany_fc OWNER filehub;

# Verificar
\l

# Sair
\q
```

## Opção 3: Via pgAdmin ou DBeaver

Se você usa alguma dessas ferramentas de gerenciamento de banco:

**Configuração de Conexão:**
- Host: `201.23.70.201`
- Port: `5432`
- Database: `postgres` (para conectar primeiro)
- Username: `filehub`
- Password: `FileHub2024@Secure!Pass`

**Depois de conectar:**
1. Clique com botão direito em "Databases"
2. "Create" → "Database"
3. Nome: `guarany_fc`
4. Owner: `filehub`
5. Save

---

## Depois de Criar o Banco

Volte ao terminal do projeto Guarany e execute:

```bash
cd "C:\Users\lisbo\OneDrive\Área de Trabalho\GUARANY"
npm run db:migrate
npm run db:seed
```

Isso criará todas as tabelas do Guarany no novo banco separado, sem afetar o FileHub!
