const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Vendas rodando com sucesso!' });
});

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('Erro na consulta de healthcheck:', error.message);
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// --- ROTAS DO CRUD DE PRODUTOS ---

// 1. Criar Produto (POST)
app.post('/produtos', async (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, preco, quantidade_estoque || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar produto.', details: error.message });
  }
});

// 2. Listar Todos os Produtos (GET)
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos.', details: error.message });
  }
});

// 3. Buscar Produto por ID (GET)
app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto.', details: error.message });
  }
});

// 4. Atualizar Produto (PUT)
app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  try {
    const result = await pool.query(
      'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, quantidade_estoque = $4 WHERE id = $5 RETURNING *',
      [nome, descricao, preco, quantidade_estoque, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado para atualização.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto.', details: error.message });
  }
});

// 5. Deletar Produto (DELETE)
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado para remoção.' });
    }
    res.json({ message: 'Produto removido com sucesso.', produto: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});