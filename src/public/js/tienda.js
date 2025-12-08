// ===============================================
// Tienda Vive+Salud - Lógica de productos + carrito
// ===============================================

let productos = [];
let carrito = [];

// Claves de storage
const CLAVE_CARRITO = "carrito_vive_salud";
const CLAVE_CHECKOUT = "checkout_vive_salud";

// ---------- Utilidades ----------
function formatearPrecio(num) {
  const n = Number(num || 0);
  return "$" + n.toFixed(2);
}

function obtenerUsuarioActual() {
  try {
    return JSON.parse(sessionStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

// ---------- Carrito en storage ----------
function cargarCarritoDeStorage() {
  try {
    const raw = sessionStorage.getItem(CLAVE_CARRITO);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      id: Number(item.id),
      nombre: item.nombre,
      precio: Number(item.precio),
      cantidad: Number(item.cantidad) || 1,
    }));
  } catch {
    return [];
  }
}

function guardarCarritoEnStorage() {
  try {
    sessionStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (e) {
    console.error("Error guardando carrito en storage:", e);
  }
}

// ---------- Cargar productos ----------
async function cargarProductos() {
  try {
    const res = await fetch("/productos");
    if (!res.ok) throw new Error("No se pudieron obtener los productos");
    productos = await res.json();
    console.log("Productos recibidos:", productos);
    renderProductos();
  } catch (err) {
    console.error("Error cargando productos:", err);
    const cont = document.getElementById("productosContainer");
    if (cont) {
      cont.innerHTML =
        "<p>No se pudieron cargar los productos. Intenta más tarde.</p>";
    }
  }
}

// ---------- Render de productos por categoría ----------
function renderProductos() {
  const cont = document.getElementById("productosContainer");
  if (!cont) return;

  const categorias = {};
  productos.forEach((p) => {
    if (!categorias[p.categoria]) categorias[p.categoria] = [];
    categorias[p.categoria].push(p);
  });

  cont.innerHTML = "";

  for (const [categoria, prods] of Object.entries(categorias)) {
    const catDiv = document.createElement("div");
    catDiv.classList.add("categoria");
    catDiv.innerHTML = `<h2>${categoria}</h2>`;

    const grid = document.createElement("div");
    grid.classList.add("productos");

    prods.forEach((p) => {
      const prodDiv = document.createElement("div");
      prodDiv.classList.add("producto");
      const imagenSrc = p.imagen || p.image_url || "/imagenes/placeholder.png";

      prodDiv.innerHTML = `
        <div class="producto-img-wrapper">
          <img src="${imagenSrc}" alt="${p.nombre}" class="producto-img">
        </div>
        <h3>${p.nombre}</h3>
        <p class="precio">${formatearPrecio(p.precio)}</p>
        <p>${p.descripcion}</p>
        <button class="btn btn-agregar-carrito" data-id="${p.id}">
          Agregar al carrito 🛒
        </button>
      `;

      grid.appendChild(prodDiv);
    });

    catDiv.appendChild(grid);
    cont.appendChild(catDiv);
  }
}

// ---------- Carrito en memoria ----------
function agregarAlCarrito(productoId) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = "/login.html";
    return;
  }

  const prod = productos.find((p) => p.id === productoId);
  if (!prod) return;

  const existente = carrito.find((item) => item.id === productoId);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: Number(prod.precio),
      cantidad: 1,
    });
  }

  guardarCarritoEnStorage();
  renderCarrito();
  abrirCarrito();
}

function quitarDelCarrito(productoId) {
  carrito = carrito.filter((item) => item.id !== productoId);
  guardarCarritoEnStorage();
  renderCarrito();
}

function calcularTotal() {
  return carrito.reduce(
    (acc, item) => acc + item.precio * (item.cantidad || 1),
    0
  );
}

function actualizarTextoBotonCarrito() {
  const btnCarrito = document.getElementById("btnCarrito");
  if (!btnCarrito) return;
  const totalItems = carrito.reduce(
    (acc, item) => acc + (item.cantidad || 1),
    0
  );
  btnCarrito.textContent = `Carrito (${totalItems})`;
}

function renderCarrito() {
  const lista = document.getElementById("carritoItems");
  const totalSpan = document.getElementById("carritoTotal");
  if (!lista || !totalSpan) return;

  if (carrito.length === 0) {
    lista.innerHTML =
      "<p>Tu carrito está vacío. Agrega productos para comenzar 🛒</p>";
  } else {
    lista.innerHTML = "";
    carrito.forEach((item) => {
      const li = document.createElement("div");
      li.classList.add("carrito-item");
      li.innerHTML = `
        <div class="carrito-item-info">
          <span class="carrito-item-nombre">${item.nombre}</span>
          <span class="carrito-item-detalle">
            ${item.cantidad} x ${formatearPrecio(item.precio)}
          </span>
        </div>
        <div class="carrito-item-acciones">
          <span class="carrito-item-subtotal">${formatearPrecio(
            item.precio * item.cantidad
          )}</span>
          <button class="carrito-item-eliminar" data-id="${item.id}">✕</button>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  totalSpan.textContent = formatearPrecio(calcularTotal());
  actualizarTextoBotonCarrito();
}

// ---------- Panel carrito ----------
const btnCarrito = document.getElementById("btnCarrito");
const carritoPanel = document.getElementById("carritoPanel");
const carritoOverlay = document.getElementById("carritoOverlay");
const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

function abrirCarrito() {
  if (!carritoPanel || !carritoOverlay) return;
  carritoPanel.classList.add("abierto");
  carritoOverlay.classList.add("visible");
}

function cerrarCarrito() {
  if (!carritoPanel || !carritoOverlay) return;
  carritoPanel.classList.remove("abierto");
  carritoOverlay.classList.remove("visible");
}

if (btnCarrito) btnCarrito.addEventListener("click", abrirCarrito);
if (btnCerrarCarrito) btnCerrarCarrito.addEventListener("click", cerrarCarrito);
if (carritoOverlay) carritoOverlay.addEventListener("click", cerrarCarrito);

if (btnVaciarCarrito) {
  btnVaciarCarrito.addEventListener("click", () => {
    carrito = [];
    guardarCarritoEnStorage();
    renderCarrito();
  });
}

// ---------- Finalizar compra ----------
// Ahora NO crea el pedido aquí: guarda la info en sessionStorage
// y redirige a checkout.html para capturar dirección, método de pago, etc.
if (btnFinalizarCompra) {
  btnFinalizarCompra.addEventListener("click", () => {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
      alert("Debes iniciar sesión para finalizar tu compra.");
      window.location.href = "/login.html";
      return;
    }

    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const payload = {
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
      },
      items: carrito.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: calcularTotal(),
    };

    try {
      sessionStorage.setItem(CLAVE_CHECKOUT, JSON.stringify(payload));
    } catch (e) {
      console.error("Error guardando datos de checkout:", e);
    }

    // Ir a la pantalla de checkout (dirección, método de pago, etc.)
    window.location.href = "/checkout.html";
  });
}

// ---------- Delegación de eventos (click en botones) ----------
document.addEventListener("click", (e) => {
  // Buscar el botón más cercano, aunque se haga clic sobre el icono o el texto
  const btnAgregar = e.target.closest(".btn-agregar-carrito");
  if (btnAgregar) {
    const id = Number(btnAgregar.dataset.id);
    if (id) {
      console.log("Agregando al carrito:", id);
      agregarAlCarrito(id);
    }
    return; // evitamos que siga evaluando para este click
  }

  const btnEliminar = e.target.closest(".carrito-item-eliminar");
  if (btnEliminar) {
    const id = Number(btnEliminar.dataset.id);
    if (id) {
      quitarDelCarrito(id);
    }
  }
});

// ---------- Estado de sesión en el header ----------
(function actualizarHeaderUsuario() {
  const usuarioSpan = document.getElementById("usuarioLogueado");
  const btnCrear = document.getElementById("btnCrearCuenta");
  const btnLogin = document.getElementById("btnIniciarSesion");
  const btnCerrar = document.getElementById("btnCerrarSesion");

  const usuario = obtenerUsuarioActual();

  if (usuario) {
    if (usuarioSpan)
      usuarioSpan.textContent = `Hola, ${usuario.nombre_completo}`;
    if (btnCrear) btnCrear.style.display = "none";
    if (btnLogin) btnLogin.style.display = "none";
    if (btnCerrar) btnCerrar.style.display = "inline-block";
    if (btnCarrito) btnCarrito.style.display = "inline-flex";
  } else {
    if (usuarioSpan) usuarioSpan.textContent = "";
    if (btnCrear) btnCrear.style.display = "inline-block";
    if (btnLogin) btnLogin.style.display = "inline-block";
    if (btnCerrar) btnCerrar.style.display = "none";
    if (btnCarrito) btnCarrito.style.display = "none";
  }

  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      sessionStorage.removeItem("usuario");
      sessionStorage.removeItem(CLAVE_CARRITO);
      sessionStorage.removeItem(CLAVE_CHECKOUT);
      window.location.href = "/logout";
    });
  }
})();

// ---------- Inicial ----------
carrito = cargarCarritoDeStorage();
cargarProductos();
renderCarrito();
