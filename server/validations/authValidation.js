const Joi = require('joi');

const registerSchema = Joi.object({
  nome: Joi.string().trim().min(3).max(60).required().messages({
    'string.empty': 'O nome é obrigatório',
    'string.min': 'O nome deve ter pelo menos 3 caracteres',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Informe um e-mail válido',
    'string.empty': 'O e-mail é obrigatório',
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'A senha deve ter pelo menos 6 caracteres',
    'string.empty': 'A senha é obrigatória',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  senha: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };