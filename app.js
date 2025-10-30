// ============================================================
// Proyecto: Vive+Salud
// Autor: Ignacio Méndez
// Descripción: Servidor Express con conexión a MySQL
// ============================================================

import express from "express";
import mysql from "mysql";
import myConnection from "express-myconnection";
import morgan from "morgan";

const app = express();

// Middleware para logs
app.use(morgan("dev"));

// Configuración de conexión a la base de datos
app.use(
  myConnection(
    mysql,
    {
      host: "localhost",
      user: "vive_salud",     // 👈 usuario que creaste en MySQL
      password: "12345",      // 👈 contraseña del usuario
      port: 3306,
      database: "vive_salud", // 👈 nombre de la base de datos
    },
    "single"
  )
);

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("Servidor Vive+Salud funcionando correctamente ✅");
});

// Ruta para probar conexión a la base de datos
app.get("/test-db", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la BD");
    // Solo responde si la conexión fue exitosa, sin consultar tablas
    res.send("✅ Conexión a la base de datos exitosa");
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
