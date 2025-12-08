// ============================================================
// Proyecto: Vive+Salud
// Autor: Ignacio Méndez
// Descripción: Servidor Express con conexión a MySQL y frontend
// ============================================================

import express from "express";
import mysql from "mysql";
import myConnection from "express-myconnection";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import session from "express-session";
import adminRouter from "./routes/admin.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Frontend

// Sesiones para autenticación
app.use(
  session({
    secret: "vive_salud_secret",
    resave: false,
    saveUninitialized: false,
  })
);

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
// RUTAS BÁSICAS
// ============================================================

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test de conexión
app.get("/test-db", (req, res) => {
  req.getConnection((err, conn) => {
    if (err)
      return res
        .status(500)
        .send("❌ Error de conexión a la base de datos");
    res.send("✅ Conexión a la base de datos exitosa");
  });
});

// ============================================================
// RUTA PRODUCTOS (JOIN COMPLETO SOLO LECTURA PÚBLICA)
// ============================================================
app.get("/productos", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT 
        p.product_id AS id,
        d.name        AS nombre,
        d.description AS descripcion,
        d.image_url   AS image_url,
        p.price       AS precio,
        p.quantity    AS stock,
        cdesc.name    AS categoria
      FROM abc_products p
      JOIN abc_product_descriptions d 
        ON p.product_id = d.product_id 
       AND d.language_id = 1
      JOIN abc_products_to_categories pc
        ON p.product_id = pc.product_id
      JOIN abc_category_descriptions cdesc
        ON pc.category_id = cdesc.category_id 
       AND cdesc.language_id = 1
    `;

    conn.query(sql, (err, rows) => {
      if (err) {
        console.log("ERROR SQL /productos:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener productos" });
      }
      res.json(rows);
    });
  });
});

// ============================================================
// CRUD DE USUARIOS (registro)
// ============================================================
app.post("/usuarios", async (req, res) => {
  const { nombre_completo, email, telefono, password } = req.body;
  if (!nombre_completo || !email || !password)
    return res.status(400).json({
      error: "Nombre completo, email y contraseña son obligatorios",
    });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    req.getConnection((err, conn) => {
      if (err) return res.status(500).json({ error: "Error de conexión" });

      const nuevoUsuario = {
        nombre_completo,
        email,
        telefono,
        password: hashedPassword,
      };
      conn.query(
        "INSERT INTO usuarios SET ?",
        nuevoUsuario,
        (err, result) => {
          if (err) {
            console.log("ERROR SQL /usuarios POST:", err);
            return res
              .status(500)
              .json({ error: "Error al crear usuario" });
          }
          res.json({
            ok: true,
            message: "✅ Usuario creado correctamente",
            id: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la contraseña" });
  }
});

// ============================================================
// LOGIN (JSON: MISMA RUTA PARA USUARIOS Y ADMIN)
// ============================================================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ error: "Email y contraseña son obligatorios" });

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    conn.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, rows) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error al consultar usuario" });
        if (rows.length === 0)
          return res.status(404).json({ error: "Usuario no encontrado" });

        const usuario = rows[0];
        const match = await bcrypt.compare(password, usuario.password);
        if (!match)
          return res.status(401).json({ error: "Contraseña incorrecta" });

        // Guardar usuario en la sesión
        req.session.user = {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
        };

        const esAdmin = usuario.email === "ignacio@example.com";

        res.json({
          ok: true,
          esAdmin,
          message: esAdmin
            ? "✅ Admin autenticado correctamente"
            : "✅ Usuario autenticado correctamente",
          usuario: {
            id: usuario.id,
            nombre_completo: usuario.nombre_completo,
            email: usuario.email,
          },
        });
      }
    );
  });
});

// ============================================================
// LOGOUT
// ============================================================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ============================================================
// GUARDAR PEDIDOS DESDE EL CARRITO  (FINALIZAR COMPRA)
// ============================================================
// Espera body: { items: [ { id o product_id, cantidad }, ... ], direccion? }
// Valida stock, descuenta quantity en abc_products y crea pedido+detalles
app.post("/api/pedidos", (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ ok: false, error: "Debes iniciar sesión para finalizar la compra" });
  }

  const { items, direccion } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ ok: false, error: "No hay productos en el pedido" });
  }

  // Siempre usamos el usuario de la sesión
  const usuarioId = req.session.user.id;

  req.getConnection((err, conn) => {
    if (err) {
      console.error("Error de conexión:", err);
      return res.status(500).json({ ok: false, error: "Error de conexión" });
    }

    // Helper para abortar transacción
    function abortTransaction(status, msg) {
      conn.rollback(() => {
        console.error("Rollback pedido:", msg);
        res.status(status).json({ ok: false, error: msg });
      });
    }

    conn.beginTransaction((errTx) => {
      if (errTx) {
        console.error("ERROR beginTransaction:", errTx);
        return res
          .status(500)
          .json({ ok: false, error: "No se pudo iniciar la transacción" });
      }

      let total = 0;
      const detalles = []; // { product_id, nombre_producto, precio, cantidad, subtotal }

      // Procesar items uno por uno
      function procesarItem(index) {
        if (index >= items.length) {
          // Ya validamos stock y lo descontamos, ahora insertamos pedido
          insertarPedido();
          return;
        }

        const item = items[index] || {};
        const productId = item.product_id || item.id;
        const cantidad = Number(item.cantidad) || 1;

        if (!productId || cantidad <= 0) {
          return abortTransaction(400, "Item del pedido inválido");
        }

        const sqlSelect = `
          SELECT 
            p.product_id,
            p.price,
            p.quantity,
            d.name
          FROM abc_products p
          JOIN abc_product_descriptions d
            ON p.product_id = d.product_id AND d.language_id = 1
          WHERE p.product_id = ?
          FOR UPDATE
        `;

        conn.query(sqlSelect, [productId], (errSel, rows) => {
          if (errSel) {
            console.error("Error SELECT producto:", errSel);
            return abortTransaction(500, "Error al revisar stock");
          }
          if (!rows.length) {
            return abortTransaction(400, "Producto no encontrado");
          }

          const prod = rows[0];

          if (prod.quantity < cantidad) {
            return abortTransaction(
              400,
              `No hay stock suficiente para "${prod.name}". Disponible: ${prod.quantity}`
            );
          }

          const precio = Number(prod.price) || 0;
          const subtotal = precio * cantidad;
          total += subtotal;

          detalles.push({
            product_id: prod.product_id,
            nombre_producto: prod.name,
            precio,
            cantidad,
            subtotal,
          });

          // Descontar stock
          const sqlUpdate = `
            UPDATE abc_products
            SET quantity = quantity - ?
            WHERE product_id = ?
          `;
          conn.query(sqlUpdate, [cantidad, productId], (errUpd) => {
            if (errUpd) {
              console.error("Error UPDATE stock:", errUpd);
              return abortTransaction(500, "Error al actualizar stock");
            }
            // Siguiente item
            procesarItem(index + 1);
          });
        });
      }

      function insertarPedido() {
        // Si tu tabla 'pedidos' tiene 'direccion_envio', usamos esa columna.
        const sqlPedido = direccion
          ? "INSERT INTO pedidos (usuario_id, total, estado, direccion_envio, fecha) VALUES (?, ?, 'pendiente', ?, NOW())"
          : "INSERT INTO pedidos (usuario_id, total, estado, fecha) VALUES (?, ?, 'pendiente', NOW())";

        const paramsPedido = direccion
          ? [usuarioId, total, direccion]
          : [usuarioId, total];

        conn.query(sqlPedido, paramsPedido, (errPed, result) => {
          if (errPed) {
            console.error("ERROR insert pedidos:", errPed);
            return abortTransaction(500, "Error al guardar el pedido");
          }

          const pedidoId = result.insertId;

          const values = detalles.map((d) => [
            pedidoId,
            d.product_id, // columna product_id en pedido_detalles
            d.nombre_producto,
            d.precio,
            d.cantidad,
            d.subtotal,
          ]);

          const sqlDetalles = `
            INSERT INTO pedido_detalles
              (pedido_id, product_id, nombre_producto, precio, cantidad, subtotal)
            VALUES ?
          `;

          conn.query(sqlDetalles, [values], (errDet) => {
            if (errDet) {
              console.error("ERROR insert pedido_detalles:", errDet);
              return abortTransaction(
                500,
                "Error al guardar los detalles del pedido"
              );
            }

            conn.commit((errCommit) => {
              if (errCommit) {
                console.error("ERROR commit:", errCommit);
                return abortTransaction(500, "Error al confirmar el pedido");
              }

              // ✅ Todo bien
              res.json({
                ok: true,
                message: "✅ Pedido guardado correctamente",
                pedidoId,
                total,
              });
            });
          });
        });
      }

      // Iniciar procesamiento de items
      procesarItem(0);
    });
  });
});

// ============================================================
// API: PEDIDOS PENDIENTES DEL USUARIO LOGUEADO
// ============================================================
app.get("/api/mis-pedidos-pendientes", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const usuarioId = req.session.user.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT id, fecha, total, estado
      FROM pedidos
      WHERE usuario_id = ? AND estado = 'pendiente'
      ORDER BY fecha DESC
    `;

    conn.query(sql, [usuarioId], (err, rows) => {
      if (err) {
        console.error("ERROR SQL /api/mis-pedidos-pendientes:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener pedidos" });
      }
      res.json(rows);
    });
  });
});

// ============================================================
// API: MIS PEDIDOS (TODOS LOS ESTADOS) PARA USUARIO NORMAL
// ============================================================
app.get("/api/mis-pedidos", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const usuarioId = req.session.user.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      SELECT id, fecha, total, estado
      FROM pedidos
      WHERE usuario_id = ?
      ORDER BY fecha DESC
    `;

    conn.query(sql, [usuarioId], (err, rows) => {
      if (err) {
        console.error("ERROR SQL /api/mis-pedidos:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener pedidos" });
      }
      res.json(rows);
    });
  });
});

// ============================================================
// API: OBTENER UN PEDIDO + DETALLES (DEL USUARIO LOGUEADO)
// ============================================================
app.get("/api/pedidos/:id", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const usuarioId = req.session.user.id;
  const pedidoId = req.params.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sqlPedido = `
      SELECT id, usuario_id, fecha, total, estado
      FROM pedidos
      WHERE id = ? AND usuario_id = ?
      LIMIT 1
    `;

    conn.query(sqlPedido, [pedidoId, usuarioId], (err, rows) => {
      if (err) {
        console.error("ERROR SQL /api/pedidos/:id (pedido):", err);
        return res
          .status(500)
          .json({ error: "Error al obtener el pedido" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      const pedido = rows[0];

      const sqlDetalles = `
        SELECT id, nombre_producto, precio, cantidad, subtotal
        FROM pedido_detalles
        WHERE pedido_id = ?
      `;

      conn.query(sqlDetalles, [pedidoId], (err2, rowsDet) => {
        if (err2) {
          console.error("ERROR SQL /api/pedidos/:id (detalles):", err2);
          return res
            .status(500)
            .json({ error: "Error al obtener detalles del pedido" });
        }

        res.json({
          ok: true,
          pedido,
          detalles: rowsDet,
        });
      });
    });
  });
});

// ============================================================
// API: MARCAR PEDIDO COMO PAGADO (COMPARTIDA)
// ============================================================
function manejarPagoPedido(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const usuarioId = req.session.user.id;
  const pedidoId = req.params.id || req.body.pedido_id;

  if (!pedidoId) {
    return res
      .status(400)
      .json({ error: "Falta el id del pedido" });
  }

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error de conexión" });

    const sql = `
      UPDATE pedidos
      SET estado = 'pagado'
      WHERE id = ? AND usuario_id = ? AND estado = 'pendiente'
    `;

    conn.query(sql, [pedidoId, usuarioId], (err2, result) => {
      if (err2) {
        console.error("ERROR SQL actualizar estado pedido:", err2);
        return res
          .status(500)
          .json({ error: "Error al registrar el pago" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "No se encontró un pedido pendiente para este usuario" });
      }

      res.json({
        ok: true,
        message: "✅ Pago registrado correctamente",
      });
    });
  });
}

// Ruta estilo REST: /api/pedidos/:id/pagar
app.post("/api/pedidos/:id/pagar", manejarPagoPedido);

// Ruta anterior que usaba body { pedido_id }
app.post("/api/pedidos/pagar", manejarPagoPedido);

// ============================================================
// RUTA ADMIN (PROTEGIDA) - CRUD CATALOGOS + PEDIDOS (en admin.js)
// ============================================================
app.use("/admin", adminRouter);

// ============================================================
// INICIAR SERVIDOR
// ============================================================
const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
