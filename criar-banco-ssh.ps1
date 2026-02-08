# Script para criar banco guarany_fc via SSH
Write-Host "🚀 Criando banco guarany_fc..." -ForegroundColor Green

# Encontrar container PostgreSQL
$containerName = ssh -i $env:USERPROFILE\.ssh\servidorbr01 ubuntu@201.23.70.201 "docker ps --format '{{.Names}}' | grep postgres | head -1"

Write-Host "📦 Container PostgreSQL: $containerName" -ForegroundColor Cyan

# Criar banco
ssh -i $env:USERPROFILE\.ssh\servidorbr01 ubuntu@201.23.70.201 "docker exec $containerName psql -U postgres -c 'CREATE DATABASE guarany_fc OWNER filehub;'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Banco guarany_fc criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 DATABASE_URL para usar no Coolify:" -ForegroundColor Yellow
    Write-Host "postgresql://filehub:FileHub2024@Secure!Pass@kg8cwk8kw0ggcooog0w0kws0:5432/guarany_fc" -ForegroundColor White
} else {
    Write-Host "❌ Erro ao criar banco. Verifique os logs acima." -ForegroundColor Red
}
