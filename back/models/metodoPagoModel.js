const mongoose = require ('mongoose');

const metodoPagoSchema = new mongoose.Schema({
    id: {type: String, required: true, trim: true},
    tipoTarjeta: { type: String, required: true, trim:true},
    proveedor: {type: String, required: true, trim: true},
    ultimosCuatroDigitos: {type:String, required:true, trim:true},
    marca: {type:String, required:true, trim:true},
    fechaExpiracion: {type: String, required:true, trim: true},
})


module.exports = mongoose.model('metodoPago', metodoPagoSchema);