const Joi = require('joi');

// POST /api/agendamentos
exports.criarSchema = Joi.object({
  sala: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID de sala inválido',
      'any.required': 'A sala é obrigatória',
    }),
  data: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
      'any.required': 'A data é obrigatória',
    }),
  hora: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'Hora deve estar no formato HH:mm',
      'any.required': 'A hora é obrigatória',
    }),
});

// PATCH /api/agendamentos/:id/recusar
exports.recusarSchema = Joi.object({
  observacao: Joi.string().trim().max(500).allow('', null),
});

// Middleware genérico que valida req.body com um schema Joi
exports.validar = (schema) => (req, res, next) => {
  const { erro, value } = schema.validate(req.body, { abortEarly: false });
  if (erro) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: erro.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};