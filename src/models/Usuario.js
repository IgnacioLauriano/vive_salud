// src/models/Usuario.js
const pool = require('../config/db');

const Usuario = {
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0];
  }
};

module.exports = Usuario;
