-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 01-07-2026 a las 04:14:18
-- Versión del servidor: 8.0.30
-- Versión de PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `asistencia_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `hora_registro` time DEFAULT NULL,
  `estado` enum('presente','retardo','falta') DEFAULT 'presente',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `usuarioId` int DEFAULT NULL,
  `materiaId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`id`, `fecha`, `hora_registro`, `estado`, `createdAt`, `updatedAt`, `usuarioId`, `materiaId`) VALUES
(2, '2026-02-08', '12:22:41', 'presente', '2026-02-08 12:22:41', '2026-02-08 12:22:41', 8, 1),
(3, '2026-02-08', '12:24:46', 'presente', '2026-02-08 12:24:46', '2026-02-08 12:24:46', 6, 1),
(5, '2026-02-08', '12:28:28', 'presente', '2026-02-08 12:28:28', '2026-02-08 12:28:28', 7, 1),
(12, '2026-02-11', '14:07:45', 'presente', '2026-02-11 14:07:45', '2026-02-11 14:07:45', 6, 2),
(16, '2026-02-11', '08:30:53', 'presente', '2026-02-11 20:30:53', '2026-02-11 20:30:53', 7, 1),
(18, '2026-02-11', '20:43:49', 'presente', '2026-02-11 20:43:49', '2026-02-11 20:43:49', 6, 1),
(19, '2026-02-11', '20:45:57', 'presente', '2026-02-11 20:45:57', '2026-02-11 20:45:57', 8, 2),
(25, '2026-02-17', '16:30:23', 'presente', '2026-02-17 16:30:23', '2026-02-17 16:30:23', 8, 2),
(26, '2026-02-17', '16:31:24', 'presente', '2026-02-17 16:31:24', '2026-02-17 16:31:24', 6, 2),
(27, '2026-02-17', '16:31:37', 'presente', '2026-02-17 16:31:37', '2026-02-17 16:31:37', 6, 1),
(28, '2026-02-17', '16:32:02', 'presente', '2026-02-17 16:32:02', '2026-02-17 16:32:02', 6, 5),
(29, '2026-02-17', '16:33:06', 'presente', '2026-02-17 16:33:06', '2026-02-17 16:33:06', 7, 1),
(30, '2026-02-17', '16:35:20', 'presente', '2026-02-17 16:35:20', '2026-02-17 16:35:20', 15, 5),
(35, '2026-02-19', '20:47:15', 'presente', '2026-02-19 20:47:15', '2026-02-19 20:47:15', 32, 6),
(36, '2026-02-23', '16:27:21', 'presente', '2026-02-23 16:27:21', '2026-02-23 16:27:21', 14, 5),
(37, '2026-02-23', '16:28:16', 'presente', '2026-02-23 16:28:16', '2026-02-23 16:28:16', 6, 5),
(38, '2026-02-23', '16:28:49', 'presente', '2026-02-23 16:28:49', '2026-02-23 16:28:49', 15, 5),
(39, '2026-02-23', '16:29:26', 'presente', '2026-02-23 16:29:26', '2026-02-23 16:29:26', 8, 5),
(40, '2026-02-23', '16:32:00', 'presente', '2026-02-23 16:32:00', '2026-02-23 16:32:00', 6, 1),
(41, '2026-06-24', '12:57:20', 'presente', '2026-06-24 12:57:20', '2026-06-24 12:57:20', 14, 5),
(42, '2026-06-24', '12:58:49', 'presente', '2026-06-24 12:58:49', '2026-06-24 12:58:49', 6, 5),
(43, '2026-06-25', '10:46:31', 'presente', '2026-06-25 10:46:31', '2026-06-25 10:46:31', 14, 5),
(44, '2026-06-26', '13:10:02', 'presente', '2026-06-26 13:10:02', '2026-06-26 13:10:02', 7, 1),
(45, '2026-06-26', '13:40:55', 'presente', '2026-06-26 13:40:55', '2026-06-26 13:40:55', 52, 7),
(46, '2026-06-26', '16:12:31', 'presente', '2026-06-26 16:12:31', '2026-06-26 16:12:31', 8, 5),
(47, '2026-06-26', '16:13:37', 'presente', '2026-06-26 16:13:37', '2026-06-26 16:13:37', 14, 5),
(48, '2026-06-26', '16:14:06', 'presente', '2026-06-26 16:14:06', '2026-06-26 16:14:06', 6, 5),
(49, '2026-06-30', '15:08:59', 'presente', '2026-06-30 15:08:59', '2026-06-30 15:08:59', 14, 5),
(50, '2026-06-30', '15:09:25', 'presente', '2026-06-30 15:09:25', '2026-06-30 15:09:25', 6, 5),
(51, '2026-06-30', '15:09:45', 'presente', '2026-06-30 15:09:45', '2026-06-30 15:09:45', 8, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materia`
--

CREATE TABLE `materia` (
  `id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `profesorId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `materia`
--

INSERT INTO `materia` (`id`, `nombre`, `codigo`, `createdAt`, `updatedAt`, `profesorId`) VALUES
(1, 'Matemáticas Avanzadas', 'MAT-101', '2026-02-06 23:34:54', '2026-02-06 23:34:54', 2),
(2, 'Física I', 'FIS-101', '2026-02-06 23:34:54', '2026-02-06 23:34:54', 2),
(3, 'Programación Web', 'WEB-101', '2026-02-06 23:34:54', '2026-02-06 23:34:54', 3),
(4, 'Cyberseguridad II', 'CYB-123', '2026-02-08 12:48:46', '2026-02-12 15:16:29', 12),
(5, 'Redes e Internet', 'REI-124', '2026-02-11 22:57:23', '2026-02-12 13:47:58', 2),
(6, 'Investigacion I', 'In-123', '2026-02-19 20:40:15', '2026-06-25 21:05:22', 12),
(7, 'Lenguaje y comunicacion', 'LEN-023', '2026-06-25 21:19:28', '2026-06-25 21:52:08', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `matriculas`
--

CREATE TABLE `matriculas` (
  `id` int NOT NULL,
  `periodo` varchar(255) NOT NULL,
  `estudianteId` int NOT NULL,
  `materiaId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `matriculas`
--

INSERT INTO `matriculas` (`id`, `periodo`, `estudianteId`, `materiaId`, `createdAt`, `updatedAt`) VALUES
(4, '2026-1', 7, 3, '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(5, '2026-1', 8, 3, '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(7, '2026-1', 7, 1, '2026-02-07 13:32:34', '2026-02-07 13:32:34'),
(8, '2026-1', 8, 2, '2026-02-07 14:34:41', '2026-02-07 14:34:41'),
(13, '2026-1', 6, 1, '2026-02-07 15:28:22', '2026-02-07 15:28:22'),
(14, '2026-1', 6, 2, '2026-02-08 10:16:32', '2026-02-08 10:16:32'),
(18, '2026-1', 7, 4, '2026-02-11 21:54:14', '2026-02-11 21:54:14'),
(21, '2026-1', 14, 5, '2026-02-12 18:32:05', '2026-02-12 18:32:05'),
(22, '2026-1', 6, 5, '2026-02-12 18:32:05', '2026-02-12 18:32:05'),
(24, '2026-1', 8, 5, '2026-02-12 18:35:04', '2026-02-12 18:35:04'),
(44, '2026-1', 32, 6, '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(45, '2026-1', 33, 6, '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(46, '2026-1', 34, 6, '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(47, '2026-1', 35, 6, '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(48, '2026-1', 36, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(49, '2026-1', 37, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(50, '2026-1', 38, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(51, '2026-1', 39, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(52, '2026-1', 40, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(53, '2026-1', 41, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(54, '2026-1', 42, 6, '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(55, '2026-1', 43, 6, '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(56, '2026-1', 44, 6, '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(57, '2026-1', 45, 6, '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(58, '2026-1', 46, 6, '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(60, '2026-2', 14, 2, '2026-06-24 13:14:21', '2026-06-24 13:14:21'),
(61, '2026-2', 35, 4, '2026-06-25 10:49:13', '2026-06-25 10:49:13'),
(63, '2026-1', 48, 4, '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(64, '2026-1', 49, 4, '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(65, '2026-1', 50, 4, '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(66, '2026-1', 51, 4, '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(67, '2026-2', 15, 2, '2026-06-25 13:07:00', '2026-06-25 13:07:00'),
(70, '2026-1', 52, 7, '2026-06-26 13:28:14', '2026-06-26 13:28:14'),
(71, '2026-1', 48, 7, '2026-06-26 13:28:14', '2026-06-26 13:28:14'),
(72, '2026-1', 49, 7, '2026-06-26 13:28:14', '2026-06-26 13:28:14'),
(73, '2026-1', 50, 7, '2026-06-26 13:28:14', '2026-06-26 13:28:14'),
(74, '2026-1', 51, 7, '2026-06-26 13:28:14', '2026-06-26 13:28:14'),
(75, '2026-2', 14, 3, '2026-06-26 15:34:35', '2026-06-26 15:34:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `cedula` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL DEFAULT 'estudiante',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `cedula`, `nombre`, `email`, `password`, `rol`, `createdAt`, `updatedAt`) VALUES
(1, '1700000000', 'Admin General', 'admin@test.com', '$2b$10$coAAHsq7YfQll.cT6NShGO0ArsWn55/yiJTyDHMuIEcJYvy15GjWi', 'admin', '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(2, '1711111111', 'Ing. Carlos Docente', 'profe1@test.com', '$2b$10$coAAHsq7YfQll.cT6NShGO0ArsWn55/yiJTyDHMuIEcJYvy15GjWi', 'profesor', '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(3, '1722222222', 'Lic. Laura Educadora', 'profe2@test.com', '$2b$10$coAAHsq7YfQll.cT6NShGO0ArsWn55/yiJTyDHMuIEcJYvy15GjWi', 'profesor', '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(6, '1750000003', 'Sofia Ramirez', 'sofia@test.com', '$2b$10$coAAHsq7YfQll.cT6NShGO0ArsWn55/yiJTyDHMuIEcJYvy15GjWi', 'estudiante', '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(7, '1750000004', 'Jorge Gomez Gonzáles', 'jorge@test.com', '$2b$10$coAAHsq7YfQll.cT6NShGO0ArsWn55/yiJTyDHMuIEcJYvy15GjWi', 'estudiante', '2026-02-06 23:34:54', '2026-02-08 11:29:12'),
(8, '1750000005', 'Maria Torres', 'maria@test.com', '$2b$10$coAAHsq7YfQll.cT6NShGO0ArsWn55/yiJTyDHMuIEcJYvy15GjWi', 'estudiante', '2026-02-06 23:34:54', '2026-02-06 23:34:54'),
(12, '1736985487', 'Ing. Alexis Sánchez', 'profe3@test.com', '$2b$10$sO9O5LMH7XvFDrvTj.3pO.1nrfR5C5bK/1xQFGBgiCQrg3o1A1w3.', 'profesor', '2026-02-12 15:15:01', '2026-02-17 16:42:33'),
(14, '1750000001', 'Juan Pérez Lucho', 'juan@test.com', '$2b$10$ozJ/YTmOy/Otx/nASPXRj.5D51PxGU27TjkY9ygTqrBUaqx5wtbrO', 'estudiante', '2026-02-12 18:32:05', '2026-06-24 13:19:01'),
(15, '1728516657', 'Stalin Alexis Carrión', 'alexis@test.com', '$2b$10$S.V/alKH1y5OLXbkNxVqDe9E3GR8riF4bisoJ/XsI6mhrxttpQ6Xa', 'estudiante', '2026-02-12 18:32:06', '2026-06-25 12:45:01'),
(32, '1750000123', 'Andrea Salazar', 'andrea.salazar@test.com', '$2b$10$6zJXdMilVSioSDidJviUPekgMsGidhoRMIqYZ0GW2JboWBuJe2TEW', 'estudiante', '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(33, '1750000124', 'Diego Paredes', 'diego.paredes@test.com', '$2b$10$Wg5j6eHxvSNN6fBgwL6eqexJq7fpFzlEmCSrHcOYSxc5WR7y4Ma16', 'estudiante', '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(34, '1750000125', 'Camila Torres', 'camila.torres@test.com', '$2b$10$/GjtqKLaXkv3QzSNXHMWAO/z9eGMC3K8OJXloO0pC2Lr2HyrOoBri', 'estudiante', '2026-02-19 20:41:42', '2026-02-19 20:41:42'),
(35, '1750000126', 'Sebastián Rivas Rodriguez', 'sebastian.rivas@test.com', '$2b$10$/XS7N.Ot0PmpW53KDVCej.QrSbAdYSDwuvHusjhaT76QNG9.YFxJq', 'estudiante', '2026-02-19 20:41:42', '2026-06-25 16:10:11'),
(36, '1750000127', 'Valeria Mendoza', 'valeria.mendoza@test.com', '$2b$10$ke22Rv97CJcnLTFf/4bBz.BiZoqMzp90Ql/OhW1SU9tMYUZ8qRcoK', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(37, '1750000128', 'Nicolás Herrera', 'nicolás.herrera@test.com', '$2b$10$cAtzy1G6pDwV6s7WoHTtquAHFewk8jPoVP48mshSUbkytXYq/0i1.', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(38, '1750000129', 'Sofía Guzmán', 'sofía.guzmán@test.com', '$2b$10$SMjuoBpYLGivE.I4CWE.Vup5bXIb4TgdH1Ec6/kSIIvccgRW1XBu6', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(39, '1750000130', 'Mateo Cordero', 'mateo.cordero@test.com', '$2b$10$FHhAOzGa/CoH5ackV.DCreTunlodEbcB71eTfNnTJeyRyhDMM9oRi', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(40, '1750000131', 'Daniela Vaca', 'daniela.vaca@test.com', '$2b$10$N8i0s5sKf2V0mQiml/H9V.JfL/uGEb1Io6vb.hNt1OykIzESzVRZe', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(41, '1750000132', 'Gabriel Andrade', 'gabriel.andrade@test.com', '$2b$10$jg5RIH71zm3SYHGhMlDQk.M52noH3lfgXzwtapxLFUK5M9yLqh2Na', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(42, '1750000133', 'Fernanda López', 'fernanda.lópez@test.com', '$2b$10$yaHA75qvnL3Yofy99/4TleJqSS9B4.zgPTOA0wDmLOU5X0DUjF4HK', 'estudiante', '2026-02-19 20:41:43', '2026-02-19 20:41:43'),
(43, '1750000134', 'Juan Estrella', 'juan.estrella@test.com', '$2b$10$LW1nwYJX3.jsuYXk1rgNXuAXazWJ.0a/QCxFfgCqHoEsUm648d2gm', 'estudiante', '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(44, '1750000135', 'Carolina Villacís', 'carolina.villacís@test.com', '$2b$10$jeajMMJtmT8LUoTJMCIHW.sgHC8EqzquSm7i5xGl9y5RHE36URcHm', 'estudiante', '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(45, '1750000136', 'Martín Zambrano', 'martín.zambrano@test.com', '$2b$10$FPsjxZ.HUCTSFuhKNtaqJOcA.mxwXH/nju0a/RkPogvwrR5FbMuUe', 'estudiante', '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(46, '1750000137', 'Laura Castillo', 'laura.castillo@test.com', '$2b$10$c2f0ipDDkYQgaDZMpSGZeucHDD0Y3wtsfM9zDP/4P3kiG2CC9Uv6O', 'estudiante', '2026-02-19 20:41:44', '2026-02-19 20:41:44'),
(48, '923456781', 'Ana María Silva', 'ana.silva@prueba.com', '$2b$10$AzjreO4t6EBP.M5lC90q2.r5r/PQvBEaJjuOT4gu1SibCeZ95Dp6O', 'estudiante', '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(49, '1809876543', 'Luis Fernando Gómez', 'luis.gomez@prueba.com', '$2b$10$/7msZ2ZnlgslV7U7C6Qio.godtUrIvFEB6g1TgsBcCLGcMv5GCwxC', 'estudiante', '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(50, '511223344', 'María Elena Torres II', 'maria.torres@prueba.com', '$2b$10$dm5m85IBm171ZWrC.kzwIOLlwZN5xGX7kASV5Vv7ceuYs3uLpzi5a', 'estudiante', '2026-06-25 11:49:29', '2026-06-25 12:41:10'),
(51, '2405566778', 'Jorge Alejandro Ruiz', 'jorge.ruiz@prueba.com', '$2b$10$nqIpE1aMaxwfMAnhoOojZeCBnIFqCJC8BlAfjILxCer/q4N5/VWLe', 'estudiante', '2026-06-25 11:49:29', '2026-06-25 11:49:29'),
(52, '1712345678', 'Carlos Mendoza', 'carlos.mendoza@prueba.com', '$2b$10$hD4ewsXz6K5GwSrQfn8PruDFL5Ykkf8PhqMthalvu0.0YcDfUo4Mu', 'estudiante', '2026-06-26 13:28:14', '2026-06-26 13:28:14');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuarioId` (`usuarioId`),
  ADD KEY `materiaId` (`materiaId`);

--
-- Indices de la tabla `materia`
--
ALTER TABLE `materia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `profesorId` (`profesorId`);

--
-- Indices de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Matriculas_materiaId_estudianteId_unique` (`estudianteId`,`materiaId`),
  ADD KEY `materiaId` (`materiaId`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `materia`
--
ALTER TABLE `materia`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`materiaId`) REFERENCES `materia` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `materia`
--
ALTER TABLE `materia`
  ADD CONSTRAINT `materia_ibfk_1` FOREIGN KEY (`profesorId`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`estudianteId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`materiaId`) REFERENCES `materia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
