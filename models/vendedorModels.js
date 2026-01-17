// vendedorModels.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const vendedorSchema = new mongoose.Schema({
    vendedorName: { type: String, required: true, trim: true },
    vendedorId: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['admin', 'vendedor'], default: "vendedor" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: true }
});

// USANDO PROMESAS (Sin el parámetro next para evitar el TypeError)
vendedorSchema.pre('save', async function () {
    // Si el password no se modificó, no hacemos nada (Mongoose entiende el return en funciones async)
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

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ2ZW5kZWRvcklkIjoiNzg5IiwiaWF0IjoxNzY4NjIyMzQ3LCJleHAiOjE3Njg2NTExNDd9.tS5ZPWct58_3Wmk9f1Dx1ni8KqnvVtnC4ymgLy4BTr4