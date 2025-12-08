# Vive+Salud 🩺🛒  
Tienda web de bienestar digital desarrollada con **Node.js + Express** y **MySQL**.  
Permite a los usuarios registrarse, iniciar sesión, comprar productos digitales y
consultar sus pedidos, mientras que el administrador gestiona el catálogo y las
ventas.

---

## 1. Tecnologías principales

- **Backend:** Node.js, Express, express-myconnection, express-session, bcrypt
- **Base de datos:** MySQL
- **Frontend:** HTML, CSS, JavaScript plano
- **Modelo de datos principal:** Tablas `abc_*` (catálogo de productos AbanteCart),
  más tablas propias `usuarios`, `pedidos` y `pedido_detalles`.

---

## 2. Estructura del proyecto

```text
NODE.JS/
├─ db/
│  ├─ Vive_Salud.mwb        # Modelo de la base de datos (MySQL Workbench)
│  └─ Vive_Salud.sql        # Script SQL para crear y poblar la BD
│
├─ src/
│  ├─ app.js                # Servidor Express principal
│  ├─ config/               # Configuración (DB, variables comunes)
│  ├─ controllers/          # Lógica de control por módulo (versión MVC)
│  ├─ middlewares/          # Middlewares de autenticación y otros
│  ├─ models/               # Modelos de acceso a datos (usuarios, etc.)
│  ├─ public/               # Frontend estático (HTML, CSS, JS, imágenes)
│  │  ├─ imagenes/
│  │  ├─ js/
│  │  │  └─ tienda.js       # Versión separada de la lógica de la tienda
│  │  ├─ admin.html         # Panel de administración
│  │  ├─ checkout.html      # (flujo de pago alterno / pruebas)
│  │  ├─ index.html         # Tienda principal (productos + carrito)
│  │  ├─ login.html         # Inicio de sesión
│  │  ├─ mis-pedidos.html   # Listado de pedidos del cliente
│  │  ├─ pago.html          # Pantalla de pago del pedido pendiente
│  │  └─ registro.html      # Registro de usuarios
│  ├─ routes/
│  │  ├─ admin.js           # Rutas del panel admin (productos, pedidos, etc.)
│  │  ├─ auth.js            # Rutas de autenticación (login/logout) versión MVC
│  │  ├─ productos.js       # Rutas de productos versión MVC
│  │  └─ usuarios.js        # Rutas de usuarios versión MVC
│  └─ views/                # (Reservado para vistas si se usa motor de plantillas)
│
├─ package.json             # Dependencias y scripts de npm
├─ package-lock.json
└─ README.md                # Este archivo
3. Descripción por carpeta / archivo
/db
Vive_Salud.mwb
Archivo de diseño de la base de datos en MySQL Workbench.

Vive_Salud.sql
Script para crear el esquema vive_salud y las tablas (incluye datos base del
catálogo AbanteCart).

src/app.js
Archivo principal del servidor Express:

Configura middlewares: morgan, express.json, express.urlencoded,
express.static y express-session.

Crea la conexión MySQL con express-myconnection.

Define rutas básicas:

/ → sirve public/index.html (tienda).

/productos → consulta los productos y categorías desde tablas abc_*.

/usuarios → registro de usuarios (insert en tabla usuarios).

/login → login de usuarios, verificación con bcrypt y guardado en sesión.

/logout → cierra sesión.

/api/pedidos → crea pedidos y detalles en pedidos y pedido_detalles.

/api/mis-pedidos y /api/mis-pedidos-pendientes → pedidos del usuario logueado.

/api/pedidos/:id → detalle de un pedido.

/api/pedidos/:id/pagar → marca un pedido como pagado.

Monta el router de administrador: app.use("/admin", adminRouter);

Arranca el servidor en el puerto 3000.

En resumen, aquí se orquesta toda la lógica del backend y la comunicación con la BD.

src/config/
Carpeta pensada para centralizar configuración:

Parámetros de conexión a la base de datos.

Otras constantes o configuraciones reutilizables.

(Dependiendo de la versión del proyecto, parte de esta configuración puede estar directamente en app.js.)

src/controllers/
Controladores para una versión más organizada tipo MVC:

authController.js
Funciones para login, logout, registro, verificación de sesión, etc.

productosController.js
Funciones que leen y gestionan productos desde las tablas abc_products,
abc_product_descriptions, abc_products_to_categories, etc.

En la versión actual muchas rutas ya están definidas directamente en app.js, pero estos controladores permiten separar la lógica si se desea refactorizar.

src/middlewares/
auth.js
Middlewares de autenticación (por ejemplo, verificar si el usuario está logueado o si es admin) para proteger rutas del panel de administración.

src/models/
Usuario.js
Modelo de acceso a datos de la tabla usuarios.
Centraliza consultas como crear usuario, buscar por email, etc.

src/public/ (Frontend)
Todo lo que se sirve directamente al navegador:

imagenes/
Recursos gráficos de la tienda y del panel admin.

js/tienda.js
Versión separada del JavaScript de la tienda (manejo de carrito, etc.).
En la versión actual, gran parte de esa lógica también está embebida en
index.html.

index.html
Página principal de la tienda:

Muestra el catálogo de productos consumiendo /productos.

Implementa el carrito lateral con stock, sumas/restas y validaciones.

Llama a /api/pedidos para crear el pedido antes de ir a la pantalla de pago.

Controla la sesión en el frontend (muestra botones de login, logout, etc.).

login.html / registro.html
Formularios para que el usuario inicie sesión y se registre.
Se comunican con /login y /usuarios del backend.

mis-pedidos.html
Lista todos los pedidos del usuario logueado usando /api/mis-pedidos.
Permite ver los detalles de un pedido y, si está pendiente, ir a pagarlo.

pago.html
Pantalla donde el usuario paga un pedido pendiente:

Lee el pedido pendiente desde sessionStorage o desde /api/mis-pedidos-pendientes.

Simula el formulario de pago.

Llama a /api/pedidos/pagar para marcar el pedido como pagado.

checkout.html
Flujo alterno de pago utilizado en pruebas.
Muestra un resumen del carrito directamente y crea/paga el pedido en una sola pantalla.

admin.html
Panel de administración:

Gestión del catálogo (productos, stock, etc.) a través de /admin.

Consulta de pedidos, cambio de estado, etc.

src/routes/
Routers Express separados (útiles si se adopta por completo el patrón MVC):

admin.js
Rutas del panel de administración.
Gestiona productos, categorías, stock y pedidos desde la interfaz admin.

auth.js / productos.js / usuarios.js
Rutas agrupadas por módulo (autenticación, productos, usuarios) que pueden
reemplazar o complementar las rutas definidas en app.js.

src/views/
Carpeta reservada para plantillas si más adelante se usa un motor como EJS,
Pug, Handlebars, etc.
Actualmente la app usa HTML estático en public/, por lo que esta carpeta puede estar vacía o contener pruebas.

4. Flujo principal de la aplicación
Registro / Login

El usuario se registra en registro.html → /usuarios.

Inicia sesión en login.html → /login, se guarda la sesión en backend y datos básicos en sessionStorage.

Navegación por la tienda

index.html consulta /productos y muestra el catálogo organizado por categorías.

El usuario agrega productos al carrito (validando stock).

Creación del pedido

Desde el carrito, al dar clic en “Finalizar”, se llama a /api/pedidos.

Se crean registros en pedidos y pedido_detalles y se guarda un
pedido_pendiente en sessionStorage.

Pago

El usuario es redirigido a pago.html, que busca el pedido pendiente y
simula el formulario de pago.

Al enviar, se llama a /api/pedidos/pagar para marcar el pedido como
pagado.

Consulta de pedidos

En mis-pedidos.html el usuario ve todo su historial (/api/mis-pedidos) y
puede visualizar el detalle de cada compra.

5. Ejecución del proyecto
Instalar dependencias

bash
Copiar código
npm install
Crear base de datos

Crear un esquema MySQL llamado vive_salud.

Importar db/Vive_Salud.sql.

Configurar conexión

Revisar credenciales de conexión en src/app.js (host, user, password, database) y ajustarlas a tu entorno MySQL.

Arrancar el servidor

bash
Copiar código
node src/app.js
# o, si en package.json existe el script:
npm start
Abrir la aplicación

Navegar a http://localhost:3000 para ver la tienda.

http://localhost:3000/admin.html para el panel de administración.

http://localhost:3000/mis-pedidos.html para los pedidos del usuario.

