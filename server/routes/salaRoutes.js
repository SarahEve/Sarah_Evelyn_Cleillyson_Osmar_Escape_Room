const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Público (mas logado) -> GET
router.get('/', authMiddleware, salaController.listarSalas);
router.get('/:id', authMiddleware, salaController.buscarSala);

// Só Admin -> POST, PUT, DELETE
router.post('/', authMiddleware, roleMiddleware('admin'), salaController.criarSala);
router.put('/:id', authMiddleware, roleMiddleware('admin'), salaController.atualizarSala);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), salaController.deletarSala);

module.exports = router;