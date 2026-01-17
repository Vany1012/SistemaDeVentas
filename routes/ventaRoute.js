const express = require('express');
const {registrarVentas} = require('../controllers/ventaController');
const { protect } = require('../middleware/vendedorMiddleware');
const ventaRouter = express.Router();

ventaRouter.post('/registerVenta', registrarVentas);