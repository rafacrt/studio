
import mysql from 'mysql2/promise';
import 'dotenv/config';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Default to empty password if not set, common for local XAMPP
  database: process.env.DB_DATABASE || 'freelaos_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  connectTimeout: 10000, // Add connection timeout
};

// Log the configuration on module load for easier debugging
// Be cautious with logging passwords in production environments.
console.log('[DB Init] Configuração do banco de dados:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    passwordProvided: !!process.env.DB_PASSWORD, // Log if password was provided via .env
});


const pool = mysql.createPool(dbConfig);

pool.on('error', (err) => {
  console.error('[DB Pool Error] Erro inesperado no pool de conexões:', err);
});

export const testConnection = async () => {
  let connection;
  try {
    console.log(`[DB Test] Tentando conectar com: host=${dbConfig.host}, port=${dbConfig.port}, user=${dbConfig.user}, database=${dbConfig.database}`);
    connection = await pool.getConnection();
    console.log('✅ Conectado ao banco MySQL com sucesso usando o pool.');
    // Perform a simple query to ensure the database is responsive
    await connection.query('SELECT 1');
    console.log('✅ Query de teste ("SELECT 1") executada com sucesso.');
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao conectar ou testar o banco MySQL usando o pool.');
    console.error(`   Erro: ${error.message}`);
    if (error.code) {
        console.error(`   Código do Erro: ${error.code}`);
        if (error.code === 'ECONNREFUSED') {
            console.error(`   👉 ECONNREFUSED: A conexão foi recusada pelo servidor em ${dbConfig.host}:${dbConfig.port}.`);
            console.error('      Verifique se:');
            console.error('      1. O servidor MySQL (ex: XAMPP, WAMP, Docker) está INICIADO.');
            console.error(`      2. O MySQL está configurado para aceitar conexões no endereço ${dbConfig.host} e porta ${dbConfig.port}.`);
            console.error('      3. Não há um firewall bloqueando a conexão.');
            console.error('      4. As variáveis de ambiente (DB_HOST, DB_PORT) no arquivo .env (ou .env.local) estão corretas.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error(`   👉 ER_ACCESS_DENIED_ERROR: Acesso negado para o usuário '${dbConfig.user}'@'${error.address || dbConfig.host}'.`);
            console.error('      Verifique se:');
            console.error(`      1. O usuário '${dbConfig.user}' existe no MySQL.`);
            console.error('      2. A senha fornecida (se houver, verifique DB_PASSWORD no .env) está correta.');
            console.error(`      3. O usuário '${dbConfig.user}' tem permissão para se conectar a partir do host da sua aplicação.`);
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`   👉 ER_BAD_DB_ERROR: O banco de dados "${dbConfig.database}" não existe.`);
            console.error('      Verifique se o nome do banco de dados (DB_DATABASE no .env) está correto e se o banco foi criado.');
        } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('   👉 PROTOCOL_CONNECTION_LOST: A conexão com o servidor MySQL foi perdida. Isso pode ser devido a um timeout ou reinício do servidor.');
        } else if (error.code === 'ENOTFOUND') {
             console.error(`   👉 ENOTFOUND: O host especificado "${dbConfig.host}" não pôde ser resolvido. Verifique o nome do host e a conectividade de rede/DNS.`);
        }
    }
    if (error.errno) console.error(`   Número do Erro (errno): ${error.errno}`);
    if (error.sqlState) console.error(`   SQLState: ${error.sqlState}`);
    return false;
  } finally {
    if (connection) {
      connection.release();
      console.log('🔚 Conexão de teste com o banco liberada.');
    }
  }
};

export default pool;
