const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Gera JWT com { id, role } no payload
const gerarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id.toString(), role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // validação básica (Joi cobre isso, mas fica como defesa extra)
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }

    // verifica se já existe
    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // cria (o hash é feito pelo pre('save') do model)
    // role é SEMPRE 'user' no register — admin só via seed
    const usuario = await Usuario.create({ nome, email, senha, role: 'user' });

    // devolve sem token? não — já loga o usuário
    const token = gerarToken(usuario);

    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      token,
      usuario: usuario.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    if (err.name === 'ValidationError') {
      const erros = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });
    }
    console.error('Erro no register:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // select('+senha') — único lugar onde o hash é trazido
    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+senha');

    if (!usuario) {
      // mensagem genérica de propósito (não revela se o email existe)
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const senhaOk = await usuario.compararSenha(senha);
    if (!senhaOk) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const token = gerarToken(usuario);

    return res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: usuario.toJSON(), // toJSON remove a senha
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

module.exports = { register, login };