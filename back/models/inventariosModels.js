const mongoose = require('mongoose');
const Contador = require('./contadorModel'); 

const inventarioSchema = new mongoose.Schema(
    {
        idProducto: {type:String, unique: true},
        nombre: {type: String, required: true, trim: true, unique: true},
        precio: {type: Number, required: true, min:0},
        stock: {type: Number, required: true, min: 0},
        categoria: {type: String, required: true, trim: true},
        activo: {type: Boolean, default: true}
    })

inventarioSchema.pre('save', async function() {
    const doc = this;
    if (!doc.isNew) {
        return; 
    }
    try {
        const contador = await Contador.findByIdAndUpdate(
            { _id: 'idProducto' },  // Nombre del contador
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        doc.idProducto = `02${contador.seq}`;
    } catch (error) {
        throw error;
    }
});

module.exports = mongoose.model('Inventario', inventarioSchema);