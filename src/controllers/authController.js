// src/controllers/authController.js
const Usuario = require('../models/Usuario');
// si luego usas contraseñas hasheadas:
// const bcrypt = require('bcryptjs');

exports.showLoginForm = (req, res) => {
  // si ya tienes login.html estático, puedes servirlo desde public
  res.sendFile('login.html', { root: 'src/public' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Usuario.findByEmail(email);
  if (!user) {
    return res.redirect('/login.html'); // más adelante podemos mandar mensaje de error
  }

  // 🔴 Versión simple (no segura, solo para tarea):
  if (user.password !== password) {
    return res.redirect('/login.html');
  }

  // guardamos info en la sesión
  req.session.user = {
    id: user.id,
    email: user.email,
    // agrega rol si tu tabla lo tiene
  };

  res.redirect('/admin');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
};
