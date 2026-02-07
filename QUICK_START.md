# Quick Start - Guarany FC

## 🎉 Setup Inicial Completo!

As **Fases 1 e 2** do plano de implementação estão completas:
- ✅ Projeto Next.js configurado
- ✅ Todas as dependências instaladas
- ✅ Banco de dados configurado (Prisma + PostgreSQL)
- ✅ Autenticação NextAuth implementada
- ✅ Login funcional com roles (ADMIN/OPERATOR)
- ✅ Dashboard básico criado

## 🚀 Como Iniciar o Projeto

### Passo 1: Iniciar PostgreSQL

Certifique-se de que o **Docker Desktop está rodando**, depois execute:

```bash
docker-compose up -d
```

Verifique se o container está rodando:
```bash
docker ps
```

Você deve ver algo como:
```
CONTAINER ID   IMAGE               NAMES
xxxxx          postgres:16-alpine  guarany-postgres
```

### Passo 2: Executar Migrations do Prisma

```bash
npm run db:migrate
```

Quando perguntado o nome da migration, digite: `init`

Isso irá:
- Criar todas as tabelas no banco
- Gerar os types do Prisma Client

### Passo 3: Popular Banco com Dados Iniciais

```bash
npm run db:seed
```

Isso irá criar:
- ✅ Usuário Admin
  - Email: `admin@guarany.com`
  - Senha: `Admin123!`
- ✅ Configurações padrão do sistema
  - Mensalidade: R$ 50,00
  - Dia de vencimento: 10
  - Templates de mensagens WhatsApp

### Passo 4: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 🔐 Testando a Autenticação

1. Ao acessar http://localhost:3000, você será redirecionado para `/login`
2. Use as credenciais:
   - **Email:** `admin@guarany.com`
   - **Senha:** `Admin123!`
3. Após login, você será redirecionado para `/dashboard`
4. O dashboard mostrará:
   - Header com nome do usuário e botão de logout
   - Cards de métricas (ainda vazios - aguardando APIs)
   - Status do sistema
   - Próximos passos

## 📂 Estrutura do Projeto

```
guarany-fc/
├── prisma/
│   ├── schema.prisma          # ✅ Schema completo do banco
│   ├── seed.ts                # ✅ Seed do admin
│   └── migrations/            # Será criado após migration
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # ✅ Página de login
│   │   ├── (dashboard)/       # ✅ Layout e dashboard
│   │   └── api/auth/          # ✅ NextAuth routes
│   ├── components/
│   │   └── providers/         # ✅ Session provider
│   ├── lib/
│   │   ├── auth.ts            # ✅ Configuração NextAuth
│   │   ├── prisma.ts          # ✅ Prisma client
│   │   └── utils/             # ✅ CPF, formatação
│   └── types/
│       └── next-auth.d.ts     # ✅ Types do NextAuth
└── package.json               # ✅ Scripts configurados
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev         # Servidor de desenvolvimento (porta 3000)
npm run build       # Build para produção
npm start           # Servidor de produção
npm run db:migrate  # Executar migrations
npm run db:seed     # Popular banco com dados
npm run db:studio   # Prisma Studio (GUI do banco)
npm run db:reset    # RESETAR banco (CUIDADO!)
```

## 📋 Próximas Etapas (Fase 3)

Agora você pode continuar com a **Fase 3: API de Sócios**:

### Arquivos a Criar:

1. **src/lib/validations/member.ts**
   - Schemas Zod para validação de membros
   - Validação de CPF integrada

2. **src/app/api/members/route.ts** ⭐
   - GET: listar sócios (com filtros e paginação)
   - POST: criar novo sócio

3. **src/app/api/members/[id]/route.ts**
   - GET: detalhes do sócio
   - PATCH: atualizar sócio
   - DELETE: desativar sócio (soft delete)

4. **src/app/api/members/stats/route.ts**
   - Estatísticas de sócios (total, ativos, etc.)

### Exemplo de Implementação (API Members):

```typescript
// src/lib/validations/member.ts
import { z } from 'zod'
import { validateCPF } from '@/lib/utils/cpf'

export const createMemberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().refine(validateCPF, 'CPF inválido'),
  birthDate: z.string().transform((val) => new Date(val)),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
})

export const updateMemberSchema = createMemberSchema.partial()
```

## 🔍 Verificando o Banco de Dados

Para visualizar o banco de dados graficamente:

```bash
npm run db:studio
```

Isso abrirá o **Prisma Studio** em http://localhost:5555

Você poderá:
- Ver todas as tabelas
- Editar dados manualmente
- Executar queries visuais

## 🐛 Troubleshooting

### Erro: "Docker não está rodando"

```bash
# Inicie o Docker Desktop manualmente e aguarde
# Depois execute:
docker-compose up -d
```

### Erro: "Porta 3000 já está em uso"

```bash
# Windows - Encontrar processo na porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua <PID>)
taskkill /PID <PID> /F

# Ou use outra porta
PORT=3001 npm run dev
```

### Erro ao executar migrations

```bash
# Verificar se PostgreSQL está rodando
docker ps

# Se não estiver, inicie:
docker-compose up -d

# Aguarde 5 segundos e tente novamente
npm run db:migrate
```

### Erro: "Cannot find module '@prisma/client'"

```bash
# Gerar Prisma Client
npx prisma generate
```

## 📊 Modelo de Dados Atual

### Tabelas Criadas:

1. **users** - Usuários do sistema (Admin/Operador)
2. **members** - Sócios torcedores
3. **payments** - Pagamentos mensais
4. **system_settings** - Configurações (singleton)
5. **notification_logs** - Log de mensagens WhatsApp
6. **audit_logs** - Auditoria de ações

### Relacionamentos:

- User → Member (quem criou o sócio)
- User → Payment (quem registrou o pagamento)
- Member → Payment (pagamentos do sócio)
- Member → NotificationLog (mensagens enviadas)

## 🎯 Checklist de Validação

Antes de continuar para a Fase 3, verifique:

- [ ] PostgreSQL está rodando (`docker ps`)
- [ ] Migrations executadas (`npm run db:migrate`)
- [ ] Seed executado (`npm run db:seed`)
- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Login funciona com admin@guarany.com
- [ ] Dashboard é exibido após login
- [ ] Logout funciona corretamente
- [ ] Prisma Studio abre e mostra tabelas (`npm run db:studio`)

## 📚 Recursos Úteis

- [Documentação Next.js 14](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação NextAuth.js](https://next-auth.js.org)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)

## 💡 Dicas

1. **Use o Prisma Studio** para verificar dados enquanto desenvolve
2. **Veja os logs do servidor** para debugar problemas
3. **Leia IMPLEMENTATION_STATUS.md** para ver progresso detalhado
4. **Consulte o README.md** para documentação completa

---

**Tudo pronto para começar o desenvolvimento! 🟢⚪⚽**

Próxima fase: Implementar a API de Sócios (Fase 3)
