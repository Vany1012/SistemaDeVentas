const mongoose = require('mongoose');
const Contador = require('./contadorModel'); 

const devolucionSchema = new mongoose.Schema({
    devolucionId: { type: String, unique: true },
    ventaId: { type: String, required: true }, 
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

devolucionSchema.pre('save', async function(next) {
    const doc = this;
    if (!doc.isNew) {
        return next(); 
    }
    try {
        const contador = await Contador.findByIdAndUpdate(
            { _id: 'devolucionId' },  // Nombre del contador
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        doc.devolucionId = `04${contador.seq}`;
        
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Devolucion', devolucionSchema); 