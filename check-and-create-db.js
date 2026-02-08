const { Client } = require('pg');

async function checkAndCreateDatabase() {
  // Conectar ao banco postgres
  const adminClient = new Client({
    host: '201.23.70.201',
    port: 5432,
    user: 'filehub',
    password: 'FileHub2024@Secure!Pass',
    database: 'filehub' // Conectar ao banco filehub que sabemos que existe
  });

  try {
    await adminClient.connect();
    console.log('✅ Conectado ao PostgreSQL!');

    // Verificar se o banco guarany_fc existe
    const checkResult = await adminClient.query(`
      SELECT datname FROM pg_database WHERE datname = 'guarany_fc'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Banco de dados guarany_fc já existe!');
    } else {
      console.log('⚠️  Banco guarany_fc não existe. Tentando criar...');

      // Fechar conexão atual
      await adminClient.end();

      // Conectar ao banco postgres para criar
      const createClient = new Client({
        host: '201.23.70.201',
        port: 5432,
        user: 'filehub',
        password: 'FileHub2024@Secure!Pass',
        database: 'postgres'
      });

      await createClient.connect();

      // Tentar criar (pode falhar se não tiver permissão)
      try {
        await createClient.query('CREATE DATABASE guarany_fc OWNER filehub');
        console.log('✅ Banco guarany_fc criado com sucesso!');
      } catch (err) {
        console.log('❌ Erro ao criar banco:', err.message);
        console.log('⚠️  Use o pgAdmin ou terminal do Coolify como superuser');
      }

      await createClient.end();
      return;
    }

    await adminClient.end();

    // Agora conectar ao banco guarany_fc e verificar tabelas
    console.log('\n📊 Verificando tabelas no banco guarany_fc...');

    const dbClient = new Client({
      host: '201.23.70.201',
      port: 5432,
      user: 'filehub',
      password: 'FileHub2024@Secure!Pass',
      database: 'guarany_fc'
    });

    await dbClient.connect();

    const tablesResult = await dbClient.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Banco existe mas não tem tabelas!');
      console.log('📝 Execute: npx prisma migrate deploy');
    } else {
      console.log('✅ Tabelas encontradas:');
      tablesResult.rows.forEach(row => console.log('  -', row.tablename));

      // Verificar usuário admin
      const userResult = await dbClient.query('SELECT email, name, role FROM "User" LIMIT 5');
      if (userResult.rows.length === 0) {
        console.log('\n⚠️  Nenhum usuário encontrado!');
        console.log('📝 Execute: npx prisma db seed');
      } else {
        console.log('\n✅ Usuários encontrados:');
        userResult.rows.forEach(user => console.log('  -', user.email, `(${user.role})`));
      }
    }

    await dbClient.end();
    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    try { await adminClient.end(); } catch {}
    process.exit(1);
  }
}

checkAndCreateDatabase();
