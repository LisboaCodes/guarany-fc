# AA Guarany - Sistema de Socio Torcedor

Sistema completo de gerenciamento de socios torcedores para a Associacao Atletica Guarany, com controle financeiro, notificacoes automaticas via WhatsApp, score de inadimplencia e gestao de usuarios com 5 niveis de permissao.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-cyan)

**URL**: https://guarany.creativenext.com.br

---

## Stack Tecnologica

| Tecnologia | Versao | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5.9.3 | Tipagem |
| Prisma | 5.22.0 | ORM + Migrations |
| PostgreSQL | 16 | Banco de dados |
| NextAuth.js | 4.24.13 | Autenticacao (JWT) |
| Tailwind CSS | 4.1.18 | Estilizacao |
| shadcn/ui | latest | Componentes UI (Radix) |
| Lucide React | 0.563.0 | Icones |
| Recharts | 2.15.4 | Graficos (instalado) |
| Evolution API | - | WhatsApp integration |
| Coolify | v4 | Deploy (Docker/Nixpacks) |
| Traefik | - | Reverse proxy + SSL |

---

## Funcionalidades Implementadas

### 1. Dashboard (`/dashboard`)
- 4 cards KPI com indicadores de tendencia (socios ativos, receita mensal, taxa pagamento, atrasados)
- Feed de atividade recente com filtro por periodo (24h / 7d / 15d / 30d / 90d / 120d / 1 ano)
- Acoes rapidas (novo socio, registrar pagamento, ver todos)
- Status do sistema (Auth, Database, WhatsApp)

### 2. Socios (`/dashboard/socios`)
- Listagem paginada (10/pagina) com busca por nome, CPF, telefone
- Filtros: Todos / Ativos / Inativos
- Cadastro completo (`/dashboard/socios/novo`): nome, CPF (com mascara), data nascimento, telefone, email, endereco
- Detalhes do socio (`/dashboard/socios/[id]`): visualizar/editar dados, historico de pagamentos, ativar/desativar
- Edicao inline de pagamentos na pagina do socio
- Validacao de CPF unico no backend

### 3. Pagamentos (`/dashboard/pagamentos`)
- Grade completa mes a mes com entradas virtuais para meses sem registro
- 4 cards de resumo: Pagos (total R$), Pendentes, Atrasados, Cancelados
- Navegacao por ano (setas esquerda/direita)
- Busca por nome ou CPF + filtro por status
- Botao "Registrar" para entradas virtuais (pre-preenche formulario)
- Botao "Marcar Pago" para pendentes/atrasados (1 clique)
- Dialog de registro: socio, mes/ano, valor, metodo (PIX/Dinheiro/Cartao/Boleto), status, vencimento, data pagamento, observacoes
- Validacao de duplicidade (mesmo socio + mes + ano)
- Notificacao automatica via WhatsApp ao registrar pagamento

### 4. Score de Inadimplencia (`/dashboard/score`)
- Calculo automatico de score 0-100 para cada socio ativo
- Formula: inicia em 100, -15 por atrasado, -20 por faltante, -5 por pendente, +2 por pago (cap 0-100)
- Classificacoes: Bom Pagador (70+), Risco Medio (40-69), Alto Risco (0-39)
- 4 cards de resumo: Score Medio, Bons Pagadores, Risco Medio, Alto Risco
- Tabela com: score colorido, classificacao, pagos, atrasados, pendentes, faltantes, pontualidade %, sequencia de pagamentos
- Busca e filtro por nivel de risco

### 5. WhatsApp (`/dashboard/whatsapp`)
- Integracao com Evolution API para conexao direta pelo sistema
- Botao "Gerar QR Code" que busca QR da Evolution API
- Exibe QR Code como imagem base64 na tela
- Polling automatico a cada 3 segundos para detectar conexao
- Auto-criacao de instancia se nao existir (POST /instance/create)
- Botao de desconectar com log de auditoria
- Card de status (conectado/desconectado) com badge
- Instrucoes passo a passo para o usuario
- Envio automatico: notificacoes de pagamento, aniversario, lembretes, avisos de atraso

### 6. Logs de Auditoria (`/dashboard/logs`) - Admin only
- Registro automatico de todas as acoes do sistema
- Tabela paginada (30/pagina): data/hora, usuario, cargo, acao, entidade, ID
- Filtro por tipo de entidade (Payment, Member, User, SystemSettings)
- Dialog de detalhes com JSON completo das alteracoes (antes/depois)
- Somente ADMIN e SUPER_ADMIN tem acesso

### 7. Gestao de Usuarios (`/dashboard/usuarios`) - Admin only
- Listagem de todos os usuarios com contadores de atividade
- Legenda com descricao dos 5 cargos
- Criar usuario: nome, email, senha, cargo
- Editar usuario: alterar dados, cargo, senha (opcional)
- Ativar/desativar usuario (nao pode desativar a si mesmo)
- Hierarquia de cargos: so SUPER_ADMIN cria ADMIN ou SUPER_ADMIN
- Tabela: nome, email, cargo (badge colorido), status, socios criados, pagamentos, acoes, data criacao

### 8. Configuracoes (`/dashboard/configuracoes`)
- **Configuracoes Financeiras**: editar valor mensalidade (R$) e dia de vencimento (1-31)
- **Modulos Ativos** (5 modulos):
  - Hospedagem do Sistema - R$39,90/mes
  - Subdominio Personalizado - R$9,90/mes
  - WhatsApp (Evolution API) - R$29,90/mes
  - Mensagens de Aniversario - R$19,90/mes
  - Lembretes de Pagamento - R$19,90/mes
- **Modulos Disponiveis para Aquisicao** (8 modulos):
  - Graficos e Analytics - R$49,90
  - Relatorios em PDF - R$39,90
  - App Instalavel (PWA) - R$39,90
  - Acoes em Massa - R$39,90
  - Exportacao Excel/CSV - R$29,90
  - Tema Escuro (Dark Mode) - R$29,90
  - Monitoramento em Tempo Real - R$29,90
  - Validacao Avancada de CPF - R$19,90
- **Modulos Em Breve** (5 modulos):
  - Gateway de Pagamento - R$59,90
  - Planos Diferenciados - R$49,90
  - Personalizacao Visual - R$49,90
  - Check-in em Eventos - R$39,90
  - Gestao de Beneficios - R$29,90
- Botao "Adquirir Modulo" abre dialog com recursos inclusos e botao WhatsApp

### 9. Perfil (`/dashboard/perfil`)
- Visualizacao de nome, email e cargo do usuario logado
- Formulario de alteracao de senha (senha atual + nova + confirmacao)

### 10. Suporte (`/dashboard/suporte`)
- Central de ajuda com FAQ de 8 secoes (uma por modulo)
- Perguntas e respostas detalhadas com passo a passo
- Busca por texto nas perguntas/respostas
- Secoes colapsaveis (accordion)
- Grid de navegacao rapida
- Botao de contato via WhatsApp

### 11. Cron Job (`/api/cron`)
- Endpoint para execucao diaria automatica
- Envia mensagens de aniversario via WhatsApp
- Envia lembretes de pagamento proximo do vencimento
- Protegido por CRON_SECRET
- Configurar em cron-job.org: `GET https://guarany.creativenext.com.br/api/cron?secret=<CRON_SECRET>` diariamente as 8h (America/Sao_Paulo)

---

## Sistema de Permissoes (5 Cargos)

| Funcionalidade | Super Admin | Admin | Financeiro | Atendimento | Operador |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | x | x | x | x | x |
| Socios | x | x | x | x | x |
| Pagamentos | x | x | x | x | x |
| Score | x | x | x | x | x |
| WhatsApp | x | x | x | x | x |
| Config | x | x | x | x | x |
| Suporte | x | x | x | x | x |
| Perfil | x | x | x | x | x |
| Logs | x | x | - | - | - |
| Usuarios | x | x | - | - | - |
| Criar Admin | x | - | - | - | - |
| Criar Super Admin | x | - | - | - | - |

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── setup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Layout com sidebar lateral
│   │   └── dashboard/
│   │       ├── page.tsx                  # Dashboard principal
│   │       ├── configuracoes/page.tsx    # Configuracoes + modulos
│   │       ├── logs/page.tsx             # Logs de auditoria
│   │       ├── pagamentos/page.tsx       # Grade de pagamentos
│   │       ├── perfil/page.tsx           # Perfil do usuario
│   │       ├── score/page.tsx            # Score inadimplencia
│   │       ├── socios/
│   │       │   ├── page.tsx              # Lista de socios
│   │       │   ├── novo/page.tsx         # Novo socio
│   │       │   └── [id]/page.tsx         # Detalhe/editar socio
│   │       ├── suporte/page.tsx          # Central de ajuda
│   │       ├── usuarios/page.tsx         # Gestao de usuarios
│   │       └── whatsapp/page.tsx         # Conexao WhatsApp
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── audit-logs/route.ts           # GET logs (admin)
│   │   ├── cron/route.ts                 # Job diario
│   │   ├── dashboard/stats/route.ts      # KPIs do dashboard
│   │   ├── members/
│   │   │   ├── route.ts                  # GET list, POST create
│   │   │   ├── [id]/route.ts             # GET, PUT, DELETE
│   │   │   └── score/route.ts            # GET score calculo
│   │   ├── payments/
│   │   │   ├── route.ts                  # GET list, POST create
│   │   │   ├── [id]/route.ts             # PUT, DELETE
│   │   │   └── grid/route.ts             # GET grade mensal
│   │   ├── settings/route.ts             # GET, PUT config
│   │   ├── setup/route.ts               # POST primeiro admin
│   │   ├── user/change-password/route.ts # PUT alterar senha
│   │   ├── users/
│   │   │   ├── route.ts                  # GET list, POST create
│   │   │   └── [id]/route.ts             # PUT update
│   │   └── whatsapp/
│   │       ├── disconnect/route.ts       # POST desconectar
│   │       ├── qrcode/route.ts           # GET QR code
│   │       └── status/route.ts           # GET status conexao
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                          # Redirect para /dashboard
├── components/
│   ├── providers/SessionProvider.tsx
│   └── ui/                               # 15+ componentes shadcn/ui
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── auth.ts                           # Config NextAuth (credentials, JWT)
│   ├── db-migrate.ts                     # Migracao runtime de enums
│   ├── prisma.ts                         # Prisma client singleton
│   ├── utils.ts                          # cn() helper
│   ├── utils/cpf.ts                      # Formatacao/validacao CPF
│   └── whatsapp.ts                       # Evolution API client
├── middleware.ts                          # Protecao de rotas
└── types/
    └── next-auth.d.ts                    # Tipagem NextAuth (id, role)

prisma/
├── schema.prisma                         # Schema completo
├── seed.ts                               # Seed do admin inicial
└── migrations/
    └── 0_init/migration.sql              # Migracao inicial
```

---

## Banco de Dados (PostgreSQL)

### Modelos

| Tabela | Descricao |
|---|---|
| `users` | Usuarios do sistema (5 cargos) |
| `members` | Socios torcedores |
| `payments` | Pagamentos mensais |
| `system_settings` | Configuracoes (singleton) |
| `notification_logs` | Logs de envio WhatsApp |
| `audit_logs` | Auditoria de acoes |

### Enums

| Enum | Valores |
|---|---|
| `UserRole` | SUPER_ADMIN, ADMIN, FINANCIAL, ATTENDANT, OPERATOR |
| `PaymentMethod` | PIX, CASH, CARD, BOLETO |
| `PaymentStatus` | PENDING, PAID, OVERDUE, CANCELLED |
| `NotificationType` | BIRTHDAY, PAYMENT_REMINDER, PAYMENT_OVERDUE, WELCOME |
| `NotificationStatus` | PENDING, SENT, FAILED |

### Relacoes principais

- `User` 1:N `Member` (createdBy)
- `User` 1:N `Payment` (registeredBy)
- `User` 1:N `AuditLog`
- `Member` 1:N `Payment` (cascade delete)
- `Member` 1:N `NotificationLog` (set null)
- `Payment` unique constraint: `[memberId, referenceMonth, referenceYear]`

---

## Variaveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/guarany_fc"

# NextAuth
NEXTAUTH_URL="https://guarany.creativenext.com.br"
NEXTAUTH_SECRET="chave-secreta-min-32-chars"

# Evolution API (WhatsApp)
EVOLUTION_API_URL="https://evolution.creativenext.com.br"
EVOLUTION_API_KEY="sua-api-key"
EVOLUTION_INSTANCE="GUARANYPDF"

# Cron
CRON_SECRET="sua-secret-cron"

# App
NODE_ENV="production"
```

---

## Instalacao Local

```bash
git clone https://github.com/LisboaCodes/guarany-fc.git
cd guarany-fc
npm install
cp .env.example .env.local
# Edite .env.local com suas configuracoes
npx prisma db push
npm run db:seed
npm run dev
```

Acesse: http://localhost:3000

---

## Deploy (Coolify)

**Servidor**: Coolify v4
**Build**: Nixpacks (auto-detect Node.js)
**Proxy**: Traefik com SSL Let's Encrypt
**Dominio**: guarany.creativenext.com.br

### Scripts

```bash
npm run build       # prisma generate && next build
npm start           # next start
npm run db:seed     # tsx prisma/seed.ts
npm run db:studio   # prisma studio
```

### Primeiro Acesso

1. Acesse `/setup` para criar o primeiro usuario SUPER_ADMIN
2. Login em `/login` com email e senha criados

---

## Navegacao (Sidebar Lateral)

| Menu | Rota | Icone | Acesso |
|---|---|---|---|
| Dashboard | /dashboard | LayoutDashboard | Todos |
| Socios | /dashboard/socios | Users | Todos |
| Pagamentos | /dashboard/pagamentos | DollarSign | Todos |
| Score | /dashboard/score | BarChart3 | Todos |
| WhatsApp | /dashboard/whatsapp | MessageSquare | Todos |
| Logs | /dashboard/logs | FileText | Admin+ |
| Usuarios | /dashboard/usuarios | UserCog | Admin+ |
| Config | /dashboard/configuracoes | Settings | Todos |
| Suporte | /dashboard/suporte | HelpCircle | Todos |

Sidebar com:
- Logo AA Guarany no topo
- Botao de recolher/expandir (desktop)
- Menu hamburger (mobile) com overlay
- Usuario + cargo na parte inferior
- Dropdown: Meu Perfil, Sair

---

## API Routes

| Rota | Metodo | Descricao |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Handler NextAuth |
| `/api/setup` | POST | Criar primeiro admin |
| `/api/dashboard/stats` | GET | KPIs + atividade recente |
| `/api/members` | GET, POST | Listar/criar socios |
| `/api/members/[id]` | GET, PUT | Detalhe/editar socio |
| `/api/members/score` | GET | Score de inadimplencia |
| `/api/payments` | GET, POST | Listar/criar pagamentos |
| `/api/payments/[id]` | PUT, DELETE | Editar/excluir pagamento |
| `/api/payments/grid` | GET | Grade mensal completa |
| `/api/settings` | GET, PUT | Configuracoes do sistema |
| `/api/users` | GET, POST | Listar/criar usuarios |
| `/api/users/[id]` | PUT | Editar usuario |
| `/api/user/change-password` | PUT | Alterar propria senha |
| `/api/audit-logs` | GET | Logs de auditoria |
| `/api/whatsapp/status` | GET | Status conexao WhatsApp |
| `/api/whatsapp/qrcode` | GET | QR Code para conexao |
| `/api/whatsapp/disconnect` | POST | Desconectar WhatsApp |
| `/api/cron` | GET | Job diario (aniversarios + lembretes) |

---

## Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Cannot connect to database"
- Verifique `DATABASE_URL` no `.env.local`
- PostgreSQL rodando e acessivel
- Banco `guarany_fc` existe
- Credenciais corretas

### "NextAuth configuration error"
- `NEXTAUTH_URL` configurada com protocolo (https://)
- `NEXTAUTH_SECRET` com 32+ caracteres

### QR Code WhatsApp retorna 500
- Verifique `EVOLUTION_INSTANCE` (nome exato da instancia)
- Verifique `EVOLUTION_API_URL` e `EVOLUTION_API_KEY`
- Evolution API acessivel e rodando

### SSL/HTTPS nao funciona
- FQDN no Coolify deve usar `https://`
- Traefik proxy deve estar rodando
- `NEXTAUTH_URL` deve ser `https://`

---

## Licenca

Todos os direitos reservados - Associacao Atletica Guarany 2026

Desenvolvido por [CreativeNext](https://creativenext.com.br)
