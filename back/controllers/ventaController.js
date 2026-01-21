const Venta = require('../models/ventaModels');
const Producto = require('../models/inventariosModels');

exports.registrarVentas = async (req, res) => {
    try {
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if(req.vendedor.role === req.role){
                const { vendedor, productosVendidos, metodoPago, monto } = req.body;

            if (!vendedor || !productosVendidos || productosVendidos.length === 0) {
                return res.status(400).json({ message: 'Faltan datos: vendedor y productosVendidos son requeridos' });
            }

            if (!metodoPago) {
                return res.status(400).json({ message: 'El método de pago es requerido' });
            }
            let total = 0;
            let totalProductos = 0;
            const productosParaVenta = [];

            for (const p of productosVendidos) {
                const { idProducto, cantidad } = p;

                if (!idProducto || !cantidad || cantidad <= 0) {
                    return res.status(400).json({ message: `Datos inválidos para producto ${idProducto} `});
                }
                const producto = await Producto.findOne({ idProducto, activo: true });
                if (!producto) {
                    return res.status(404).json({ message: `Producto con Id:${idProducto} no encontrado`});
                }
                if (producto.stock < cantidad) {
                    return res.status(400).json({ message:`Stock insuficiente para ${producto.nombre}. Stock Disponible: ${producto.stock}`});
                }
                productosParaVenta.push({
                    idProducto,
                    nombre: producto.nombre,
                    cantidad,
                    precioUnitario: producto.precio
                });

                total += producto.precio * cantidad;
                totalProductos += cantidad;
            }

            // Calculamos si hay cambio para darle al cliente
            let cambio = 0;
            if (metodoPago === 'efectivo') {
                if (!monto || monto < total) {
                    return res.status(400).json({ message: 'Monto de efectivo insuficiente' });
                }
                cambio = monto - total;
            }

            const nuevaVenta = new Venta({
                vendedor,
                productosVendidos: productosParaVenta,
                totalProductos,
                total,
                metodoPago,
                cambio
            });

            const ventaGuardada = await nuevaVenta.save();

            for (const p of productosParaVenta) {
                await Producto.findOneAndUpdate(
                    { idProducto: p.idProducto },
                    { $inc: { stock: -p.cantidad } }
                );
            }
            const productosSinId = ventaGuardada.productosVendidos.map(producto => {
                const prodObj = producto.toObject ? producto.toObject() : producto;
                delete prodObj._id;
                return prodObj;
            });

            res.status(201).json({ message: 'Venta registrada exitosamente', TicketDeVenta: {
                fecha: ventaGuardada.fecha,
                idVenta: ventaGuardada._id, 
                vendedor: ventaGuardada.vendedor, 
                productosVendidos: productosSinId, 
                totalProductos: ventaGuardada.totalProductos, 
                total: '$' + ventaGuardada.total,
                metodoPago: ventaGuardada.metodoPago,
                cambio: ventaGuardada.cambio ? '$' + ventaGuardada.cambio : 'N/A'} });
        }else{
             return res.status(403).json({ message: 'Acceso denegado: El rol no coincide o falta token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar venta', error: error.message });
    }
};

exports.obtenerVentas = async (req, res) => { 
    try {
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if (req.vendedor.role === req.role) { 
            const { page = 1, limit = 10, mes, anio } = req.query; 
            const skip = (page - 1) * limit;

            let filter = {};
            if (mes && anio) {
                const startDate = new Date(anio, mes - 1, 1); 
                const endDate = new Date(anio, mes, 1);
                filter.fecha = { $gte: startDate, $lt: endDate };
            }

            const ventas = await Venta.find(filter) 
                .sort({ fecha: -1 })
                .skip(skip) 
                .limit(parseInt(limit));

            const totalVentas = await Venta.countDocuments({ vendedor: req.vendedor.nombreVendedor });

            res.status(200).json({
                ventas,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalVentas,
                    pages: Math.ceil(totalVentas / limit)
                }
            });
        } else {
            return res.status(403).json({ message: 'Acceso denegado: El rol no coincide o falta token' }); 
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ventas', error: error.message }); 
    }
};

exports.obtenerTodasLasVentas = async (req, res) => {
    try {
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if (req.vendedor.role === req.role && req.role === "admin") {
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            const ventas = await Venta.find({})
                .sort({ fecha: -1 }) 
                .skip(skip) 
                .limit(parseInt(limit)); 

            const totalVentas = await Venta.countDocuments({}); 

            res.status(200).json({ 
                ventas, 
                pagination: { 
                    page: parseInt(page), 
                    limit: parseInt(limit),
                    total: totalVentas, 
                    pages: Math.ceil(totalVentas / limit)
                }
            });
        } else {
            return res.status(403).json({ message: 'Acceso denegado: Solo admins pueden ver todas las ventas' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener todas las ventas', error: error.message });
    }
};