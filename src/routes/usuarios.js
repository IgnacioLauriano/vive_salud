import express from "express";

const router = express.Router();

// ============================================================
// CRUD de USUARIOS
// ============================================================

// 🟢 1. Obtener todos los usuarios
router.get("/", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la BD");

    conn.query("SELECT * FROM usuarios", (err, rows) => {
      if (err) return res.status(500).send("⚠ Error al obtener usuarios");

      res.json(rows);
    });
  });
});

// 🟡 2. Obtener un usuario por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la BD");

    conn.query("SELECT * FROM usuarios WHERE id = ?", [id], (err, rows) => {
      if (err) return res.status(500).send("⚠ Error al buscar usuario");
      if (rows.length === 0) return res.status(404).send("❌ Usuario no encontrado");

      res.json(rows[0]);
    });
  });
});

// 🟢 3. Crear nuevo usuario
router.post("/", (req, res) => {
  const { nombre_completo, email, telefono } = req.body;

  if (!nombre_completo || !email) {
    return res.status(400).send("⚠ Nombre completo y email son obligatorios");
  }

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la BD");

    conn.query(
      "INSERT INTO usuarios (nombre_completo, email, telefono) VALUES (?, ?, ?)",
      [nombre_completo, email, telefono || null],
      (err, result) => {
        if (err) return res.status(500).send("⚠ Error al insertar usuario");

        res.status(201).json({ id: result.insertId, nombre_completo, email, telefono });
      }
    );
  });
});

// 🟠 4. Actualizar usuario
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la BD");

    conn.query(
      "UPDATE usuarios SET nombre_completo=?, email=?, telefono=? WHERE id=?",
      [nombre_completo, email, telefono, id],
      (err, result) => {
        if (err) return res.status(500).send("⚠ Error al actualizar usuario");
        if (result.affectedRows === 0) return res.status(404).send("❌ Usuario no encontrado");

        res.json({ id, nombre_completo, email, telefono });
      }
    );
  });
});

// 🔴 5. Eliminar usuario
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send("❌ Error de conexión a la BD");

    conn.query("DELETE FROM usuarios WHERE id=?", [id], (err, result) => {
      if (err) return res.status(500).send("⚠ Error al eliminar usuario");
      if (result.affectedRows === 0) return res.status(404).send("❌ Usuario no encontrado");

      res.send(`✅ Usuario con ID ${id} eliminado correctamente`);
    });
  });
});

export default router;
