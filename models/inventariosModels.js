const inventarioSchema = new mongoose.Schema(
    {
        nombre: {type: String, required: true, trim: true},
        precio: {type: Number, required: true, min:0},
        stock: {type: Number, required: true, min: 0},
        categoria: {type: String, required: true, trim: true},
        activo: {type: Boolean, default: true}
    })

module.exports = mongoose.model('Inventario', inventarioSchema);