const express = require('express');
const categoriaProductoRouter = express.Router();
const categoriaProductoController = require('../controllers/categoriaController');
const { protect } = require('../middleware/vendedorMiddleware');


categoriaProductoRouter.route('/crearCategoriaProducto')
    .post(protect, categoriaProductoController.createCategoria);

categoriaProductoRouter.route('/eliminarCategoriaProducto')
    .patch(protect, categoriaProductoController.eliminarCategoria);


categoriaProductoRouter.route('/verCategoriasProducto')
    .get(protect, categoriaProductoController.verCategorias);

module.exports = categoriaProductoRouter;