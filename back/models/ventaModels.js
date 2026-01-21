const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema(
    {
       fecha: {type: Date, default: Date.now},
       vendedor: {type: String, required: true, trim:true},
       productosVendidos: [{
           idProducto: {type: String, required: true},
           nombre: {type: String, required: true},
           cantidad: {type: Number, required: true, min:1},
           precioUnitario: {type: Number, required: true, min:0}
       }],
       totalProductos: {type: Number, required: true, min:0},
       total: {type: Number, required:true, min:0},
       metodoPago: {type: String, required: true, enum: ['efectivo', 'tarjeta', 'transferencia'], trim: true},
       cambio: {type: Number, default: 0, min: 0}
})
module.exports = mongoose.model('Venta', ventaSchema);