Vive+Salud – Tienda Digital de Bienestar
Una tienda web funcional que permite a los usuarios comprar productos de bienestar, gestionar pedidos, revisar detalles, pagar pedidos pendientes y administrar el stock desde un panel para administradores.
Desarrollada con Node.js, Express, MySQL y JavaScript puro (sin frameworks frontend).

Características
Catálogo dinámico de productos con categorías
Control real de stock
Botón de compra deshabilitado automáticamente cuando un producto está agotado

Carrito persistente con sessionStorage
Validación de stock desde frontend y backend
Modal de confirmación de vaciado de carrito
Sistema completo de pedidos
Pantalla de resumen y checkout
Pantalla de pago para pedidos pendientes
Vista de Mis pedidos con detalles mejorados
Panel de administración con:
-Lista de pedidos
-Detalles del cliente
-Productos del pedido
-Actualización de stock
-Login y registro de usuarios
-Diseño moderno y totalmente responsive

Tecnologías usadas
Backend
Node.js
Express
MySQL (mysql2)
Frontend
JavaScript (sin React ni Vue)
HTML5
CSS puro con diseño personalizado

Otros
-bcrypt (opcional para producción)
-sessionStorage para carrito y sesión
-Fetch API para comunicación AJAX


Requisitos previos
-Node.js (v16 o superior)
-MySQL
-Git


Instalación y ejecución (paso a paso)
1. Clonar el repositorio
git clone https://github.com/tu-usuario/vive-salud.git
cd vive-salud

2. Configurar la base de datos
El archivo SQL limpio (vive_salud.sql) contiene solo las tablas usadas por tu proyecto:
-usuarios
-pedidos
-pedido_detalles
-abc_products
-abc_product_descriptions
-abc_categories
-abc_category_descriptions
-abc_products_to_categories


Windows:
mysql -u root -p < vive_salud.sql
El puerto por defecto es 3306.


3. Instalar dependencias dentro de Visual Studio Code
npm install

4. Iniciar el servidor
node app.js

5. Ejecución

Al iniciar, el sistema solicitará iniciar sesión o registrarse.

Accesos principales:
Función	URL
Tienda	http://localhost:3000

Login	http://localhost:3000/login.html

Registro	http://localhost:3000/registro.html

Mis pedidos	http://localhost:3000/mis-pedidos.html

Pago de pedido	http://localhost:3000/pago.html

Panel Admin	http://localhost:3000/admin
Estructura del proyecto
ViveSalud
    ├── vive_salud.sql
    ├── app.js
    ├── package.json
    ├── package-lock.json
    ├── README.md
    └── public
        ├── index.html              # Tienda con carrito y stock dinámico
        ├── login.html
        ├── registro.html
        ├── mis-pedidos.html        # Lista + detalle de pedidos del cliente
        ├── pago.html               # Checkout y flujo de pago
        ├── admin.html              # Panel administrativo
        ├── css/
        ├── images/
        └── js/
            ├── manejoCarrito.js    # (opcional si lo separas)
            ├── productos.js
            └── pedidos.js