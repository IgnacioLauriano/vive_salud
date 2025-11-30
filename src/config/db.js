// src/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'vive_salud',      // el usuario que creas en Vive_Salud.sql
  password: '12345',       // la contraseña que tienes en el script
  database: 'vive_salud'
});

module.exports = pool;
