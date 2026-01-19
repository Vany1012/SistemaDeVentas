const express = require('express');
const inventarioRouter = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { protect } = require('../middleware/vendedorMiddleware');

inventarioRouter.route('/crearProducto')
        .post ( protect, inventarioController.crearProducto ); // Ruta para crear un nuevo producto (requiere token), te pide en el body idProducto, nombre, precio, stock, categoria y si esta activo, por defecto es true

inventarioRouter.route('/eliminarProducto')
        .patch ( protect, inventarioController.eliminarProducto ); // Ruta para eliminar un producto por idProducto (requiere token)

inventarioRouter.route('/verInventario')
        .get ( protect, inventarioController.verInventario ); // Ruta para ver el inventario completo (requiere token)

inventarioRouter.route('/editarProductoPorId')
        .put ( protect, inventarioController.editarProductoPorId ); // Ruta para editar un producto por idProducto (requiere token), solo debe enviarse en el body los campos a modificar
module.exports = inventarioRouter;