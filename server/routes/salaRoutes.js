const express = require('express');
const router = express.Router();

router.get('/teste', (req, res) => {
  res.json({ mensagem: 'Rota de sala funcionando' });
});

module.exports = router;