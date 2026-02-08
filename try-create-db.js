const { Client } = require('pg');

const passwords = [
  'postgres',
  'Mel102424',
  'Mel102424!@#',
  'FileHub2024@Secure!Pass',
  'password',
  'admin',
  ''
];

async function tryCreateDatabase() {
  for (const password of passwords) {
    console.log(`\n🔍 Tentando senha: ${password.substring(0, 3)}***`);

    const client = new Client({
      host: '201.23.70.201',
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'postgres'
    });

    try {
      await client.connect();
      console.log('✅ CONECTOU! Senha correta:', password);

      // Verificar se banco existe
      const checkDb = await client.query(
        "SELECT 1 FROM pg_database WHERE datname='guarany_fc'"
      );

      if (checkDb.rows.length > 0) {
        console.log('✅ Banco guarany_fc já existe!');
      } else {
        // Criar banco
        await client.query('CREATE DATABASE guarany_fc OWNER filehub');
        console.log('✅ Banco guarany_fc criado com sucesso!');
      }

      await client.end();
      break;
    } catch (error) {
      if (!error.message.includes('authentication failed')) {
        console.log('❌ Erro:', error.message);
      }
      try { await client.end(); } catch {}
    }
  }
}

tryCreateDatabase();
