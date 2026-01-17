const Venta = require('../models/ventaModels');
const Producto = require('../models/inventariosModels');

exports.registrarVentas = async (req, res) => {
    try {
        if(req.vendedor.role === req.role){
                const { vendedor, productosVendidos } = req.body;

            if (!vendedor || !productosVendidos || productosVendidos.length === 0) {
                return res.status(400).json({ message: 'Faltan datos: vendedor y productosVendidos son requeridos' });
            }
            let total = 0;
            let totalProductos = 0;
            const productosParaVenta = [];

            // Verificar stock y preparar productos
            for (const p of productosVendidos) {
                const { idProducto, cantidad } = p;

                if (!idProducto || !cantidad || cantidad <= 0) {
                    return res.status(400).json({ message: `Datos inválidos para producto ${idProducto} `});
                }
            //Busca el producto mediante el idProducto y checa si está activo
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
            // Crear la venta
            const nuevaVenta = new Venta({
                vendedor,
                productosVendidos: productosParaVenta,
                totalProductos,
                total
            });

            const ventaGuardada = await nuevaVenta.save();

            // Actualizar stock
            for (const item of productosParaVenta) {
                await Producto.findOneAndUpdate(
                    { idProducto: item.idProducto },
                    { $inc: { stock: -item.cantidad } }//$inc: Es un operador de MongoDB que incrementa o decrementa un valor numérico
                );
            }
            res.status(201).json({ message: 'Venta registrada exitosamente', venta: ventaGuardada });
        }else{
             return res.status(403).json({ message: 'Acceso denegado: El rol no coincide o falta token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};