import { testConnection } from './src/lib/db.js'; // extensão .js mesmo

testConnection().then((ok) => {
  if (ok) {
    console.log('✅ Conexão com o banco funcionando!');
  } else {
    console.error('❌ Falha ao conectar com o banco de dados.');
  }
});
