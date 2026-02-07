-- Script para criar o banco de dados guarany_fc no PostgreSQL do Coolify
-- Execute este comando conectado ao banco 'postgres' como usuário 'filehub'

CREATE DATABASE guarany_fc
    WITH
    OWNER = filehub
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Garantir permissões
GRANT ALL PRIVILEGES ON DATABASE guarany_fc TO filehub;
