const mongoose = require('mongoose');
const Agendamento = require('../models/Agendamento');
const Sala = require('../models/Sala');

// Converte "2026-12-01" + "14:00" em Date comparável (fuso local)
function montarDataHora(dataStr, horaStr) {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const [hora, minuto] = horaStr.split(':').map(Number);
  return new Date(ano, mes - 1, dia, hora, minuto, 0, 0);
}

// GET /api/agendamentos/meus  (user)
exports.listarMeus = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({ usuario: req.usuario.id })
      .populate('sala', 'nome capacidade descricao')
      .sort({ data: 1, hora: 1 });
    return res.json(agendamentos);
  } catch (erro) {
    console.error('Erro em listarMeus:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar seus agendamentos' });
  }
};

// GET /api/agendamentos  (admin) — aceita ?status=&sala=&data=
exports.listarTodos = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.status) filtro.status = req.query.status;
    if (req.query.sala) filtro.sala = req.query.sala;
    if (req.query.data) {
      const dia = new Date(req.query.data);
      const proximoDia = new Date(dia);
      proximoDia.setDate(proximoDia.getDate() + 1);
      filtro.data = { $gte: dia, $lt: proximoDia };
    }
    const agendamentos = await Agendamento.find(filtro)
      .populate('usuario', 'nome email')
      .populate('sala', 'nome capacidade')
      .sort({ data: 1, hora: 1 });
    return res.json(agendamentos);
  } catch (erro) {
    console.error('Erro em listarTodos:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
};

// POST /api/agendamentos  (user)
exports.criar = async (req, res) => {
  try {
    const { sala, data, hora } = req.body;

    if (!sala || !data || !hora) {
      return res.status(400).json({ erro: 'Sala, data e hora são obrigatórios' });
    }
    if (!mongoose.Types.ObjectId.isValid(sala)) {
      return res.status(400).json({ erro: 'ID de sala inválido' });
    }

    const salaExiste = await Sala.findById(sala);
    if (!salaExiste || !salaExiste.ativo) {
      return res.status(404).json({ erro: 'Sala não encontrada ou inativa' });
    }

    const dataHora = montarDataHora(data, hora);
    if (isNaN(dataHora.getTime())) {
      return res.status(400).json({ erro: 'Data ou hora inválidas' });
    }
    if (dataHora <= new Date()) {
      return res.status(400).json({ erro: 'Não é possível agendar em data/hora passada' });
    }

    const conflito = await Agendamento.findOne({
      sala,
      data: dataHora,
      hora,
      status: { $in: ['pendente', 'aprovado'] },
    });
    if (conflito) {
      return res.status(409).json({ erro: 'Este horário já está reservado para esta sala' });
    }

    const novo = await Agendamento.create({
      usuario: req.usuario.id,
      sala,
      data: dataHora,
      hora,
      status: 'pendente',
    });
    return res.status(201).json(novo);
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ erro: 'Este horário já está reservado para esta sala' });
    }
    console.error('Erro em criar:', erro);
    return res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};

// PATCH /api/agendamentos/:id/aprovar  (admin)
exports.aprovar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (agendamento.status !== 'pendente') {
      return res.status(400).json({ erro: `Só é possível aprovar pendentes (atual: ${agendamento.status})` });
    }
    agendamento.status = 'aprovado';
    await agendamento.save();
    return res.json(agendamento);
  } catch (erro) {
    console.error('Erro em aprovar:', erro);
    return res.status(500).json({ erro: 'Erro ao aprovar agendamento' });
  }
};

// PATCH /api/agendamentos/:id/recusar  (admin) — body opcional { observacao }
exports.recusar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (agendamento.status !== 'pendente') {
      return res.status(400).json({ erro: `Só é possível recusar pendentes (atual: ${agendamento.status})` });
    }
    agendamento.status = 'recusado';
    if (req.body.observacao) agendamento.observacao = req.body.observacao;
    await agendamento.save();
    return res.json(agendamento);
  } catch (erro) {
    console.error('Erro em recusar:', erro);
    return res.status(500).json({ erro: 'Erro ao recusar agendamento' });
  }
};

// PATCH /api/agendamentos/:id/cancelar  (user dono, só se pendente)
exports.cancelar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (agendamento.usuario.toString() !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode cancelar seus próprios agendamentos' });
    }
    if (agendamento.status !== 'pendente') {
      return res.status(400).json({ erro: 'Só é possível cancelar agendamentos pendentes' });
    }
    agendamento.status = 'cancelado';
    await agendamento.save();
    return res.json(agendamento);
  } catch (erro) {
    console.error('Erro em cancelar:', erro);
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
  }
};

// DELETE /api/agendamentos/:id  (admin)
exports.deletar = async (req, res) => {
  try {
    const removido = await Agendamento.findByIdAndDelete(req.params.id);
    if (!removido) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    return res.json({ mensagem: 'Agendamento removido com sucesso', id: removido._id });
  } catch (erro) {
    console.error('Erro em deletar:', erro);
    return res.status(500).json({ erro: 'Erro ao deletar agendamento' });
  }
};

// GET /api/agendamentos/:id  (dono ou admin)
exports.buscarPorId = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id)
      .populate('usuario', 'nome email')
      .populate('sala', 'nome capacidade descricao');
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (
      req.usuario.role !== 'admin' &&
      agendamento.usuario._id.toString() !== req.usuario.id
    ) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    return res.json(agendamento);
  } catch (erro) {
    console.error('Erro em buscarPorId:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar agendamento' });
  }
};