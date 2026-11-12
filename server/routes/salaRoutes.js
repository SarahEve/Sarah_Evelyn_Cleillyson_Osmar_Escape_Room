const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validar = require('../middlewares/validateMiddleware');
const { salaSchema } = require('../validations/salaValidation');

// Público (mas logado) -> GET
router.get('/', authMiddleware, salaController.listarSalas);
router.get('/:id', authMiddleware, salaController.buscarSala);
router.get('/:id/horarios', authMiddleware, salaController.horariosOcupados);
// Só Admin -> POST, PUT, DELETE (com validação Joi)
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('admin'), 
  validar(salaSchema), 
  salaController.criarSala
);

router.put(
  '/:id', 
  authMiddleware, 
  roleMiddleware('admin'), 
  validar(salaSchema), 
  salaController.atualizarSala
);

router.delete(
  '/:id', 
  authMiddleware, 
  roleMiddleware('admin'), 
  salaController.deletarSala
);

module.exports = router;