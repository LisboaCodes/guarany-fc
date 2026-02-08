# 🟢⚪ Guarany FC - Sistema de Sócio Torcedor

Sistema completo de gerenciamento de sócios torcedores para o Guarany Futebol Clube.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-green)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-purple)

## 🎯 Funcionalidades

### ✅ Sistema Completo Implementado

#### 🎨 Interface Moderna
- Design **responsivo** (mobile, tablet, desktop)
- Tema **Palmeiras** (#006437, #FFD700)
- Componentes **shadcn/ui** profissionais
- **Navegação** intuitiva com menu responsivo
- **Loading states** e animações suaves

#### 👥 Gerenciamento de Sócios
- **Cadastro completo** com validação de CPF
- **Busca e filtros** por nome, CPF, telefone, status
- **Paginação** automática
- **Visualização detalhada** com histórico de pagamentos
- **Edição inline** de dados
- **Ativação/Desativação** de sócios
- **Formatação automática** de CPF e telefone

#### 💰 Sistema de Pagamentos
- **Registro de pagamentos** mensais
- **Seleção de sócio** com busca
- **Múltiplos métodos**: PIX, Dinheiro, Cartão, Boleto
- **Controle de status**: Pago, Pendente, Atrasado, Cancelado
- **Filtros por status** e período
- **Histórico completo** por sócio
- **Marca como pago** com um clique
- **Validação** de duplicados (mesmo mês/ano)

#### 📊 Dashboard
- **Cards de estatísticas** com indicadores
- **Atividade recente** do sistema
- **Status em tempo real** (Autenticação, BD, WhatsApp)
- **Ações rápidas** para funcionalidades principais

#### 🔐 Segurança
- Autenticação com **NextAuth.js**
- Senhas com **bcrypt**
- **Audit logs** automáticos para todas as ações
- **Validações** frontend e backend
- **Roles**: ADMIN e OPERATOR

## 🚀 Stack Tecnológica

- **Framework**: Next.js 16.1.6 (App Router)
- **Linguagem**: TypeScript
- **ORM**: Prisma 5.22.0
- **Banco de Dados**: PostgreSQL 16
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Autenticação**: NextAuth.js
- **Ícones**: Lucide React
- **Deploy**: Coolify (Docker)

## 📦 Instalação Local

```bash
# Clonar o repositório
git clone https://github.com/LisboaCodes/guarany-fc.git
cd guarany-fc

# Instalar dependências
npm install

# Configurar .env.local
cp .env.example .env.local
# Edite .env.local com suas configurações

# Aplicar migrações
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3005

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/guarany_fc"

# NextAuth
NEXTAUTH_URL="http://localhost:3005"
NEXTAUTH_SECRET="your-secret-here-min-32-chars"

# Evolution API (Opcional - Futuro)
EVOLUTION_API_URL="https://api.example.com"
EVOLUTION_API_KEY="your-key"
EVOLUTION_INSTANCE="instance-name"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 🚢 Deploy no Coolify

### 1. Criar Banco de Dados

No servidor, crie o banco `guarany_fc`:

```bash
ssh -i ~/.ssh/servidorbr01 ubuntu@201.23.70.201
docker exec <postgres-container> psql -U postgres -c "CREATE DATABASE guarany_fc OWNER <user>;"
```

### 2. Configurar Application no Coolify

1. **Repository**: `https://github.com/LisboaCodes/guarany-fc.git`
2. **Branch**: `main`
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Port**: `3005`
6. **Domain**: `guarany.creativenext.com.br`

### 3. Variáveis de Ambiente no Coolify

Adicione:
- `DATABASE_URL` (com credenciais do PostgreSQL)
- `NEXTAUTH_URL` (http://guarany.creativenext.com.br)
- `NEXTAUTH_SECRET` (gerado com openssl)

**Importante**: Marque apenas "Available at Runtime" (NÃO marque "Available at Buildtime")

### 4. Aplicar Migrações

**Via Terminal do Container no Coolify:**
```bash
# No Coolify: Application > Terminal
npx prisma migrate deploy
```

**Via SSH:**
```bash
# Conectar no servidor
ssh -i ~/.ssh/servidorbr01 ubuntu@201.23.70.201

# Encontrar o container do Guarany
docker ps | grep guarany

# Executar migração (substitua CONTAINER_ID)
docker exec -it CONTAINER_ID npx prisma migrate deploy
```

### 5. Primeiro Acesso

1. Acesse: `http://guarany.creativenext.com.br/setup`
2. Crie o usuário **admin**
3. Faça login em `/login`

## 📊 Estrutura do Banco de Dados

O schema Prisma inclui:

- **users** - Usuários do sistema (Admin/Operador)
- **members** - Sócios torcedores
- **payments** - Pagamentos mensais
- **system_settings** - Configurações do sistema
- **notification_logs** - Logs de notificações WhatsApp
- **audit_logs** - Logs de auditoria de todas as ações

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/           # Página de login
│   │   └── setup/           # Setup inicial (primeiro admin)
│   ├── (dashboard)/         # Rotas protegidas
│   │   └── dashboard/
│   │       ├── page.tsx     # Dashboard principal
│   │       ├── socios/      # Gestão de sócios
│   │       │   ├── page.tsx           # Lista
│   │       │   ├── novo/page.tsx      # Cadastro
│   │       │   └── [id]/page.tsx      # Detalhes
│   │       ├── pagamentos/  # Gestão de pagamentos
│   │       │   └── page.tsx
│   │       └── configuracoes/  # Configurações
│   │           └── page.tsx
│   └── api/                 # API Routes
│       ├── auth/            # NextAuth
│       ├── setup/           # Setup inicial
│       ├── members/         # API de sócios
│       │   ├── route.ts     # GET (list) e POST (create)
│       │   └── [id]/        # GET, PUT, DELETE
│       └── payments/        # API de pagamentos
│           ├── route.ts     # GET (list) e POST (create)
│           └── [id]/        # PUT, DELETE
├── components/
│   └── ui/                  # Componentes shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       └── ... (15+ componentes)
├── lib/
│   ├── auth.ts              # Configuração NextAuth
│   ├── prisma.ts            # Cliente Prisma
│   └── utils.ts             # Utilitários (cn helper)
└── hooks/
    └── use-mobile.tsx       # Hook para detectar mobile

prisma/
├── schema.prisma            # Schema completo do banco
└── migrations/              # Histórico de migrações

scripts/
└── migrate-production.sh    # Script helper para migrações
```

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor dev (porta 3005)
npm run build            # Build de produção
npm start                # Servidor produção

# Banco de Dados
npx prisma migrate dev   # Criar e aplicar migração (dev)
npx prisma migrate deploy # Aplicar migrações (prod)
npx prisma studio        # Interface visual do banco
npx prisma generate      # Gerar Prisma Client
npx prisma db push       # Push schema sem migração

# Outros
npm run lint             # Verificar lint
```

## 📱 Funcionalidades Futuras

- [ ] Integração completa WhatsApp (Evolution API)
- [ ] Mensagens automáticas de aniversário
- [ ] Lembretes de pagamento automáticos
- [ ] Dashboard com gráficos analytics (recharts)
- [ ] Relatórios em PDF
- [ ] Sistema de planos diferenciados (Bronze, Prata, Ouro)
- [ ] Gestão de benefícios para sócios
- [ ] Exportação de dados (Excel, CSV)
- [ ] App mobile (React Native)

## 🔐 Sistema de Permissões

### Roles

- **ADMIN**: Acesso total ao sistema
- **OPERATOR**: Acesso limitado (sem configurações)

### Funcionalidades por Role

| Funcionalidade | Admin | Operator |
|---------------|:-----:|:--------:|
| Ver Dashboard | ✅ | ✅ |
| Gerenciar Sócios | ✅ | ✅ |
| Registrar Pagamentos | ✅ | ✅ |
| Ver Relatórios | ✅ | ✅ |
| Configurações | ✅ | ❌ |
| Gerenciar Usuários | ✅ | ❌ |
| Ver Audit Logs | ✅ | ❌ |

## 🐛 Troubleshooting

### Erro: "Prisma Client not found"
```bash
npx prisma generate
```

### Erro: "Cannot connect to database"

Verifique:
1. `DATABASE_URL` está correta no `.env.local`
2. PostgreSQL está rodando
3. Banco de dados `guarany_fc` existe
4. Credenciais estão corretas
5. Firewall/Porta liberada

### Erro: "NextAuth configuration error"

Verifique:
1. `NEXTAUTH_URL` está configurada (http://...)
2. `NEXTAUTH_SECRET` tem pelo menos 32 caracteres
3. Formato da URL está correto (com protocolo)

### Erro: Build falha no Coolify

1. Verifique se `NODE_ENV` NÃO está marcada como "Available at Buildtime"
2. Confirme que o `package.json` tem `postinstall: prisma generate`
3. Veja os logs de build no Coolify

### Porta 3005 já em uso

```bash
# Windows
netstat -ano | findstr :3005
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3005 | xargs kill

# Ou use outra porta
PORT=3006 npm run dev
```

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues**: [GitHub Issues](https://github.com/LisboaCodes/guarany-fc/issues)
- **Email**: contato@guaranyfc.com.br

## 📄 Licença

© 2026 Guarany FC - Todos os direitos reservados

---

**Desenvolvido com 💚 para o Guarany Futebol Clube**
