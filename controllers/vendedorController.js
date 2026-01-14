const generateToken = (id, rol) => {
    return jwt.sign ( { id, rol }, process.env.JWT_SECRET, { expiresIn: `1h` } );
};


exports.registrarVentas = async (req, res) => {
    try {
        const venta = new Venta(req.body);
        await venta.save();
        res.status(201).json({ message: 'Venta registrada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
///
exports.registrarVentas = async (req, res) => {
    try {
        const { id, fecha, nombrevendedor, listaProductos, cantidadProductos, total } = new Venta(req.body);
        const exist = await Venta.findOne({ id });
        if (exist) {
            return res.status(400).json({ message: 'La venta ya existe' });
        }
        const venta = await venta.create({ id, fecha, nombrevendedor, listaProductos, cantidadProductos, total });
        res.status(201).json({ message: 'Venta registrada exitosamente', venta });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
///