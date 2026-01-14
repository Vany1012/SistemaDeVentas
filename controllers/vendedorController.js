const generateToken = (id, rol) => {
    return jwt.sign ( { id, rol }, process.env.JWT_SECRET, { expiresIn: `1h` } );
};


exports.registrarVentas = async (req, res) => {
    try {
        const { id, fecha, nombreVendedor, listaProductos, cantidadProductos, total } = new venta(req.body);
        const venta = await venta.create({ id, fecha, nombreVendedor, listaProductos, cantidadProductos, total });
        res.status(201).json({ message: 'Venta registrada exitosamente', venta });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
///


