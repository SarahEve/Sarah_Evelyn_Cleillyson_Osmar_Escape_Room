const validar = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    // Pega todas as mensagens de erro e junta numa string
    const mensagens = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ erro: mensagens });
  }
  
  // Substitui o req.body pelo valor validado e limpo pelo Joi
  req.body = value;
  next();
};

module.exports = validar;