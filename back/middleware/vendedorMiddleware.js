const jwt = require('jsonwebtoken');
const Vendedor= require('../models/vendedorModels');


//metodo de autenticación
exports.protect = async (req, res, next) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.vendedor = await Vendedor.findById(decoded.id).select('-password');
            req.role = decoded.role

            next();
        }catch(e){
            return res.status(401).json({message: 'Token Invalido o expirado: ' + e.message});
        }
    }else{
        return res.status(401).json({message: 'No se ingreso el token'});
    }
};