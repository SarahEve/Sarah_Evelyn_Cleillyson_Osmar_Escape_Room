const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = header.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ erro: 'Token expirado' });
      }
      return res.status(401).json({ erro: 'Token inválido' });
    }

    // confirma que o usuário ainda existe (pode ter sido deletado)
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    // disponibiliza o usuário para os controllers
    req.usuario = {
      id: usuario._id.toString(),
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    };

    next();
  } catch (err) {
    console.error('Erro no authMiddleware:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

module.exports = authMiddleware;