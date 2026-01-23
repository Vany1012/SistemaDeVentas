const express = require('express');
const { registrarVentas, obtenerVentas, obtenerTodasLasVentas, obtenerReporteVentasPorDia, obtenerVentasDelDia } = require('../controllers/ventaController');
const { protect } = require('../middleware/vendedorMiddleware');
const ventaRouter = express.Router();

ventaRouter.route('/registerVenta')
    .post(protect, registrarVentas); // Ruta para registrar una nueva venta (requiere token) 
    // es un post que tienes que ingresarle en el body nombredelvendedor, 
    // lista de productos vendidos con su idproducto, 
    // nombre, 
    // cantidad
    // te devuelve un json con el ticket de venta con idVenta, fecha, vendedor, productos vendidos, total productos y total
ventaRouter.route('/ventas')
    .get(protect, obtenerVentas); // Ruta para obtener las ventas por fecha, filtradas por mes (parámetros query: mes, anio)

ventaRouter.route('/reporteVentas') // Ruta para reporte de todas las ventas (solo admin)
    .get(protect, obtenerTodasLasVentas);

ventaRouter.route('/reporteVentasPorDia') // Ruta para obtener ventas agrupadas por día con detalles de productos
    .get(protect, obtenerReporteVentasPorDia);

ventaRouter.route('/ventasDelDia') // Ruta para obtener SOLO las ventas del día actual
    .get(protect, obtenerVentasDelDia);

ventaRouter.route('/')
module.exports = ventaRouter;