const mongoose = require('mongoose');
const Contador = require('./contadorModel'); 

const ventaSchema = new mongoose.Schema(
    {
       ventaId: { type: String, unique: true },
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
});

ventaSchema.pre('save', async function() {
    const doc = this;
    if (!doc.isNew) {
        return; 
    }
    try {
        const contador = await Contador.findByIdAndUpdate(
            { _id: 'ventaId' },  // Nombre del contador
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        doc.ventaId = `03${contador.seq}`;
    } catch (error) {
        throw error;
    }
});

module.exports = mongoose.model('Venta', ventaSchema);