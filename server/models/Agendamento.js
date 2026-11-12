const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'O agendamento precisa estar vinculado a um usuário'],
    },
    sala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sala',
      required: [true, 'O agendamento precisa estar vinculado a uma sala'],
    },
    data: {
      type: Date,
      required: [true, 'A data é obrigatória'],
      set: (v) => {
        if (!v) return v;
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
          return new Date(`${v}T00:00:00.000Z`);
        }
        return v;
      },
      validate: {
        validator: function (v) {
          if (!this.isNew) return true;
          const hoje = new Date();
          hoje.setUTCHours(0, 0, 0, 0);
          return v >= hoje;
        },
        message: 'Não é possível agendar em data passada',
      },
    },
    hora: {
      type: String,
      required: [true, 'O horário é obrigatório'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário deve estar no formato HH:mm'],
    },
    status: {
      type: String,
      enum: {
        values: ['pendente', 'aprovado', 'recusado', 'cancelado'],
        message: 'Status inválido: {VALUE}',
      },
      default: 'pendente',
    },
    observacao: {
      type: String,
      trim: true,
      maxlength: [500, 'Observação não pode passar de 500 caracteres'],
    },
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  }
);


// Se o Atlas recusar, removam este bloco e fiquem só com a validação no controller
AgendamentoSchema.index(
  { sala: 1, data: 1, hora: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [{ status: 'pendente' }, { status: 'aprovado' }],
    },
  }
);

module.exports = mongoose.model('Agendamento', AgendamentoSchema);