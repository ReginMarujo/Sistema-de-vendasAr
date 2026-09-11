const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { autenticar } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

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

// --- ROTA DE CADASTRO DE USUÁRIO (ISSUE #6) ---
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const usuarioExistente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

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

// --- ROTA DE LOGIN E SESSÃO ---
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // Busca o usuário no banco
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];

    // Valida a senha comparando com o hash do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gera o token JWT para autenticação da sessão (expira em 8h)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error.message);
    res.status(500).json({ error: 'Erro ao realizar login.', details: error.message });
  }
});

// --- ROTAS DO CRUD DE PRODUTOS (ISSUE #7 - ROTAS PROTEGIDAS, ISSUE #8 - CADASTRO, ISSUE #9 - LISTAGEM) ---

/**
 * POST /produtos - Criar novo produto (PROTEGIDO - ISSUE #8)
 * Requer autenticação via token JWT
 * 
 * Body:
 * {
 *   "nome": "string",
 *   "descricao": "string",
 *   "preco": number,
 *   "quantidade_estoque": number (opcional)
 * }
 */
app.post('/produtos', autenticar, async (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;

  // Validação dos campos obrigatórios
  if (!nome || !descricao || preco === undefined) {
    return res.status(400).json({ 
      error: 'Nome, descrição e preço são obrigatórios.',
      campos_obrigatorios: ['nome', 'descricao', 'preco']
    });
  }

  // Validação do preço
  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ error: 'Preço deve ser um número válido e positivo.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, preco, quantidade_estoque || 0]
    );

    res.status(201).json({
      message: 'Produto cadastrado com sucesso!',
      produto: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error.message);
    res.status(500).json({ error: 'Erro ao cadastrar produto.', details: error.message });
  }
});

/**
 * GET /produtos - Listar todos os produtos (PÚBLICO - ISSUE #9)
 * 
 * Query params:
 * - ordenar: 'nome', 'preco', 'id' (padrão: 'id')
 * - ordem: 'asc' ou 'desc' (padrão: 'asc')
 * - limite: número máximo de resultados (padrão: sem limite)
 */
app.get('/produtos', async (req, res) => {
  try {
    const { ordenar = 'id', ordem = 'asc', limite } = req.query;
    
    // Validação do parâmetro de ordenação
    const camposValidos = ['id', 'nome', 'preco', 'quantidade_estoque'];
    if (!camposValidos.includes(ordenar)) {
      return res.status(400).json({ 
        error: `Campo de ordenação inválido. Campos válidos: ${camposValidos.join(', ')}` 
      });
    }

    // Validação da ordem
    const ordemValida = ordem.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `SELECT * FROM produtos ORDER BY ${ordenar} ${ordemValida}`;
    
    if (limite && !isNaN(limite)) {
      query += ` LIMIT ${parseInt(limite)}`;
    }

    const result = await pool.query(query);

    res.json({
      total: result.rows.length,
      parametros: {
        ordenar,
        ordem: ordemValida,
        limite: limite || 'sem limite'
      },
      produtos: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos.', details: error.message });
  }
});

/**
 * GET /produtos/:id - Buscar produto por ID (PÚBLICO - ISSUE #9)
 * 
 * Params:
 * - id: número do produto (obrigatório)
 */
app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;

  // Validação do ID
  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({ error: 'ID deve ser um número válido e positivo.' });
  }

  try {
    const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Produto não encontrado.',
        id: parseInt(id)
      });
    }

    res.json({
      message: 'Produto encontrado com sucesso!',
      produto: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error.message);
    res.status(500).json({ error: 'Erro ao buscar produto.', details: error.message });
  }
});

/**
 * PUT /produtos/:id - Atualizar produto (PROTEGIDO - ISSUE #7)
 * Requer autenticação via token JWT
 */
app.put('/produtos/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, quantidade_estoque } = req.body;

  // Validação do ID
  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({ error: 'ID deve ser um número válido e positivo.' });
  }

  try {
    const result = await pool.query(
      'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, quantidade_estoque = $4 WHERE id = $5 RETURNING *',
      [nome, descricao, preco, quantidade_estoque, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado para atualização.' });
    }

    res.json({
      message: 'Produto atualizado com sucesso!',
      produto: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar produto.', details: error.message });
  }
});

/**
 * DELETE /produtos/:id - Deletar produto (PROTEGIDO - ISSUE #7)
 * Requer autenticação via token JWT
 */
app.delete('/produtos/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  // Validação do ID
  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({ error: 'ID deve ser um número válido e positivo.' });
  }

  try {
    const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado para remoção.' });
    }

    res.json({ 
      message: 'Produto removido com sucesso.',
      produto: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error.message);
    res.status(500).json({ error: 'Erro ao deletar produto.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
