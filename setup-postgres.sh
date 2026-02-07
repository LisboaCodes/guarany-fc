#!/bin/bash
# Script para criar PostgreSQL dedicado para Guarany FC

echo "🚀 Criando PostgreSQL dedicado para Guarany FC..."

# Subir o PostgreSQL
docker-compose -f docker-compose.postgres.yml up -d

echo "⏳ Aguardando PostgreSQL iniciar..."
sleep 10

# Verificar se está rodando
if docker ps | grep -q guarany-postgres; then
    echo "✅ PostgreSQL criado com sucesso!"
    echo ""
    echo "📋 Credenciais:"
    echo "Host Interno: guarany-postgres"
    echo "Host Externo: 201.23.70.201:5433"
    echo "Database: guarany_fc"
    echo "User: guarany_user"
    echo "Password: Guarany2024!Secure"
    echo ""
    echo "🔗 DATABASE_URL (interno Coolify):"
    echo "postgresql://guarany_user:Guarany2024!Secure@guarany-postgres:5432/guarany_fc"
    echo ""
    echo "🔗 DATABASE_URL (externo):"
    echo "postgresql://guarany_user:Guarany2024!Secure@201.23.70.201:5433/guarany_fc"
else
    echo "❌ Erro ao criar PostgreSQL"
    docker-compose -f docker-compose.postgres.yml logs
fi
