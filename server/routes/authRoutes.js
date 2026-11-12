const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../validations/authValidation');
const validar = require('../middlewares/validateMiddleware');

router.post('/register', validar(registerSchema), register);
router.post('/login', validar(loginSchema), login);

module.exports = router;