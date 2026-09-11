const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

/**
 * Middleware de autenticação para proteger rotas
 * Extrai e valida o token JWT do header Authorization
 * 
 * Uso: app.post('/rota-protegida', autenticar, controller)
 */
const autenticar = (req, res, next) => {
  // Extrai o token do header Authorization: Bearer <token>
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token não fornecido. Autenticação necessária.',
      detalhes: 'Envie o token no header: Authorization: Bearer <token>'
    });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Realize login novamente.',
        expiradoEm: error.expiredAt
      });
    }
    return res.status(403).json({ 
      error: 'Token inválido.',
      detalhes: error.message
    });
  }
};

module.exports = { autenticar };
