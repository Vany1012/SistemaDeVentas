const express = require('express');
const { registrarDevolucion, obtenerTodasLasDevoluciones } = require('../controllers/devolucionesController');
const { protect } = require('../middleware/vendedorMiddleware');
const devolucionRouter = express.Router();

devolucionRouter.route('/registerDevolucion')
    .post(protect, registrarDevolucion); // Ruta para registrar una devolución (requiere token), te pide en el body idVenta, lista de productos devueltos con su idProducto, nombre, cantidad

devolucionRouter.route('/reporteDevoluciones') // Ruta para reporte de todas las devoluciones (solo admin)
    .get(protect, obtenerTodasLasDevoluciones);

module.exports = devolucionRouter;
