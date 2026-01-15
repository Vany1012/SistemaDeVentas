const express = require('express');
const {registrarVentas} = require('../controllers/ventaController');
const { protect } = require('../middleware/authMiddleware');
const ventaRouter = express.Router();

ventaRouter.post('/registerVenta', registrarVentas);