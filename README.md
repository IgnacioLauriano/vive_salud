# Vive+Salud

## Descripción

**Vive+Salud** es un proyecto backend desarrollado con **Node.js**, **Express** y **MySQL** que sirve como base para un sistema de gestión de un emprendimiento de bienestar y salud.

Incluye:

- Conexión a la base de datos `vive_salud`.
- Panel de administración protegido (`/admin`) con CRUD completo de:
  - **Productos**
  - **Categorías**
  - **Clientes / Usuarios**
- Formularios web para crear, visualizar, actualizar y eliminar registros.
- Autenticación de usuarios con contraseñas encriptadas.

---

## Características principales

- ✅ Backend en **Node.js + Express** con ES Modules.
- ✅ Conexión a **MySQL** usando `express-myconnection`.
- ✅ **Autenticación** de usuarios (login) usando `bcrypt` y **sesiones**.
- ✅ Panel de administración accesible solo para usuarios autenticados.
- ✅ CRUD completo:
  - Productos (`abc_products`, `abc_product_descriptions`)
  - Categorías (`abc_categories`, `abc_category_descriptions`)
  - Clientes (`usuarios`)
- ✅ Frontend básico:
  - Página pública (`index.html`)
  - Login (`login.html`)
  - Registro (`registro.html`)
  - Panel admin (`admin.html`).

---

## Tecnologías utilizadas

- **Node.js** v18+  
- **Express**  
- **MySQL** 8+  
- **express-myconnection** – conexión a MySQL  
- **morgan** – logs HTTP  
- **express-session** – manejo de sesión  
- **bcrypt** – encriptado de contraseñas  
- **HTML + CSS** – interfaz básica para cliente y administrador  

---

## Requisitos previos

- Node.js 18 o superior
- MySQL 8 o superior
- npm (incluido con Node)

---

## Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/IgnacioLauriano/vive_salud.git
cd vive_salud/node.js
Instalar dependencias

bash
Copiar código
npm install
Configurar la base de datos MySQL

Puedes ejecutar el script SQL del proyecto (donde se crean tablas, datos de ejemplo y el usuario de BD).
O bien, crear la BD y el usuario manualmente:

sql
Copiar código
CREATE DATABASE IF NOT EXISTS vive_salud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'vive_salud'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON vive_salud.* TO 'vive_salud'@'localhost';
FLUSH PRIVILEGES;
El script del proyecto también crea y llena tablas como abc_products, abc_categories, abc_product_descriptions, abc_category_descriptions y usuarios.

Configurar Node.js como ES Modules

En package.json debe existir:

json
Copiar código
{
  "type": "module",
  ...
}
Ejecución
Para iniciar el servidor:

bash
Copiar código
npm start
Por defecto, el servidor corre en:

Servidor: http://localhost:3000/

Prueba de conexión a BD: http://localhost:3000/test-db

Estructura del proyecto
bash
Copiar código
node.js/
│
├─ src/
│  ├─ app.js               # Archivo principal del servidor Express
│  ├─ routes/
│  │   └─ admin.js         # Rutas del panel de administración (CRUD catálogos)
│  ├─ middlewares/
│  │   └─ auth.js          # Middleware de autenticación (isAuthenticated)
│  └─ ...
│
├─ public/
│  ├─ index.html           # Página principal / vista pública
│  ├─ login.html           # Pantalla de inicio de sesión
│  ├─ registro.html        # Pantalla de registro de usuario
│  └─ admin.html           # Panel de administración (Productos, Categorías, Clientes)
│
├─ package.json            # Dependencias y scripts
└─ README.md               # Documentación del proyecto
Rutas principales
Rutas públicas (frontend)
GET /
Devuelve public/index.html.

GET /login.html
Formulario de inicio de sesión (cliente/admin).

GET /registro.html
Formulario de registro de nuevos usuarios.

GET /productos
Devuelve en JSON el listado de productos (JOIN de tablas de productos y categorías) para mostrar en la parte pública.

Autenticación
POST /usuarios
Registra un nuevo usuario.

Hashea la contraseña con bcrypt.

Inserta en tabla usuarios.

POST /login
Valida email y contraseña:

Verifica en tabla usuarios.

Compara contraseña con bcrypt.

Guarda el usuario en req.session.user.

GET /logout (si está configurada)
Cierra la sesión de usuario.

El middleware isAuthenticated se usa para proteger las rutas del panel admin.

Panel de administración /admin
GET /admin

Requiere sesión activa.

Devuelve admin.html con el nombre del usuario en el encabezado.

Desde aquí se tiene un menú para Productos, Categorías y Clientes.

CRUD Productos
GET /admin/productos
Lista productos con: id, name, model, price, quantity.

POST /admin/productos
Crea un nuevo producto:

Inserta en abc_products (model, sku, price, quantity).

Inserta en abc_product_descriptions (name).

PUT /admin/productos/:id
Actualiza los datos del producto y su descripción.

DELETE /admin/productos/:id
Elimina el producto y su descripción ligada.

CRUD Categorías
GET /admin/categorias
Lista categorías con: id, parent_id, status, name, description.

POST /admin/categorias
Crea una nueva categoría (abc_categories + abc_category_descriptions).

PUT /admin/categorias/:id
Actualiza categoría y su descripción.

DELETE /admin/categorias/:id
Elimina la categoría.

CRUD Clientes
GET /admin/clientes
Lista registros de la tabla usuarios.

POST /admin/clientes
Crea un nuevo cliente (usuario) en la tabla usuarios.

PUT /admin/clientes/:id
Actualiza datos del cliente (nombre, email, teléfono).

DELETE /admin/clientes/:id
Elimina un cliente.

Uso básico del panel admin
Crear un usuario (por registro o manualmente en BD).

Iniciar sesión desde login.html.

Al iniciar sesión correctamente, acceder a /admin.

Desde el panel:

Productos: crear/editar/eliminar productos (nombre, modelo, precio, stock).

Categorías: gestionar categorías con nombre, descripción, padre y estado.

Clientes: gestionar registros de la tabla usuarios.

Todo lo que se modifica en el panel se guarda directamente en MySQL.

Notas de seguridad
Las contraseñas de usuarios se almacenan hasheadas con bcrypt.

El acceso a /admin y a las rutas de CRUD está protegido por sesión.

Para un entorno productivo se recomienda:

Usar variables de entorno para credenciales.

Usar HTTPS.

Configurar mejor las opciones de sesión (cookie segura, expiración, etc.).

Scripts npm
En package.json puedes tener algo como:

json
Copiar código
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js"
}
Para desarrollo:

bash
Copiar código
npm run dev
Enlace al repositorio
Repositorio en GitHub:
https://github.com/IgnacioLauriano/vive_salud

Autor
Proyecto desarrollado por Ignacio Méndez.