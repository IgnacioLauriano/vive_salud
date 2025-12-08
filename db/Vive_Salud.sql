-- ============================================================
--   Base de Datos: vive_salud
--   Autor: Ignacio Méndez
--   Descripción: Estructura mínima usada por la app Vive+Salud
--   Tablas: productos, categorías, usuarios, pedidos
-- ============================================================

-- ============================================================
-- CONFIGURACIÓN Y USUARIO DEL PROYECTO
-- ============================================================

CREATE DATABASE IF NOT EXISTS vive_salud
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE vive_salud;

CREATE USER IF NOT EXISTS 'vive_salud'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON vive_salud.* TO 'vive_salud'@'localhost';
FLUSH PRIVILEGES;

-- ============================================================
-- TABLAS DE CATÁLOGO DE PRODUCTOS
-- ============================================================

CREATE TABLE `abc_categories` (
  `category_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `parent_id`   INT NOT NULL DEFAULT 0,
  `status`      INT NOT NULL DEFAULT 1,
  `date_added`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `abc_category_descriptions` (
  `category_id`     INT NOT NULL,
  `language_id`     INT NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `description`     TEXT,
  `meta_keywords`   VARCHAR(255),
  `meta_description` VARCHAR(255),
  PRIMARY KEY (`category_id`, `language_id`)
);

CREATE TABLE `abc_products` (
  `product_id`    INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `model`         VARCHAR(64) NOT NULL,
  `sku`           VARCHAR(64) NOT NULL,
  `price`         DECIMAL(15,4) NOT NULL,
  `quantity`      INT NOT NULL DEFAULT 0,       -- stock
  `date_added`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `abc_product_descriptions` (
  `product_id`      INT NOT NULL,
  `language_id`     INT NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `description`     LONGTEXT NOT NULL,
  `image_url`       VARCHAR(255),               -- para que funcione el SELECT de /productos
  `meta_keywords`   VARCHAR(255),
  `meta_description` VARCHAR(255),
  PRIMARY KEY (`product_id`, `language_id`)
);

CREATE TABLE `abc_products_to_categories` (
  `product_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`product_id`, `category_id`)
);

-- ============================================================
-- TABLAS DE USUARIOS Y PEDIDOS
-- ============================================================

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(100) NOT NULL,
  `email`           VARCHAR(100) NOT NULL UNIQUE,
  `password`        VARCHAR(255) NOT NULL,
  `telefono`        VARCHAR(15),
  `fecha_registro`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `pedidos` (
  `id`          INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `usuario_id`  INT NOT NULL,
  `fecha`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total`       DECIMAL(15,2) NOT NULL DEFAULT 0,
  `estado`      VARCHAR(20) NOT NULL DEFAULT 'pendiente',  -- pendiente / pagado / cancelado
  `direccion_envio` VARCHAR(255) NULL
);

CREATE TABLE `pedido_detalles` (
  `id`             INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `pedido_id`      INT NOT NULL,
  `product_id`     INT NOT NULL,
  `nombre_producto` VARCHAR(255) NOT NULL,
  `precio`         DECIMAL(15,2) NOT NULL,
  `cantidad`       INT NOT NULL,
  `subtotal`       DECIMAL(15,2) NOT NULL
);

-- ============================================================
-- RELACIONES ENTRE TABLAS
-- ============================================================

ALTER TABLE `abc_category_descriptions`
  ADD CONSTRAINT `fk_catdesc_category`
    FOREIGN KEY (`category_id`) REFERENCES `abc_categories` (`category_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_product_descriptions`
  ADD CONSTRAINT `fk_proddesc_product`
    FOREIGN KEY (`product_id`) REFERENCES `abc_products` (`product_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_products_to_categories`
  ADD CONSTRAINT `fk_ptc_product`
    FOREIGN KEY (`product_id`) REFERENCES `abc_products` (`product_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ptc_category`
    FOREIGN KEY (`category_id`) REFERENCES `abc_categories` (`category_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `pedido_detalles`
  ADD CONSTRAINT `fk_detalles_pedido`
    FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalles_producto`
    FOREIGN KEY (`product_id`) REFERENCES `abc_products` (`product_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- DATOS INICIALES DE CATEGORÍAS Y PRODUCTOS
-- (coinciden con lo que usa /productos en tu app)
-- ============================================================

INSERT INTO `abc_categories` (`category_id`, `parent_id`, `status`) VALUES
(1, 0, 1),
(2, 0, 1),
(3, 0, 1);

INSERT INTO `abc_category_descriptions` (`category_id`, `language_id`, `name`, `description`)
VALUES
(1, 1, 'Bienestar Digital', 'Productos y funciones digitales centradas en la mejora del bienestar personal.'),
(2, 1, 'Servicios Premium y Suscripciones', 'Accede a planes avanzados y asesorías virtuales.'),
(3, 1, 'Alianzas y Productos Asociados', 'Colaboraciones y productos de bienestar ofrecidos en conjunto con aliados.');

INSERT INTO `abc_products` (`product_id`, `model`, `sku`, `price`, `quantity`)
VALUES
(1, 'APP001', 'APPBASICA',      0.0000, 1000),
(2, 'NOTIF001', 'RECORDATORIOS', 0.0000, 1000),
(3, 'GAME001', 'GAMIFICACION',   0.0000, 1000),
(4, 'SYNC001', 'WEARABLES',     49.0000, 1000),
(5, 'COM001', 'COMUNIDAD',       0.0000, 1000),
(6, 'PREM001', 'MEMBRESIA',    149.0000, 1000),
(7, 'ASE001', 'ASESORIA',      299.0000, 500),
(8, 'FID001', 'FIDELIZACION',    0.0000, 1000),
(9, 'EXC001', 'EXCLUSIVO',       0.0000, 1000),
(10,'CORP001','CORPPLAN',      999.0000, 100),
(11,'GYM001', 'GYMINTEG',        0.0000, 500),
(12,'UNI001', 'UNICONV',         0.0000, 500),
(13,'ADS001', 'PUBLICIDAD',    500.0000, 100),
(14,'SUP001', 'SUPLEMENTOS',     0.0000, 1000),
(15,'LATAM001','EXPANSION',      0.0000, 100);

INSERT INTO `abc_product_descriptions` (`product_id`, `language_id`, `name`, `description`, `image_url`)
VALUES
(1, 1, 'App móvil', 'Plataforma con los cinco pilares del bienestar: hidratación, nutrición, ejercicio, sueño y salud mental.',          NULL),
(2, 1, 'Recordatorios inteligentes', 'Sistema de notificaciones con IA para mejorar hábitos diarios de salud.',                        NULL),
(3, 1, 'Gamificación de hábitos', 'Retos, insignias y recompensas para motivar el cumplimiento de metas.',                              NULL),
(4, 1, 'Sincronización con wearables', 'Integración con relojes y pulseras de actividad para un seguimiento completo.',                NULL),
(5, 1, 'Comunidad', 'Espacio virtual para compartir logros, consejos y motivación entre usuarios.',                                     NULL),
(6, 1, 'Membresía Premium', 'Acceso a funciones avanzadas, rutinas personalizadas y contenido exclusivo.',                             NULL),
(7, 1, 'Asesorías virtuales', 'Consultas en línea con nutriólogos, psicólogos y entrenadores certificados.',                           NULL),
(8, 1, 'Programa de fidelización', 'Beneficios y recompensas acumulables por uso constante de la app.',                                NULL),
(9, 1, 'Contenido exclusivo', 'Guías, recetas y rutinas diseñadas por expertos en salud.',                                             NULL),
(10,1, 'Programas corporativos', 'Planes de bienestar para empresas y sus colaboradores.',                                             NULL),
(11,1, 'Integración con gimnasios', 'Acceso preferencial y promociones en gimnasios aliados.',                                         NULL),
(12,1, 'Convenios con universidades', 'Programas de bienestar y charlas en instituciones educativas.',                                 NULL),
(13,1, 'Publicidad segmentada', 'Espacios dentro de la app para marcas de salud, fitness y nutrición.',                               NULL),
(14,1, 'Suplementos aliados', 'Venta de suplementos y productos de nutrición de marcas certificadas.',                                NULL),
(15,1, 'Expansión LATAM y España', 'Estrategia de crecimiento internacional con alianzas locales.',                                   NULL);

INSERT INTO `abc_products_to_categories` (`product_id`, `category_id`)
VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 2), (7, 2), (8, 2), (9, 2), (10, 2),
(11, 3), (12, 3), (13, 3), (14, 3), (15, 3);

-- ============================================================
-- USUARIO DE PRUEBA (contraseña en texto plano: "123456")
-- (Tu app la reescribe con bcrypt al registrar desde frontend)
-- ============================================================

INSERT INTO `usuarios` (nombre_completo, email, password, telefono)
VALUES 
('Ignacio Méndez', 'ignacio@example.com', '123456', '9611234567');

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
