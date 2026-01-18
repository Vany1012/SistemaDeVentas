const mongoose = require('mongoose');

const devolucionSchema = new mongoose.Schema({
    idVenta: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: true }, 
    vendedor: { type: String, required: true }, 
    productosDevueltos: [{ 
        idProducto: { type: String, required: true },
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 }, 
        precioUnitario: { type: Number, required: true, min: 0 } 
    }],
    totalProductosDevueltos: { type: Number, required: true, min: 0 }, 
    totalReembolsado: { type: Number, required: true, min: 0 },
    fechaDevolucion: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Devolucion', devolucionSchema); 