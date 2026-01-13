const devolucionSchema = new mongoose.Schema({
    id_venta: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: true },
    id_producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad_devuelta: { type: Number, required: true },
    devolucion_parcial_total: { type: Number, required: true },
    fecha_devolucion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Devolucion', devolucionSchema);