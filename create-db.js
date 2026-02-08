const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    host: '201.23.70.201',
    port: 5432,
    user: 'postgres',
    password: 'FileHub2024@Secure!Pass', // Tentando a mesma senha
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL!');

    // Verificar se banco existe
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='guarany_fc'"
    );

    if (checkDb.rows.length > 0) {
      console.log('✅ Banco de dados guarany_fc já existe!');
    } else {
      // Criar banco de dados
      await client.query('CREATE DATABASE guarany_fc OWNER filehub;');
      console.log('✅ Banco de dados guarany_fc criado com sucesso!');
    }

    await client.end();
    console.log('✅ Concluído!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    try { await client.end(); } catch {}
    process.exit(1);
  }
}

createDatabase();
