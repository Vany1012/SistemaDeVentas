const express = require('express');
const inventarioRouter = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { protect } = require('../middleware/vendedorMiddleware');

inventarioRouter.route('/crearProducto')
        .post ( protect, inventarioController.crearProducto );

inventarioRouter.route('/eliminarProducto')
        .patch ( protect, inventarioController.eliminarProducto );

inventarioRouter.route('/verInventario')
        .get ( protect, inventarioController.verInventario );

inventarioRouter.route('/editarProductoPorId')
        .put ( protect, inventarioController.editarProductoPorId );
module.exports = inventarioRouter;