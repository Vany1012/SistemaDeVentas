// vendedorModels.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Contador = require('./contadorModel'); 

const vendedorSchema = new mongoose.Schema({
    vendedorName: { type: String, required: true, trim: true },
    vendedorId: { type: String, unique: true },
    role: { type: String, required: true, enum: ['admin', 'vendedor'], default: "vendedor" },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Por favor ingresa un email válido']
    },
    password: { type: String, required: true },
    active: { type: Boolean, default: true }
});


vendedorSchema.pre('save', async function() {
    const doc = this;
    if (!doc.isNew) {
        return; 
    }
    try {
        // Buscamos el contador y le sumamos 1 atómicamente
        const contador = await Contador.findByIdAndUpdate(
            { _id: 'vendedorId' },  // Nombre del contador
            { $inc: { seq: 1 } },   // Incrementamos secuencia en 1
            { new: true, upsert: true } // new: devuelve el dato actualizado. upsert: crea el contador si no existe.
        );

        doc.vendedorId = `01${contador.seq}`;
    } catch (error) {
        throw error;
    }
});

vendedorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    // Encriptar
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

vendedorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('vendedor', vendedorSchema);

