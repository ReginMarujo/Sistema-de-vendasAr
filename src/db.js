const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/vendas_db'
});

// Inicializa a tabela no banco ao carregar
const initDb = async () => {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Tabela de produtos verificada/criada com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error.message);
  }
};

initDb();

module.exports = pool;