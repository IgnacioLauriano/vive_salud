# Proyecto Vive_Salud

Aplicación Node.js conectada a MySQL para gestionar productos, categorías y clientes de una app de bienestar.

---

## 🧱 Creación de la base de datos

1. Abre **MySQL Workbench**.
2. Ejecuta el archivo `db/Vive_Salud.sql`.
3. Esto creará:
   - La base de datos `Vive_Salud`
   - El usuario `vive_salud` con contraseña `12345`
   - Todas las tablas del proyecto

---

## ⚙️ Instalación de dependencias

Ejecuta en la terminal (en la raíz del proyecto):

```bash
npm install express mysql express-myconnection morgan
