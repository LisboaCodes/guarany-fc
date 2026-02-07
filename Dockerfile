# Dockerfile para Next.js com Prisma - Otimizado para Coolify
FROM node:20-alpine AS base

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 1. Instalar dependências
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# 2. Build da aplicação
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build do Next.js
RUN npm run build

# 3. Imagem de produção
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar build do Next.js (standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma schema e migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Iniciar aplicação
CMD ["node", "server.js"]
