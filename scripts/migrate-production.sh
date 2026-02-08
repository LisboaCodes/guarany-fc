#!/bin/bash

# Script para aplicar migrações no banco de produção
# Execute este script no container do Docker

echo "🚀 Aplicando migrações no banco de dados..."

# Aplicar migrações
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrações aplicadas com sucesso!"
    echo ""
    echo "📊 Verificando o banco de dados..."
    npx prisma db pull --print
else
    echo "❌ Erro ao aplicar migrações"
    exit 1
fi
