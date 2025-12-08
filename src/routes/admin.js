import express from "express";
const router = express.Router();

// ======================
// MIDDLEWARES
// ======================
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  return res.status(401).json({ error: "No autorizado" });
}

// Solo admin (por si luego quieres usarlo en otras rutas)
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.email === "ignacio@example.com") {
    return next();
  }
  return res.status(403).json({ error: "Solo admin" });
}

// ======================
// ADMIN HOME
// ======================
router.get("/", isAuthenticated, (req, res) => {
  res.sendFile("admin.html", { root: "./public" });
});

// ======================
// CRUD CATEGORÍAS
// ======================
router.get("/categorias", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT c.category_id AS id, cd.name, cd.description
      FROM abc_categories c
      LEFT JOIN abc_category_descriptions cd
      ON c.category_id = cd.category_id AND cd.language_id = 1
    `;
    conn.query(sql, (err2, rows) => {
      if (err2) return res.status(500).json({ error: "Error al obtener categorías" });
      res.json(rows);
    });
  });
});

router.post("/categorias", isAuthenticated, (req, res) => {
  const { name, description } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "INSERT INTO abc_categories (parent_id, status) VALUES (0,1)",
      (err2, result) => {
        if (err2) return res.status(500).json({ error: "Error al crear categoría" });

        const id = result.insertId;

        conn.query(
          "INSERT INTO abc_category_descriptions (category_id, language_id, name, description) VALUES (?,1,?,?)",
          [id, name, description],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Error al crear descripción" });
            res.json({ message: "Categoría creada", id });
          }
        );
      }
    );
  });
});

router.put("/categorias/:id", isAuthenticated, (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "UPDATE abc_category_descriptions SET name=?, description=? WHERE category_id=? AND language_id=1",
      [name, description, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al actualizar categoría" });
        res.json({ message: "Categoría actualizada" });
      }
    );
  });
});

router.delete("/categorias/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "DELETE FROM abc_category_descriptions WHERE category_id=?",
      [id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al eliminar descripción" });

        conn.query(
          "DELETE FROM abc_categories WHERE category_id=?",
          [id],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Error al eliminar categoría" });
            res.json({ message: "Categoría eliminada" });
          }
        );
      }
    );
  });
});

// ======================
// CRUD PRODUCTOS
// ======================
router.get("/productos", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT 
        p.product_id AS id,
        d.name,
        p.model,
        p.price,
        p.quantity,
        c.category_id AS categoria_id,
        cd.name AS categoria_nombre
      FROM abc_products p
      LEFT JOIN abc_product_descriptions d
        ON p.product_id = d.product_id AND d.language_id = 1
      LEFT JOIN abc_products_to_categories c
        ON p.product_id = c.product_id
      LEFT JOIN abc_category_descriptions cd
        ON cd.category_id = c.category_id AND cd.language_id = 1
    `;
    conn.query(sql, (err2, rows) => {
      if (err2) return res.status(500).json({ error: "Error al obtener productos" });
      res.json(rows);
    });
  });
});

router.post("/productos", isAuthenticated, (req, res) => {
  const { name, model, price, quantity, category_id } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sku = model.trim().toUpperCase().replace(/\s+/g, "_");

    conn.query(
      "INSERT INTO abc_products (model, sku, price, quantity) VALUES (?,?,?,?)",
      [model, sku, price, quantity],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: "Error al crear producto" });

        const id = result.insertId;

        conn.query(
          "INSERT INTO abc_product_descriptions (product_id, language_id, name, description) VALUES (?,1,?, '')",
          [id, name],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Error al crear descripción" });

            conn.query(
              "INSERT INTO abc_products_to_categories (product_id, category_id) VALUES (?,?)",
              [id, category_id],
              (err4) => {
                if (err4) return res.status(500).json({ error: "Error al asociar categoría" });
                res.json({ message: "Producto creado", id });
              }
            );
          }
        );
      }
    );
  });
});

router.put("/productos/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { name, model, price, quantity, category_id } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sku = model.trim().toUpperCase().replace(/\s+/g, "_");

    conn.query(
      "UPDATE abc_products SET model=?, sku=?, price=?, quantity=? WHERE product_id=?",
      [model, sku, price, quantity, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al actualizar producto" });

        conn.query(
          `
          INSERT INTO abc_product_descriptions (product_id, language_id, name, description)
          VALUES (?,1,?, '')
          ON DUPLICATE KEY UPDATE name=VALUES(name)
          `,
          [id, name],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Error al actualizar descripción" });

            conn.query(
              "DELETE FROM abc_products_to_categories WHERE product_id=?",
              [id],
              (err4) => {
                if (err4) return res.status(500).json({ error: "Error al limpiar categorías" });

                conn.query(
                  "INSERT INTO abc_products_to_categories (product_id, category_id) VALUES (?,?)",
                  [id, category_id],
                  (err5) => {
                    if (err5) return res.status(500).json({ error: "Error al asociar categoría" });
                    res.json({ message: "Producto actualizado" });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

router.delete("/productos/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "DELETE FROM abc_products_to_categories WHERE product_id=?",
      [id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al eliminar relación categoría" });

        conn.query(
          "DELETE FROM abc_product_descriptions WHERE product_id=?",
          [id],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Error al eliminar descripción" });

            conn.query(
              "DELETE FROM abc_products WHERE product_id=?",
              [id],
              (err4) => {
                if (err4) return res.status(500).json({ error: "Error al eliminar producto" });
                res.json({ message: "Producto eliminado" });
              }
            );
          }
        );
      }
    );
  });
});

// ======================
// CRUD CLIENTES
// ======================
router.get("/clientes", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "SELECT id, nombre_completo, email, telefono FROM usuarios",
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: "Error al obtener clientes" });
        res.json(rows);
      }
    );
  });
});

router.put("/clientes/:id", isAuthenticated, (req, res) => {
  const { nombre_completo, email, telefono } = req.body;
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "UPDATE usuarios SET nombre_completo=?, email=?, telefono=? WHERE id=?",
      [nombre_completo, email, telefono, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al actualizar cliente" });
        res.json({ message: "Cliente actualizado" });
      }
    );
  });
});

router.delete("/clientes/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "DELETE FROM usuarios WHERE id=?",
      [id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al eliminar cliente" });
        res.json({ message: "Cliente eliminado" });
      }
    );
  });
});

// ======================
// PEDIDOS (ADMIN)
// ======================

// Lista de pedidos
router.get("/api/pedidos", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT 
        p.id,
        u.nombre_completo AS cliente,
        u.email,
        u.telefono,
        p.fecha,
        p.total,
        p.estado
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.fecha DESC
    `;

    conn.query(sql, (err2, rows) => {
      if (err2) {
        console.error("ERROR SQL /admin/api/pedidos:", err2);
        return res.status(500).json({ error: "Error al obtener pedidos" });
      }
      res.json(rows);
    });
  });
});

// Detalle de un pedido
router.get("/api/pedidos/:id/detalles", isAuthenticated, (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT 
        d.id,
        d.nombre_producto,
        d.precio,
        d.cantidad,
        d.subtotal
      FROM pedido_detalles d
      WHERE d.pedido_id = ?
    `;

    conn.query(sql, [id], (err2, rows) => {
      if (err2) {
        console.error("ERROR SQL /admin/api/pedidos/:id/detalles:", err2);
        return res
          .status(500)
          .json({ error: "Error al obtener detalles del pedido" });
      }
      res.json(rows);
    });
  });
});

// Cambiar estado (pendiente/pagado/cancelado)
router.put("/api/pedidos/:id/estado", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["pendiente", "pagado", "cancelado"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "UPDATE pedidos SET estado=? WHERE id=?",
      [estado, id],
      (err2) => {
        if (err2) {
          console.error("ERROR SQL update estado pedido:", err2);
          return res
            .status(500)
            .json({ error: "Error al actualizar el estado" });
        }
        res.json({ ok: true, message: "Estado actualizado" });
      }
    );
  });
});

export default router;
