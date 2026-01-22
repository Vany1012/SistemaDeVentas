const Vendedor = require('../models/vendedorModels');
const jwt = require ('jsonwebtoken');
const { validarEmail, esContraseñaSegura } = require('../middleware/validacionVendedor');

const generateToken = (role, id) => {
    return jwt.sign({role, id}, process.env.JWT_SECRET, {expiresIn: '24h'});
    //return jwt.sign({role, id}, process.env.JWT_SECRET); Esto es un riesgo manejenlo bien en el front y ya lo activan
};

exports.registerVendedor = async (req, res) => {
    try {
        const countVendedores = await Vendedor.countDocuments();
        const isFirstAdmin = countVendedores === 0;

        if (!isFirstAdmin && req.vendedor?.role !== 'admin') {
            return res.status(401).json({ message: 'No tienes permisos de administrador' });
        }

        const { vendedorName, email, password, role, active } = req.body;

        // Validar campos requeridos
        if (!vendedorName || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
        }

        // Convertir email a minúsculas para búsqueda
        const emailNormalizado = email.toLowerCase();

        // Verificar si el email ya existe
        const emailExist = await Vendedor.findOne({ email: emailNormalizado });
        if (emailExist) {
            return res.status(400).json({ message: 'El email ya existe en el sistema' });
        }

        // Crear el vendedor (vendedorId se genera automáticamente en el pre-save)
        const nuevoVendedor = await Vendedor.create({
            vendedorName,
            email: emailNormalizado,
            password,
            role: isFirstAdmin ? 'admin' : role,
            active
        });

        res.status(201).json({
            vendedorName: nuevoVendedor.vendedorName,
            vendedorId: nuevoVendedor.vendedorId,
            role: nuevoVendedor.role,
            email: nuevoVendedor.email,
            token: generateToken(nuevoVendedor.role, nuevoVendedor._id)
        });

    } catch (e) {
        res.status(500).json({ message: `Error: ` + e.message });
    }
};

exports.loginVendedor = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que se envien los campos requeridos
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos' });
        }

        // Buscar vendedor por email (convertir a minúsculas para consistencia)
        const vendedor = await Vendedor.findOne({ email: email.toLowerCase() });

        if (!vendedor) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Comparar contraseñas
        const esValida = await vendedor.matchPassword(password);

        if (!esValida) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Login exitoso
        res.json({
            vendedorId: vendedor.vendedorId,
            vendedorName: vendedor.vendedorName,
            email: vendedor.email,
            token: generateToken(vendedor.role, vendedor._id),
            role: vendedor.role
        });
    } catch (error) {
        res.status(500).json({ message: `Error en login: ${error.message}` });
    }
};
