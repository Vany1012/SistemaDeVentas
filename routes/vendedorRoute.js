//instanciamos express
const express = require('express');
const {registerVendedor, loginVendedor} = require('../controllers/vendedorController');
const vendedorRouter = express.Router();

const {protect} = require('../middleware/vendedorMiddleware');

//instanciamos el router y declaramos dos rutas, login y register.
vendedorRouter.route('/register')
.post(protect, registerVendedor);
vendedorRouter.post('/login', loginVendedor);

//exportamos router
module.exports = vendedorRouter;