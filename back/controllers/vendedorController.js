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

        const { vendedorName, email, password, role, vendedorId, active } = req.body;

        const emailExist = await Vendedor.findOne({ email });
        if (emailExist) {
            return res.status(400).json({ message: 'El email ya existe en el sistema' });
        }
        const idExist = await Vendedor.findOne({ vendedorId });
        if (idExist) {
            return res.status(400).json({ message: 'El ID de vendedor ya existe en el sistema' });
        }
        const nuevoVendedor = await Vendedor.create({
            vendedorName,
            email,
            password,
            role: isFirstAdmin ? 'admin' : role, 
            vendedorId,
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
    const{email,password} = req.body;
    const vendedor = await Vendedor.findOne({email});
    console.log(req.vendedor)
    if (vendedor && (await vendedor.matchPassword(password)) ){
        res.json({
            vendedorId: vendedor.vendedorId,
            vendedorName : vendedor.vendedorName,
            email: vendedor.email,
            token: generateToken(vendedor.role, vendedor._id),
            role: vendedor.role
        });
    }else {
        res.status(401).json({message: 'credenciales incorrectas'})
    }
};
