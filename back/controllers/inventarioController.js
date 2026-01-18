const e = require('express');
const Producto = require('../models/inventariosModels');

exports.crearProducto = async(req, res, next) =>{
    try{
        if(req.vendedor.role === req.role && req.role === "admin"){
            const {idProducto, nombre, precio, stock, categoria} = req.body;
            const idExist = await Producto.findOne({idProducto});
            if (idExist){
                return res.status(400).json({massage: 'El id del producto ya existe en el sistema'})
            }
			const nameExist = await Producto.findOne({nombre});
			if (nameExist){
				return res.status(400).json({massage: 'El nombre del producto ya existe en el sistema'})
			}
            const producto = await Producto.create({idProducto, nombre, precio, stock, categoria});
            res.status(201).json(producto);
        }else{
            res.status(401).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        next(err);
    };
};

exports.eliminarProducto = async (req, res, next) => {
    try{
        if(req.vendedor.role === req.role && req.role === "admin"){
            const {idProducto} = req.query; //Obtenemos el id del producto
            if (!idProducto || idProducto ===''){
            return res.status(400).json({massage: `Necesitas ingresar un ID de producto` + e.message})}
            
            const producto = await Producto.findOneAndUpdate({idProducto:idProducto, activo:true},{activo:false},{new: true, runValidators: true})
            if (!producto){
                return res.status(404).json({message:`Producto no encontrado por favor revisa si el ID de tu producto es correcto`})}

            res.json({ massage: 'Producto eliminado correctamente', producto: {nombre: producto.nombre, idProducto: producto.idProducto, cantidad: producto.stock, precio: producto.precio}});
        }else{
            res.status(401).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        next(err);
    }
};

exports.editarProductoPorId = async (req, res, next) => {
    try{
		if(req.vendedor.role === req.role && req.role === "admin"){
            const {idProducto} = req.query; //Obtenemos el id del producto
            if (!idProducto || idProducto ===''){
            	return res.status(400).json({massage: `Necesitas ingresar un ID de producto` + e.message})}
            
            const producto = await Producto.findOneAndUpdate({idProducto:idProducto, activo:true},req.body,{new: true, runValidators: true})
        	if (!producto){
            	return res.status(404).json({message:`Producto no encontrado por favor revisa si el ID de tu producto es correcto`})}

        	res.json({ massage: 'Producto editado correctamente', producto: {nombre: producto.nombre, idProducto: producto.idProducto, cantidad: producto.stock, precio: producto.precio}});
        }else{
            res.status(401).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        next(err);
    }
};

exports.verInventario = async (req, res) => {
	try {
		if (req.vendedor.role === req.role) {
			const productos = await Producto.find();
			res.json(productos);
		}
		return res.status(401).json({ message: 'No tienes permisos para ver el inventario' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};