const express = require('express');
const router = express.Router();


crearMetodoPagoRoute.route('/crearMetodoPago')
    .post(protect, crearMetodoPago);

obtenerMetodosPagoRoute.route('/obtenerMetodosPago')    
    .get(protect, obtenerMetodosPago);

obtenerMetodoPagoByIdRoute.route('/obtenerMetodoPagoById/:id')
    .get(protect, obtenerMetodoPagoById);   
    
    
actualizarMetodoPagoRoute.route('/actualizarMetodoPago/:id')
    .put(protect, actualizarMetodoPago);
    
eliminarMetodoPagoRoute.route('/eliminarMetodoPago/:id')
    .delete(protect, eliminarMetodoPago);  
    
module.exports = router;