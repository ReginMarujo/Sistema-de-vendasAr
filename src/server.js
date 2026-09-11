const express = require('express');
const bcrypt = require('bcryptjs');
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

// --- ROTA DE CADASTRO DE USUÁRIO ---
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    // Verifica se o e-mail já está cadastrado
    const usuarioExistente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    // Criptografa a senha antes de salvar no banco
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senhaHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.', details: error.message });
  }
});

// --- ROTAS DO CRUD DE PRODUTOS ---

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

app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos.', details: error.message });
  }
});

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