const mongoose = require('mongoose');
// Es un contador, nos ayuda a generar el Id
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Aquí guardaremos 'vendedorId', 'productoId', etc.
    seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', CounterSchema);