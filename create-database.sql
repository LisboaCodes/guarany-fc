-- Criar banco de dados guarany_fc
CREATE DATABASE guarany_fc
    WITH
    OWNER = filehub
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Comentário
COMMENT ON DATABASE guarany_fc
    IS 'Sistema de Sócio Torcedor - Guarany FC';
