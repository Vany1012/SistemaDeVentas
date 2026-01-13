const ventaSchema = new mongoose.Schema(
    {
       fecha: {type: Date, required: true},
       vendedor: {type: String, required: true, trim:true},
       cantidades: {type: Number, required: true, min:0},
       total: {type: Number, required:true, min:0},
       listaProductos: {type:[String], default: []}

})
module.exports = mongoose.model('Venta', ventaSchema);