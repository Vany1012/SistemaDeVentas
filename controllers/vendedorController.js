const generateToken = (id, rol) => {
    return jwt.sign ( { id, rol }, process.env.JWT_SECRET, { expiresIn: `1h` } );
};


exports.registrarVentas = async (req, res) => {
    try {
        const venta = new venta(req.body);
        await venta.save();
        res.status(201).json({ message: 'Venta registrada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
///
exports.registrarVentas = async (req, res) => {
    try {
        const { id, fecha, nombrevendedor, listaProductos, cantidadProductos, total } = new venta(req.body);
        const exist = await venta.findOne({ id });
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

exports.inventario = async ( req, res ) => {
    const { email, password } = req.body;
    const user = await User.findOne ( { email } );
    if ( user && (await user.matchPassword(password)) ) {
        res.json ( {
            _id: user._id,
            nombre: user.nombre,
            precio: user.precio,
            stock: user.stock,
            categoria: user.categoria,
            activo: user.activo,
        } );
    } else {
        res.status(401).json( { message: `Wrong credentials` } );
    }
};
