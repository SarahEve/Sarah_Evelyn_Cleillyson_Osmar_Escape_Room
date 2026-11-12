const Joi = require('joi');

const salaSchema = Joi.object({
  nome: Joi.string().trim().min(3).max(60).required().messages({
    'string.empty': 'O nome da sala é obrigatório',
  }),
  capacidade: Joi.number().integer().min(1).max(20).required().messages({
    'number.base': 'A capacidade deve ser um número',
    'number.min': 'A capacidade mínima é 1',
  }),
  descricao: Joi.string().trim().max(300).allow('', null).optional(),
  ativo: Joi.boolean().default(true),
});

module.exports = { salaSchema };