# Guarany FC - Sistema de Sócio Torcedor

Sistema completo de gestão de sócios torcedores com Next.js 14, PostgreSQL e integração WhatsApp.

## Stack Técnica

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM 5
- NextAuth.js (autenticação multi-nível)
- Tailwind CSS
- Evolution API (WhatsApp)

## Setup Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar PostgreSQL

Certifique-se de que o Docker Desktop está rodando, depois execute:

```bash
docker-compose up -d
```

Ou use um PostgreSQL local e atualize a `DATABASE_URL` no arquivo `.env.local`.

### 3. Executar Migrations

```bash
npm run db:migrate
```

Quando perguntado o nome da migration, use algo como: `init`

### 4. Seed do Banco de Dados

Cria o usuário admin e configurações iniciais:

```bash
npm run db:seed
```

**Credenciais do Admin:**
- Email: `admin@guarany.com`
- Senha: `Admin123!`

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia servidor de produção
- `npm run db:migrate` - Executa migrations do Prisma
- `npm run db:seed` - Popula banco com dados iniciais
- `npm run db:studio` - Abre Prisma Studio (interface visual do DB)
- `npm run db:reset` - Reseta o banco de dados (CUIDADO!)

## Estrutura do Projeto

```
guarany-fc/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── migrations/            # Migrations do Prisma
│   └── seed.ts                # Seed inicial (admin user)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Rotas públicas (login)
│   │   ├── (dashboard)/       # Rotas protegidas
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   ├── lib/                   # Bibliotecas e utilities
│   └── types/                 # TypeScript types
└── docker-compose.yml         # PostgreSQL container
```

## Funcionalidades Implementadas

### Fase 1 - Setup Inicial ✅
- [x] Projeto Next.js configurado
- [x] Dependências instaladas
- [x] Prisma configurado
- [x] PostgreSQL via Docker
- [x] Variáveis de ambiente

### Fase 2 - Autenticação ✅
- [x] NextAuth.js configurado
- [x] Página de login
- [x] Middleware de proteção
- [x] Seed do usuário admin
- [x] Sistema de roles (Admin/Operador)

### Próximas Fases
- [ ] API de Sócios (CRUD)
- [ ] API de Pagamentos
- [ ] UI - Gestão de Sócios
- [ ] UI - Pagamentos
- [ ] Dashboard e Gráficos
- [ ] Integração Evolution API
- [ ] Relatórios Financeiros
- [ ] Deploy

## Configuração Evolution API

Para habilitar mensagens via WhatsApp, configure as variáveis no `.env.local`:

```env
EVOLUTION_API_URL="https://sua-evolution-api.com"
EVOLUTION_API_KEY="sua-api-key"
EVOLUTION_INSTANCE="sua-instancia"
```

## Troubleshooting

### Docker não inicia

Se o Docker Desktop não estiver rodando:
1. Inicie o Docker Desktop manualmente
2. Aguarde alguns segundos
3. Execute `docker-compose up -d` novamente

### Erro ao executar migrations

Se houver erro de conexão com o banco:
1. Verifique se o PostgreSQL está rodando: `docker ps`
2. Confirme a `DATABASE_URL` no `.env.local`
3. Teste a conexão: `npx prisma db push`

### Porta 3000 já em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou use outra porta
PORT=3001 npm run dev
```

## Licença

Projeto privado - Guarany Futebol Clube
