const express = require('express');
const router = express.Router();

const agendamentoController = require('../controllers/agendamentoController');
const { criarSchema, recusarSchema, validar } = require('../validations/agendamentoValidation');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// ─── Rotas de USER (autenticado) ────────────────────────────
router.get('/meus', authMiddleware, agendamentoController.listarMeus);
router.post('/', authMiddleware, validar(criarSchema), agendamentoController.criar);
router.patch('/:id/cancelar', authMiddleware, agendamentoController.cancelar);
router.get('/:id', authMiddleware, agendamentoController.buscarPorId);

// ─── Rotas de ADMIN ─────────────────────────────────────────
router.get('/', authMiddleware, roleMiddleware('admin'), agendamentoController.listarTodos);
router.patch('/:id/aprovar', authMiddleware, roleMiddleware('admin'), agendamentoController.aprovar);
router.patch('/:id/recusar', authMiddleware, roleMiddleware('admin'), validar(recusarSchema), agendamentoController.recusar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), agendamentoController.deletar);

module.exports = router;