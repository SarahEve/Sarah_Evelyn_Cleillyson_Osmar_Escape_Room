const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'O email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Por favor, informe um email válido',
      ],
    },
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória'],    
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
      select: false, // não retorna a senha nas queries por padrão
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'O role deve ser "user" ou "admin"',
      },
      default: 'user',
    },
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  }
);

// Hash da senha antes de salvar
UsuarioSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
});

// Método para comparar senha no login
UsuarioSchema.methods.compararSenha = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

// Remove a senha ao converter para JSON (segurança extra)
UsuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);