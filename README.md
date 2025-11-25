# Vive+Salud

## Descripción
Proyecto de servidor backend utilizando **Node.js**, **Express** y **MySQL**.  
Permite conectarse a la base de datos `vive_salud` y realizar consultas básicas.  
El proyecto está diseñado como base para un sistema de gestión de productos de un emprendimiento de salud.

---

## Tecnologías utilizadas
- **Node.js** v18+
- **Express** v5
- **MySQL** v8
- **express-myconnection** para manejar la conexión a la base de datos
- **morgan** para registro de logs HTTP

---

## Instalación

1. Clonar el repositorio:

```bash
gh repo clone IgnacioLauriano/vive_salud
cd node.js
Instalar dependencias:

bash
Copiar código
npm install
Configurar la base de datos MySQL:

Crear base de datos vive_salud

Crear usuario vive_salud con contraseña 12345

Otorgar privilegios al usuario:

sql
Copiar código
CREATE DATABASE IF NOT EXISTS vive_salud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vive_salud'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON vive_salud.* TO 'vive_salud'@'localhost';
FLUSH PRIVILEGES;
Uso
Iniciar el servidor:

bash
Copiar código
npm start
Acceder a las rutas de prueba:

Servidor activo: http://localhost:3000/

Conexión a la base de datos: http://localhost:3000/test-db

⚠️ Nota: La ruta /test-db actualmente solo sirve para probar la conexión a MySQL.

Estructura del proyecto
bash
Copiar código
node.js/
│
├─ src/
│  └─ app.js           # Archivo principal del servidor
│
├─ package.json        # Dependencias y configuración del proyecto
└─ README.md           # Documentación del proyecto
Configuración recomendada
Asegúrate de tener MySQL 8 o superior.

Node.js versión 18+.

Si usas Node.js con ES Modules, agrega "type": "module" en tu package.json.

enlace de repositorio: https://github.com/IgnacioLauriano/vive_salud


Autor
Ignacio Méndez}