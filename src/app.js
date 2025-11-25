// ============================================================
// Proyecto: Vive+Salud
// Autor: Ignacio Méndez
// Descripción: Servidor Express con conexión a MySQL y frontend básico
// ============================================================

import express from "express";
import mysql from "mysql";
import myConnection from "express-myconnection";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Archivos frontend

// ============================================================
// CONEXIÓN A LA BASE DE DATOS
// ============================================================
app.use(
  myConnection(
    mysql,
    {
      host: "localhost",
      user: "vive_salud",
      password: "12345",
      port: 3306,
      database: "vive_salud",
    },
    "single"
  )
);

// ============================================================
// RUTAS
// ============================================================

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test de conexión
app.get("/test-db", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la base de datos");
    res.send("✅ Conexión a la base de datos exitosa");
  });
});

// ============================================================
// RUTA PRODUCTOS (JOIN COMPLETO)
// ============================================================
app.get("/productos", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT 
        p.product_id AS id,
        d.name AS nombre,
        d.description AS descripcion,
        p.price AS precio,
        cdesc.name AS categoria
      FROM abc_products p
      JOIN abc_product_descriptions d 
        ON p.product_id = d.product_id AND d.language_id = 1
      JOIN abc_products_to_categories pc
        ON p.product_id = pc.product_id
      JOIN abc_category_descriptions cdesc
        ON pc.category_id = cdesc.category_id AND cdesc.language_id = 1
    `;

    conn.query(sql, (err, rows) => {
      if (err) {
        console.log("ERROR SQL /productos:", err);
        return res.status(500).json({ error: "Error al obtener productos" });
      }
      res.json(rows);
    });
  });
});

// ============================================================
// CRUD DE USUARIOS
// ============================================================

// Crear usuario con contraseña (hash)
app.post("/usuarios", async (req, res) => {
  const { nombre_completo, email, telefono, password } = req.body;
  if (!nombre_completo || !email || !password)
    return res.status(400).json({ error: "Nombre completo, email y contraseña son obligatorios" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hashear contraseña
    req.getConnection((err, conn) => {
      if (err) return res.status(500).json({ error: "Error de conexión" });

      const nuevoUsuario = { nombre_completo, email, telefono, password: hashedPassword };
      conn.query("INSERT INTO usuarios SET ?", nuevoUsuario, (err, result) => {
        if (err) {
          console.log("ERROR SQL /usuarios POST:", err);
          return res.status(500).json({ error: "Error al crear usuario" });
        }
        res.json({ message: "✅ Usuario creado correctamente", id: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la contraseña" });
  }
});

// Login de usuario
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email y contraseña son obligatorios" });

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, rows) => {
      if (err) return res.status(500).json({ error: "Error al consultar usuario" });
      if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

      const usuario = rows[0];
      const match = await bcrypt.compare(password, usuario.password);
      if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

      res.json({ message: "✅ Inicio de sesión exitoso", usuario: { id: usuario.id, nombre_completo: usuario.nombre_completo, email: usuario.email } });
    });
  });
});


// ============================================================
// INICIAR SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
