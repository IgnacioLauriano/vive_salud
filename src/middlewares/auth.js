// src/middlewares/auth.js

export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  // Si NO está autenticado
  return res.status(401).json({
    error: "No autenticado. Inicia sesión para acceder al panel admin."
  });
}
