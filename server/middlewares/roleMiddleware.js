// Uso: router.delete('/', authMiddleware, roleMiddleware('admin'), controller)
const roleMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    // O authMiddleware roda antes e preenche req.usuario
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    // Se o role do usuário não estiver na lista de permitidos, bloqueia
    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        erro: 'Acesso negado: você não tem permissão para esta ação',
      });
    }

    // Se passou, segue para o controller
    next();
  };
};

module.exports = roleMiddleware;