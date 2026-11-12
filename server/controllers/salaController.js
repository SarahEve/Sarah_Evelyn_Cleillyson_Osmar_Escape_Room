const Sala = require('../models/Sala');

// GET /api/salas (user + admin)
const listarSalas = async (req, res) => {
  try {
    // usuário comum só vê salas ativas; admin vê todas (passando ?todas=true)
    const filtro = req.usuario.role === 'admin' && req.query.todas === 'true'
      ? {}
      : { ativo: true };

    const salas = await Sala.find(filtro).sort({ nome: 1 });
    return res.json(salas);
  } catch (err) {
    console.error('Erro em listarSalas:', err);
    return res.status(500).json({ erro: 'Erro ao listar salas' });
  }
};

// GET /api/salas/:id
const buscarSala = async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' });
    return res.json(sala);
  } catch (err) {
    return res.status(400).json({ erro: 'ID inválido' });
  }
};

// POST /api/salas (admin)
const criarSala = async (req, res) => {
  try {
    const { nome, capacidade, descricao } = req.body;
    const sala = await Sala.create({ nome, capacidade, descricao });
    return res.status(201).json(sala);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'Já existe uma sala com esse nome' });
    if (err.name === 'ValidationError') {
      return res.status(400).json({ erro: Object.values(err.errors)[0].message });
    }
    return res.status(500).json({ erro: 'Erro ao criar sala' });
  }
};

// PUT /api/salas/:id (admin)
const atualizarSala = async (req, res) => {
  try {
    const sala = await Sala.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' });
    return res.json(sala);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
};

// DELETE /api/salas/:id (admin)
const deletarSala = async (req, res) => {
  try {
    const sala = await Sala.findByIdAndDelete(req.params.id);
    if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' });
    return res.json({ mensagem: 'Sala removida' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao deletar sala' });
  }
};

module.exports = { listarSalas, buscarSala, criarSala, atualizarSala, deletarSala };