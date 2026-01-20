const express = require('express');
const {registerVendedor, loginVendedor} = require('../controllers/vendedorController');
const vendedorRouter = express.Router();

const {protect} = require('../middleware/vendedorMiddleware');

vendedorRouter.route('/register') // Ruta para registrar un nuevo vendedor solo admin, te pide en el body vendedorName, email, password, role, vendedorId, active este es opcional, por defecto es true
.post(protect, registerVendedor);

vendedorRouter.post('/login', loginVendedor); // Ruta para login de vendedor, te pide en el body email y password

module.exports = vendedorRouter;