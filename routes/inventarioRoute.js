const express = require('express');
const inventarioRouter = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { protect } = require('../middleware/vendedorMiddleware');

inventarioRouter.post('/crearProducto', protect, inventarioController.crearProducto);
inventarioRouter.delete('/eliminarProducto', protect, inventarioController.eliminarProducto);
inventarioRouter.get('/verInventario', protect, inventarioController.verInventario);

module.exports = inventarioRouter;