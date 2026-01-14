const vendedor = require('../models/vendedorModels');
const jwt = require('../models/vendedorModels');

const generateToken = (role, vendedorId) => {
    return jwt.sign({role}, process.env.JWT_SECRET, {expiresIn: '8h'});
};

exports.registerVendedor = async(req, res) =>{
    try{
        if (vendedor.role === 'admin'){
            const{vendedorName, email, password, role, vendedorId} = req.body;
            const exist = await vendedor.findOne({email});
            if (exist){
                return res.status(400).json({message: 'vendedor ya existente'})
            }
            const vendedor = await vendedor.create({vendedorName, email, password, role});
            res.status(201);

        }else{
            res.status(401).json({message: 'el vendedor no tiene acceso '})
        }

    }catch(e){
        res.status(500).json({message: 'Error'})
    }
};

exports.loginVendedor = async (req, res) => {
    const{email,password} = req.body;
    const vendedor = await vendedor.findOne({email});
    console.log(req.vendedor)
    if (vendedor && (await vendedor.matchPassword(password))){
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


