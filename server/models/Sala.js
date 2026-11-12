const mongoose = require('mongoose');

const SalaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da sala é obrigatório'],
      trim: true,
      minlength: [3, 'O nome deve ter pelo menos 3 caracteres'],
      maxlength: [60, 'O nome deve ter no máximo 60 caracteres'],
      unique: true, // evita duas salas com o mesmo nome
    },
    capacidade: {
      type: Number,
      required: [true, 'A capacidade é obrigatória'],
      min: [1, 'A capacidade mínima é 1 jogador'],
      max: [20, 'A capacidade máxima é 20 jogadores'],
      validate: {
        validator: Number.isInteger,
        message: 'A capacidade deve ser um número inteiro',
      },
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: [300, 'A descrição deve ter no máximo 300 caracteres'],
      default: '',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  }
);

// Índice para busca por nome (útil nos filtros do frontend)
SalaSchema.index({ nome: 'text' });

module.exports = mongoose.model('Sala', SalaSchema);