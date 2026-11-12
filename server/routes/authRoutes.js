const express = require('express');
const router = express.Router();

// Rota de teste temporária
router.get('/teste', (req, res) => {
  res.json({ mensagem: 'Rota de auth funcionando' });
});

module.exports = router;