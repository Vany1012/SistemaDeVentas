const Producto = require('../models/inventariosModels');

exports.createProducto = async(req, res, next) =>{
    try{
        if(req.user.role === req.role && req.role === "admin"){
            const {idProducto, nombre, precio, stock, categoria, activo} = req.body;
            const exist = await User.findOne({idProducto});
            if (exist){
                return res.status(400).json({massage: 'El producto ya existe en el sistema'})
            }
            const producto = await Producto.create({idProducto, nombre, precio, stock, categoria, activo});
            res.status(201).json(producto);
        }else{
            res.status(401).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        next(err);
    };
};

exports.deleteProducto = async (req, res, next) => {
    try{
        if(req.user.role === req.role && req.role === "admin"){
            const {idProducto} = req.query; //Obtenemos el id del producto
            if (!idProducto || idProducto===''){
            return res.status(400).json({massage: `Necesitas ingresar un ID de producto`})}
            
            const producto = await Producto.findOneAndUpdate({idProducto:idProducto, active:true},{active:false, new_: true, runValidators: true})
            if (!producto){
                return res.status(404).json({message:`Producto no encontrado por favor revisa si el ID de tu producto es correcto`})}

            res.json({ massage: 'Producto eliminado correctamente', producto: producto});
        }else{
            res.status(401).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        next(err);
    }
};

exports.verInventario = async (req, res) => {
	try {
		const productos = await inventario.find();
		res.json(productos);
        console.log(productos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};