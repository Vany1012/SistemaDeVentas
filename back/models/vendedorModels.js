// vendedorModels.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const vendedorSchema = new mongoose.Schema({
    vendedorName: { type: String, required: true, trim: true },
    vendedorId: { type: String, required: true, trim: true, unique: true },
    role: { type: String, required: true, enum: ['admin', 'vendedor'], default: "vendedor" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: true }
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

