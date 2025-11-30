import express from "express";
const router = express.Router();

// Middleware autenticación
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  return res.status(401).json({ error: "No autorizado" });
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
    const sql = `
      SELECT c.category_id AS id, cd.name, cd.description
      FROM abc_categories c
      LEFT JOIN abc_category_descriptions cd
      ON c.category_id = cd.category_id AND cd.language_id = 1
    `;
    conn.query(sql, (err, rows) => res.json(rows));
  });
});

router.post("/categorias", isAuthenticated, (req, res) => {
  const { name, description } = req.body;

  req.getConnection((err, conn) => {
    conn.query(
      "INSERT INTO abc_categories (parent_id, status) VALUES (0,1)",
      (err, result) => {
        const id = result.insertId;

        conn.query(
          "INSERT INTO abc_category_descriptions (category_id, language_id, name, description) VALUES (?,1,?,?)",
          [id, name, description],
          () => res.json({ message: "Categoría creada", id })
        );
      }
    );
  });
});

router.put("/categorias/:id", isAuthenticated, (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  req.getConnection((err, conn) => {
    conn.query(
      "UPDATE abc_category_descriptions SET name=?, description=? WHERE category_id=? AND language_id=1",
      [name, description, id],
      () => res.json({ message: "Categoría actualizada" })
    );
  });
});

router.delete("/categorias/:id", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    const { id } = req.params;
    conn.query("DELETE FROM abc_category_descriptions WHERE category_id=?", [id], () => {
      conn.query("DELETE FROM abc_categories WHERE category_id=?", [id], () =>
        res.json({ message: "Categoría eliminada" })
      );
    });
  });
});

// ======================
// CRUD PRODUCTOS
// ======================
router.get("/productos", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
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
    conn.query(sql, (err, rows) => res.json(rows));
  });
});

router.post("/productos", isAuthenticated, (req, res) => {
  const { name, model, price, quantity, category_id } = req.body;

  req.getConnection((err, conn) => {
    const sku = model.trim().toUpperCase().replace(/\s+/g, "_");

    conn.query(
      "INSERT INTO abc_products (model, sku, price, quantity) VALUES (?,?,?,?)",
      [model, sku, price, quantity],
      (err, result) => {
        const id = result.insertId;

        conn.query(
          "INSERT INTO abc_product_descriptions (product_id, language_id, name, description) VALUES (?,1,?, '')",
          [id, name],
          () => {
            conn.query(
              "INSERT INTO abc_products_to_categories (product_id, category_id) VALUES (?,?)",
              [id, category_id],
              () => res.json({ message: "Producto creado", id })
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
    const sku = model.trim().toUpperCase().replace(/\s+/g, "_");

    conn.query(
      "UPDATE abc_products SET model=?, sku=?, price=?, quantity=? WHERE product_id=?",
      [model, sku, price, quantity, id],
      () => {
        conn.query(
          `
          INSERT INTO abc_product_descriptions (product_id, language_id, name, description)
          VALUES (?,1,?, '')
          ON DUPLICATE KEY UPDATE name=VALUES(name)
          `,
          [id, name],
          () => {
            conn.query(
              "DELETE FROM abc_products_to_categories WHERE product_id=?",
              [id],
              () => {
                conn.query(
                  "INSERT INTO abc_products_to_categories (product_id, category_id) VALUES (?,?)",
                  [id, category_id],
                  () => res.json({ message: "Producto actualizado" })
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
    conn.query("DELETE FROM abc_products_to_categories WHERE product_id=?", [id], () => {
      conn.query("DELETE FROM abc_product_descriptions WHERE product_id=?", [id], () => {
        conn.query("DELETE FROM abc_products WHERE product_id=?", [id], () =>
          res.json({ message: "Producto eliminado" })
        );
      });
    });
  });
});

// ======================
// CRUD CLIENTES
// ======================
router.get("/clientes", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    conn.query("SELECT id, nombre_completo, email, telefono FROM usuarios", (err, rows) =>
      res.json(rows)
    );
  });
});

router.put("/clientes/:id", isAuthenticated, (req, res) => {
  const { nombre_completo, email, telefono } = req.body;
  const { id } = req.params;

  req.getConnection((err, conn) => {
    conn.query(
      "UPDATE usuarios SET nombre_completo=?, email=?, telefono=? WHERE id=?",
      [nombre_completo, email, telefono, id],
      () => res.json({ message: "Cliente actualizado" })
    );
  });
});

router.delete("/clientes/:id", isAuthenticated, (req, res) => {
  req.getConnection((err, conn) => {
    conn.query("DELETE FROM usuarios WHERE id=?", [req.params.id], () =>
      res.json({ message: "Cliente eliminado" })
    );
  });
});

export default router;
