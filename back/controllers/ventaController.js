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
                ventaId: ventaGuardada.ventaId, 
                vendedor: ventaGuardada.vendedor, 
                productosVendidos: productosSinId, 
                totalProductos: ventaGuardada.totalProductos, 
                total: ventaGuardada.total,
                metodoPago: ventaGuardada.metodoPago,
                cambio: ventaGuardada.cambio ?  + ventaGuardada.cambio : 'N/A'} });
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
// Obtener reportes de ventas por día con detalles de productos
exports.obtenerReporteVentasPorDia = async (req, res) => {
    try {
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        
        const { mes, anio } = req.query;
        const userData = JSON.parse(JSON.stringify(req.vendedor));
        
        let filter = {};
        
        // Si es admin, ver todas las ventas. Si no, solo sus ventas
        if (userData.role !== 'admin') {
            filter.vendedor = userData.nombreVendedor;
        }
        
        // Filtrar por mes y año si se lo proporcionamos
        if (mes && anio) {
            const startDate = new Date(anio, mes - 1, 1);
            const endDate = new Date(anio, parseInt(mes), 1);
            filter.fecha = { $gte: startDate, $lt: endDate };
        }

        const ventas = await Venta.find(filter).sort({ fecha: -1 });

        // Agrupar ventas por día
        const ventasPorDia = {};
        const productosTotales = {};
        let totalDineroEntrado = 0;

        ventas.forEach(venta => {
            const fecha = new Date(venta.fecha);
            const diaFormato = fecha.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!ventasPorDia[diaFormato]) {
                ventasPorDia[diaFormato] = {
                    fecha: diaFormato,
                    numeroVentas: 0,
                    totalDinero: 0,
                    productos: {}
                };
            }

            ventasPorDia[diaFormato].numeroVentas++;
            ventasPorDia[diaFormato].totalDinero += venta.total;
            totalDineroEntrado += venta.total;

            // Agrupar productos por día
            venta.productosVendidos.forEach(producto => {
                if (!ventasPorDia[diaFormato].productos[producto.nombre]) {
                    ventasPorDia[diaFormato].productos[producto.nombre] = {
                        nombre: producto.nombre,
                        cantidad: 0,
                        precioUnitario: producto.precioUnitario,
                        subtotal: 0
                    };
                }
                ventasPorDia[diaFormato].productos[producto.nombre].cantidad += producto.cantidad;
                ventasPorDia[diaFormato].productos[producto.nombre].subtotal += producto.precioUnitario * producto.cantidad;

                // Agrupar totales de productos
                if (!productosTotales[producto.nombre]) {
                    productosTotales[producto.nombre] = {
                        nombre: producto.nombre,
                        cantidadTotal: 0,
                        dineroGenerado: 0
                    };
                }
                productosTotales[producto.nombre].cantidadTotal += producto.cantidad;
                productosTotales[producto.nombre].dineroGenerado += producto.precioUnitario * producto.cantidad;
            });
        });

        // Convertir a lista y ordenar por fecha descendente
        const reportePorDia = Object.values(ventasPorDia).sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        );

        // Convertir productos por día a listas
        reportePorDia.forEach(dia => {
            dia.productos = Object.values(dia.productos);
        });

    
        const productosArray = Object.values(productosTotales).sort((a, b) => 
            b.cantidadTotal - a.cantidadTotal
        );

        res.status(200).json({
            success: true,
            resumen: {
                totalDineroEntrado: totalDineroEntrado.toFixed(2),
                totalVentas: ventas.length,
                totalProductosVendidos: ventas.reduce((sum, v) => sum + v.totalProductos, 0)
            },
            ventasPorDia: reportePorDia,
            productosTotales: productosArray
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener reporte de ventas por día', error: error.message });
    }
};

// Obtener ventas de un día específico
exports.obtenerVentasDelDia = async (req, res) => {
    try {
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        
        const userData = JSON.parse(JSON.stringify(req.vendedor));
        const { dia, mes, anio } = req.query;
        
        let inicioDia, finDia;
        
        // Si se proporciona día, mes y año, usar esos valores
        if (dia && mes && anio) {
            // Validar que sean números válidos
            const diaNum = parseInt(dia);
            const mesNum = parseInt(mes);
            const anioNum = parseInt(anio);
            
            if (isNaN(diaNum) || isNaN(mesNum) || isNaN(anioNum) || diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12) {
                return res.status(400).json({ message: 'Parámetros inválidos. Usa: ?dia=1&mes=1&anio=2026' });
            }
            
            inicioDia = new Date(anioNum, mesNum - 1, diaNum);
            finDia = new Date(anioNum, mesNum - 1, diaNum + 1);
        } else if (dia) {
            // Si solo se proporciona día, usaremos mes y año actual
            const hoy = new Date();
            const diaNum = parseInt(dia);
            
            if (isNaN(diaNum) || diaNum < 1 || diaNum > 31) {
                return res.status(400).json({ message: 'Día inválido. Debe estar entre 1 y 31' });
            }
            
            inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), diaNum);
            finDia = new Date(hoy.getFullYear(), hoy.getMonth(), diaNum + 1);
        } else {
            // Si no se proporciona nada, usaremos el día actual
            const hoy = new Date();
            inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
        }
        
        let filter = {
            fecha: { $gte: inicioDia, $lt: finDia }
        };
        
        // Si no es admin, filtrar solo sus ventas
        if (userData.role !== 'admin') {
            filter.vendedor = userData.nombreVendedor;
        }

        const ventas = await Venta.find(filter).sort({ fecha: -1 });

        // Calcular totales
        let totalDinero = 0;
        let totalProductos = 0;
        const productosPorNombre = {};

        ventas.forEach(venta => {
            totalDinero += venta.total;
            totalProductos += venta.totalProductos;

            // Agrupar productos
            venta.productosVendidos.forEach(producto => {
                if (!productosPorNombre[producto.nombre]) {
                    productosPorNombre[producto.nombre] = {
                        nombre: producto.nombre,
                        cantidad: 0,
                        precioUnitario: producto.precioUnitario,
                        subtotal: 0
                    };
                }
                productosPorNombre[producto.nombre].cantidad += producto.cantidad;
                productosPorNombre[producto.nombre].subtotal += producto.precioUnitario * producto.cantidad;
            });
        });

        const productosArray = Object.values(productosPorNombre).sort((a, b) => 
            b.cantidad - a.cantidad
        );

        res.status(200).json({
            success: true,
            fecha: inicioDia.toISOString().split('T')[0],
            resumen: {
                totalDineroEntrado: totalDinero.toFixed(2),
                totalVentas: ventas.length,
                totalProductosVendidos: totalProductos
            },
            ventas,
            productosTotales: productosArray
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ventas del día', error: error.message });
    }
};