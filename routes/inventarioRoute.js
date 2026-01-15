const express = require('express');
const inventarioRouter = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { protect } = require('../middleware/authMiddleware');

inventarioRouter.post('/createProducto', protect, inventarioController.createProducto);
inventarioRouter.delete('/deleteProducto', protect, inventarioController.deleteProducto);
inventarioRouter.get('/verInventario', protect, inventarioController.verInventario);

module.exports = inventarioRouter;