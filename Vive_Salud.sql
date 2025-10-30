-- ============================================================
--   Base de Datos: vive_salud
--   Autor: Ignacio Méndez
--   Descripción: Estructura y datos base para la app Vive+Salud
--   Fecha: 2025-10-29
-- ============================================================

-- ============================================================
-- CONFIGURACIÓN Y USUARIO DEL PROYECTO
-- ============================================================

-- Crear base de datos con codificación UTF-8
CREATE DATABASE IF NOT EXISTS vive_salud
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE vive_salud;

-- Crear usuario con el nombre del proyecto
CREATE USER IF NOT EXISTS 'vive_salud'@'localhost' IDENTIFIED BY '12345';

-- Conceder permisos completos al usuario sobre la base de datos
GRANT ALL PRIVILEGES ON vive_salud.* TO 'vive_salud'@'localhost';
FLUSH PRIVILEGES;

-- ============================================================
-- TABLAS PRINCIPALES
-- ============================================================

CREATE TABLE `abc_products` (
  `product_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `model` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `price` DECIMAL(15,4) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `date_added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `abc_product_descriptions` (
  `product_id` INT NOT NULL,
  `language_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `meta_keywords` VARCHAR(255),
  `meta_description` VARCHAR(255),
  PRIMARY KEY (`product_id`, `language_id`)
);

CREATE TABLE `abc_categories` (
  `category_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `parent_id` INT NOT NULL DEFAULT 0,
  `status` INT NOT NULL DEFAULT 1,
  `date_added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `abc_category_descriptions` (
  `category_id` INT NOT NULL,
  `language_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `meta_keywords` VARCHAR(255),
  `meta_description` VARCHAR(255),
  PRIMARY KEY (`category_id`, `language_id`)
);

CREATE TABLE `abc_products_to_categories` (
  `product_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`product_id`, `category_id`)
);

CREATE TABLE `abc_stores` (
  `store_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(255)
);

CREATE TABLE `abc_manufacturers` (
  `manufacturer_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL
);

CREATE TABLE `abc_manufacturers_to_stores` (
  `manufacturer_id` INT NOT NULL,
  `store_id` INT NOT NULL,
  PRIMARY KEY (`manufacturer_id`, `store_id`)
);

CREATE TABLE `abc_customers` (
  `customer_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(32),
  `lastname` VARCHAR(32),
  `email` VARCHAR(96),
  `status` INT NOT NULL DEFAULT 1,
  `date_added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `abc_addresses` (
  `address_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `firstname` VARCHAR(32),
  `lastname` VARCHAR(32),
  `address_1` VARCHAR(255),
  `city` VARCHAR(64),
  `postcode` VARCHAR(10),
  `country_id` INT NOT NULL,
  `zone_id` INT NOT NULL
);

CREATE TABLE `abc_orders` (
  `order_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `store_id` INT NOT NULL,
  `total` DECIMAL(15,4),
  `date_added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `abc_order_products` (
  `order_product_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(15,4)
);

CREATE TABLE `abc_order_totals` (
  `order_total_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `code` VARCHAR(50),
  `title` VARCHAR(255),
  `value` DECIMAL(15,4)
);

CREATE TABLE `abc_order_history` (
  `order_history_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `order_status_id` INT NOT NULL,
  `date_added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `abc_order_statuses` (
  `order_status_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64)
);

CREATE TABLE `abc_languages` (
  `language_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64),
  `code` VARCHAR(2),
  `locale` VARCHAR(5)
);

CREATE TABLE `abc_currencies` (
  `currency_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(32),
  `code` VARCHAR(3),
  `symbol_left` VARCHAR(12),
  `symbol_right` VARCHAR(12),
  `value` DECIMAL(15,8),
  `status` INT
);

-- ============================================================
-- RELACIONES ENTRE TABLAS
-- ============================================================

ALTER TABLE `abc_products_to_categories`
  ADD FOREIGN KEY (`product_id`) REFERENCES `abc_products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD FOREIGN KEY (`category_id`) REFERENCES `abc_categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_addresses`
  ADD FOREIGN KEY (`customer_id`) REFERENCES `abc_customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_orders`
  ADD FOREIGN KEY (`customer_id`) REFERENCES `abc_customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD FOREIGN KEY (`store_id`) REFERENCES `abc_stores` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_order_products`
  ADD FOREIGN KEY (`order_id`) REFERENCES `abc_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD FOREIGN KEY (`product_id`) REFERENCES `abc_products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_order_totals`
  ADD FOREIGN KEY (`order_id`) REFERENCES `abc_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `abc_order_history`
  ADD FOREIGN KEY (`order_id`) REFERENCES `abc_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD FOREIGN KEY (`order_status_id`) REFERENCES `abc_order_statuses` (`order_status_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Idioma base
INSERT INTO `abc_languages` (`language_id`, `name`, `code`, `locale`)
VALUES (1, 'Español', 'es', 'es_MX');

-- Categorías
INSERT INTO `abc_categories` (`category_id`, `parent_id`, `status`) VALUES
(1, 0, 1),
(2, 0, 1),
(3, 0, 1);

INSERT INTO `abc_category_descriptions` (`category_id`, `language_id`, `name`, `description`)
VALUES
(1, 1, 'Bienestar Digital', 'Productos y funciones digitales centradas en la mejora del bienestar personal.'),
(2, 1, 'Servicios Premium y Suscripciones', 'Accede a planes avanzados y asesorías virtuales.'),
(3, 1, 'Alianzas y Productos Asociados', 'Colaboraciones y productos de bienestar ofrecidos en conjunto con aliados.');

-- Productos
INSERT INTO `abc_products` (`product_id`, `model`, `sku`, `price`, `quantity`)
VALUES
(1, 'APP001', 'APPBASICA', 0.0000, 1000),
(2, 'NOTIF001', 'RECORDATORIOS', 0.0000, 1000),
(3, 'GAME001', 'GAMIFICACION', 0.0000, 1000),
(4, 'SYNC001', 'WEARABLES', 49.0000, 1000),
(5, 'COM001', 'COMUNIDAD', 0.0000, 1000),
(6, 'PREM001', 'MEMBRESIA', 149.0000, 1000),
(7, 'ASE001', 'ASESORIA', 299.0000, 500),
(8, 'FID001', 'FIDELIZACION', 0.0000, 1000),
(9, 'EXC001', 'EXCLUSIVO', 0.0000, 1000),
(10, 'CORP001', 'CORPPLAN', 999.0000, 100),
(11, 'GYM001', 'GYMINTEG', 0.0000, 500),
(12, 'UNI001', 'UNICONV', 0.0000, 500),
(13, 'ADS001', 'PUBLICIDAD', 500.0000, 100),
(14, 'SUP001', 'SUPLEMENTOS', 0.0000, 1000),
(15, 'LATAM001', 'EXPANSION', 0.0000, 100);

-- Descripciones de productos
INSERT INTO `abc_product_descriptions` (`product_id`, `language_id`, `name`, `description`)
VALUES
(1, 1, 'App móvil', 'Plataforma con los cinco pilares del bienestar: hidratación, nutrición, ejercicio, sueño y salud mental.'),
(2, 1, 'Recordatorios inteligentes', 'Sistema de notificaciones con IA para mejorar hábitos diarios de salud.'),
(3, 1, 'Gamificación de hábitos', 'Retos, insignias y recompensas para motivar el cumplimiento de metas.'),
(4, 1, 'Sincronización con wearables', 'Integración con relojes y pulseras de actividad para un seguimiento completo.'),
(5, 1, 'Comunidad', 'Espacio virtual para compartir logros, consejos y motivación entre usuarios.'),
(6, 1, 'Membresía Premium', 'Acceso a funciones avanzadas, rutinas personalizadas y contenido exclusivo.'),
(7, 1, 'Asesorías virtuales', 'Consultas en línea con nutriólogos, psicólogos y entrenadores certificados.'),
(8, 1, 'Programa de fidelización', 'Beneficios y recompensas acumulables por uso constante de la app.'),
(9, 1, 'Contenido exclusivo', 'Guías, recetas y rutinas diseñadas por expertos en salud.'),
(10, 1, 'Programas corporativos', 'Planes de bienestar para empresas y sus colaboradores.'),
(11, 1, 'Integración con gimnasios', 'Acceso preferencial y promociones en gimnasios aliados.'),
(12, 1, 'Convenios con universidades', 'Programas de bienestar y charlas en instituciones educativas.'),
(13, 1, 'Publicidad segmentada', 'Espacios dentro de la app para marcas de salud, fitness y nutrición.'),
(14, 1, 'Suplementos aliados', 'Venta de suplementos y productos de nutrición de marcas certificadas.'),
(15, 1, 'Expansión LATAM y España', 'Estrategia de crecimiento internacional con alianzas locales.');

-- Relaciones productos–categorías
INSERT INTO `abc_products_to_categories` (`product_id`, `category_id`)
VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 2), (7, 2), (8, 2), (9, 2), (10, 2),
(11, 3), (12, 3), (13, 3), (14, 3), (15, 3);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
