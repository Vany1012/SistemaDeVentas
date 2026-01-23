const MetodoPago = require('../models/metodoPago');

// Crear un nuevo método de pago
exports.crearMetodoPago = async (req, res) => {
    try {
        const { id, tipoTarjeta, proveedor, ultimosCuatroDigitos, marca, fechaExpiracion } = req.body;

        if (!id || !tipoTarjeta || !proveedor || !ultimosCuatroDigitos || !marca || !fechaExpiracion) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        // Verificar si el método de pago ya existe
        const existente = await MetodoPago.findOne({ id });
        if (existente) {
            return res.status(400).json({ message: 'El método de pago ya existe' });
        }

        const nuevoMetodoPago = new MetodoPago({
            id,
            tipoTarjeta,
            proveedor,
            ultimosCuatroDigitos,
            marca,
            fechaExpiracion
        });

        const metodoPagoGuardado = await nuevoMetodoPago.save();
        return res.status(201).json({ message: 'Método de pago creado exitosamente', metodoPago: metodoPagoGuardado });

    } catch (error) {
        return res.status(500).json({ message: 'Error al crear el método de pago', error: error.message });
    }
};

// Obtener todos los métodos de pago
exports.obtenerMetodosPago = async (req, res) => {
    try {
        const metodos = await MetodoPago.find();
        return res.status(200).json(metodos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener métodos de pago', error: error.message });
    }
};

// Obtener un método de pago por ID
exports.obtenerMetodoPagoById = async (req, res) => {
    try {
        const { id } = req.params;
        const metodoPago = await MetodoPago.findById(id);

        if (!metodoPago) {
            return res.status(404).json({ message: 'Método de pago no encontrado' });
        }

        return res.status(200).json(metodoPago);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el método de pago', error: error.message });
    }
};

// Actualizar un método de pago
exports.actualizarMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoTarjeta, proveedor, ultimosCuatroDigitos, marca, fechaExpiracion } = req.body;

        const metodoPago = await MetodoPago.findByIdAndUpdate(
            id,
            { tipoTarjeta, proveedor, ultimosCuatroDigitos, marca, fechaExpiracion },
            { new: true, runValidators: true }
        );

        if (!metodoPago) {
            return res.status(404).json({ message: 'Método de pago no encontrado' });
        }

        return res.status(200).json({ message: 'Método de pago actualizado exitosamente', metodoPago });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el método de pago', error: error.message });
    }
};

// Eliminar un método de pago
exports.eliminarMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;

        const metodoPago = await MetodoPago.findByIdAndDelete(id);

        if (!metodoPago) {
            return res.status(404).json({ message: 'Método de pago no encontrado' });
        }

        return res.status(200).json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el método de pago', error: error.message });
    }
};