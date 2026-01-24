const mongoose = require('mongoose');
const Contador = require('./contadorModel'); 

const categoriaProductoSchema = new mongoose.Schema({
    categoriaProducto: { type: String, unique: true, required: true},
    categoriaId: { type: String, unique: true },
    activo: { type: Boolean, default: true }
});

categoriaProductoSchema.pre('save', async function() {
    const doc = this;
        if (!doc.isNew) {
            return; 
        }
        try {
            const contador = await Contador.findByIdAndUpdate(
                { _id: 'idCategoria' },  // Nombre del contador
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            doc.categoriaId = `02${contador.seq}`;
        } catch (error) {
            throw error;
        }
    });


module.exports = mongoose.model('CategoriaProducto', categoriaProductoSchema);

