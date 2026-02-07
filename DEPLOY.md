# 🚀 Deploy no Coolify - Guarany FC

Guia completo para fazer deploy da aplicação Guarany FC no Coolify.

## 📋 Pré-requisitos

- Conta no Coolify configurada
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Domínio configurado (opcional)

## 🗄️ Passo 1: Criar Banco de Dados PostgreSQL

1. No Coolify, vá em **Databases** > **+ New Database**
2. Selecione **PostgreSQL**
3. Configure:
   - **Name:** `guarany-postgres`
   - **Version:** `16` (ou mais recente)
   - **Database Name:** `guarany_fc`
   - **Username:** `postgres` (ou personalizado)
   - **Password:** Gere uma senha forte
4. Clique em **Create**
5. **Salve as credenciais** para usar no próximo passo

## 📦 Passo 2: Criar Aplicação

1. No Coolify, vá em **Projects** > Seu projeto > **+ New Resource**
2. Selecione **Public Repository** ou **Private Repository**
3. Cole a URL do seu repositório Git
4. Configure:
   - **Branch:** `main` (ou sua branch principal)
   - **Build Pack:** Dockerfile
   - **Port:** `3000`

## 🔐 Passo 3: Configurar Variáveis de Ambiente

No painel da aplicação, vá em **Environment Variables** e adicione:

### Database
```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/guarany_fc
```
> **Importante:** Substitua pelos dados do banco criado no Passo 1
> - HOST: Use o hostname interno do Coolify (ex: `guarany-postgres`)

### NextAuth
```env
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=gere-um-secret-seguro-aqui
```
> **Gerar NEXTAUTH_SECRET:**
> ```bash
> openssl rand -base64 32
> ```

### Evolution API (WhatsApp)
```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE=sua-instancia
```

### Cron Security
```env
CRON_SECRET=gere-um-secret-aleatorio
```

### App
```env
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Guarany FC
```

## 🔨 Passo 4: Build Commands

No Coolify, configure os comandos:

### Build Command (se necessário)
```bash
npm ci && npx prisma generate && npm run build
```

### Start Command
```bash
node server.js
```

> **Nota:** O Dockerfile já cuida do build, então isso é opcional.

## 🗃️ Passo 5: Executar Migrations

Após o primeiro deploy, você precisa executar as migrations do Prisma.

### Opção 1: Via Coolify Terminal
1. Vá no painel da aplicação
2. Clique em **Terminal**
3. Execute:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Opção 2: Adicionar Script de Startup
Edite o Dockerfile e adicione antes do CMD:

```dockerfile
# Executar migrations no startup (adicione antes do CMD)
RUN echo '#!/bin/sh\nnpx prisma migrate deploy\nnode server.js' > /app/start.sh
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
```

## 👤 Passo 6: Criar Usuário Admin

Após rodar o seed, você terá:

**Credenciais do Admin:**
- Email: `admin@guarany.com`
- Senha: `Admin123!`

> **Importante:** Troque a senha após o primeiro login!

## 🌐 Passo 7: Configurar Domínio (Opcional)

1. No painel da aplicação, vá em **Domains**
2. Adicione seu domínio personalizado
3. Configure o DNS no seu provedor:
   - Tipo: `A` ou `CNAME`
   - Valor: IP/hostname fornecido pelo Coolify
4. Espere a propagação do DNS (até 24h)
5. O Coolify gerará automaticamente o certificado SSL

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Banco de dados PostgreSQL criado e funcionando
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Aplicação fez build com sucesso
- [ ] Migrations executadas (`prisma migrate deploy`)
- [ ] Seed executado (usuário admin criado)
- [ ] Login funcionando em produção
- [ ] SSL/HTTPS funcionando (se usar domínio)
- [ ] Evolution API conectada (se aplicável)

## 🔧 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o DATABASE_URL está correto
- Confirme que o hostname do banco está acessível
- Use o hostname interno do Coolify (ex: `guarany-postgres`)

### Erro: "Prisma Client not generated"
- Execute `npx prisma generate` antes do build
- Verifique se o postinstall está no package.json

### Aplicação não inicia
- Verifique os logs no Coolify
- Confirme que a porta 3000 está configurada
- Verifique se todas as variáveis de ambiente estão definidas

### Migration falha
- Execute manualmente via terminal do Coolify
- Verifique se o DATABASE_URL está correto
- Confirme que o banco está acessível

## 📊 Monitoramento

Após o deploy, monitore:
- **Logs:** Painel do Coolify > Application > Logs
- **Métricas:** CPU, Memória, Rede
- **Banco de Dados:** Conexões ativas, tamanho

## 🔄 Atualizações

Para atualizar a aplicação:
1. Faça push das mudanças para o repositório
2. O Coolify detectará e fará rebuild automático
3. Ou force um redeploy no painel do Coolify

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Coolify
2. Consulte a documentação oficial: https://coolify.io/docs
3. Verifique as issues do projeto

---

**Pronto!** Sua aplicação Guarany FC está rodando no Coolify! 🎉
