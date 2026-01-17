const Vendedor = require('../models/vendedorModels');
const jwt = require ('jsonwebtoken');

const generateToken = (role, vendedorId) => {
    return jwt.sign({role, vendedorId}, process.env.JWT_SECRET, {expiresIn: '1h'});
};

exports.registerVendedor = async (req, res) => {
    try {
        const countVendedores = await Vendedor.countDocuments();
        const isFirstAdmin = countVendedores === 0;

        if (!isFirstAdmin && req.vendedor?.role !== 'admin') {
            return res.status(401).json({ message: 'No tienes permisos de administrador' });
        }

        const { vendedorName, email, password, role, vendedorId, active } = req.body;

        const exist = await Vendedor.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: 'Vendedor ya existente' });
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
            token: generateToken(nuevoVendedor.role, nuevoVendedor.vendedorId)
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
            token: generateToken(vendedor.role, vendedor.vendedorId),
            role: vendedor.role
        });
    }else {
        res.status(401).json({message: 'credenciales incorrectas'})
    }
};

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg2MTgxNTksImV4cCI6MTc2ODY0Njk1OX0.e1Eva1jf5RjiICvFbuAk-7ll-WNMHjTyBFZBxFKMbZk
//
// 
            //
       // }