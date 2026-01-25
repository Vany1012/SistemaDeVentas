const Devolucion = require('../models/devolucionesModels');
const Venta = require('../models/ventaModels');
const Producto = require('../models/inventariosModels');

exports.registrarDevolucion = async (req, res) => {
    try {
        if (req.vendedor.role === req.role) { 
            const { ventaId, productosDevueltos } = req.body;

            if (!ventaId || !productosDevueltos || productosDevueltos.length === 0) {
                return res.status(400).json({ message: 'Faltan datos: ventaId y productosDevueltos son requeridos' });
            }

            const venta = await Venta.findOne({ ventaId });
            if (!venta) {
                return res.status(404).json({ message: 'Venta no encontrada' });
            }

            // Devoluciones anteriores de esta venta
            const devolucionesAnteriores = await Devolucion.find({ ventaId });
            
            const productosYaDevueltos = {};
            for (const devolucion of devolucionesAnteriores) {
                for (const producto of devolucion.productosDevueltos) {
                    if (!productosYaDevueltos[producto.idProducto]) {
                        productosYaDevueltos[producto.idProducto] = 0;
                    }
                    productosYaDevueltos[producto.idProducto] += producto.cantidad;
                }
            }

            let totalReembolsado = 0;
            let totalProductosDevueltos = 0;
            const productosParaDevolucion = [];

            for (const item of productosDevueltos) {
                const { idProducto, cantidad } = item;

                if (!idProducto || !cantidad || cantidad <= 0) {
                    return res.status(400).json({ message: `Datos inválidos para producto ${idProducto}` });
                }

                const productoVendido = venta.productosVendidos.find(p => p.idProducto === idProducto);
                if (!productoVendido) {
                    return res.status(400).json({ message: `Producto ${idProducto} no fue vendido en esta venta` });
                }

                const cantidadYaDevuelta = productosYaDevueltos[idProducto] || 0;
                const cantidadDisponibleParaDevolver = productoVendido.cantidad - cantidadYaDevuelta;

                if (cantidadDisponibleParaDevolver <= 0) {
                    return res.status(400).json({ 
                        message: `Ya se ha devuelto la totalidad del producto ${productoVendido.nombre}. No hay más unidades para devolver` 
                    });
                }

                if (cantidadDisponibleParaDevolver < cantidad) {
                    return res.status(400).json({ 
                        message: `La cantidad a devolver para ${productoVendido.nombre} excede lo disponible. Disponible: ${cantidadDisponibleParaDevolver}, Solicitado: ${cantidad}` 
                    });
                }

                productosParaDevolucion.push({
                    idProducto,
                    nombre: productoVendido.nombre,
                    cantidad,
                    precioUnitario: productoVendido.precioUnitario
                });

                totalReembolsado += productoVendido.precioUnitario * cantidad;
                totalProductosDevueltos += cantidad;
            }

            // Crear la devolución
            const nuevaDevolucion = new Devolucion({
                ventaId,
                vendedor: venta.vendedor,
                productosDevueltos: productosParaDevolucion,
                totalProductosDevueltos,
                totalReembolsado
            });

            const devolucionGuardada = await nuevaDevolucion.save();

            // Actualizar stock
            for (const p of productosParaDevolucion) {
                await Producto.findOneAndUpdate(
                    { idProducto: p.idProducto },
                    { $inc: { stock: p.cantidad } }
                );
            }

            res.status(201).json({ message: 'Devolución registrada exitosamente', devolucion: devolucionGuardada });
        } else {
            return res.status(403).json({ message: 'Acceso denegado: Solo personal pueden ver todas las devoluciones' }); 
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerTodasLasDevoluciones = async (req, res) => { 
    try {
        if (req.vendedor.role === req.role && req.role === "admin") { 
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit; 

            const devoluciones = await Devolucion.find({}) 
                .sort({ fechaDevolucion: -1 }) 
                .skip(skip)
                .limit(parseInt(limit)); 

            const totalDevoluciones = await Devolucion.countDocuments({}); 

            res.json({ 
                devoluciones,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalDevoluciones,
                    pages: Math.ceil(totalDevoluciones / limit)
                }
            });
        } else {
            return res.status(403).json({ message: 'Acceso denegado: Solo admins pueden ver todas las devoluciones' }); 
        }
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
};