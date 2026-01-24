const e = require('express');
const Producto = require('../models/inventariosModels');

exports.crearProducto = async(req, res, next) =>{
    try{
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if(req.vendedor.role === req.role && req.role === "admin"){
            const {nombre, precio, stock, categoria} = req.body;
            
            if (!nombre || !precio || stock === undefined || !categoria) {
                return res.status(400).json({message: 'Nombre, precio, stock y categoría son requeridos'});
            }
            
            const nameExist = await Producto.findOne({nombre});
            if (nameExist){
                return res.status(400).json({message: 'El nombre del producto ya existe en el sistema'})
            }
            
            const producto = await Producto.create({nombre, precio, stock, categoria});
            res.status(201).json(producto);
        }else{
            res.status(403).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        res.status(500).json({message: 'Error al crear producto', error: err.message});
    }
};

exports.eliminarProducto = async (req, res, next) => {
    try{
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if(req.vendedor.role === req.role && req.role === "admin"){
            const {idProducto} = req.query;
            if (!idProducto || idProducto ===''){
                return res.status(400).json({message: `Necesitas ingresar un ID de producto`});
            }
            
            const producto = await Producto.findOneAndUpdate({idProducto:idProducto, activo:true},{activo:false},{new: true, runValidators: true})
            if (!producto){
                return res.status(404).json({message:`Producto no encontrado por favor revisa si el ID de tu producto es correcto`})
            }

            res.status(200).json({ message: 'Producto eliminado correctamente', producto: {nombre: producto.nombre, idProducto: producto.idProducto, cantidad: producto.stock, precio: producto.precio}});
        }else{
            res.status(403).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        res.status(500).json({message: 'Error al eliminar producto', error: err.message});
    }
};

exports.activarProducto = async (req, res, next) => {
    try{
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if(req.vendedor.role === req.role && req.role === "admin"){
            const {idProducto} = req.query;
            if (!idProducto || idProducto ===''){
                return res.status(400).json({message: `Necesitas ingresar un ID de producto`});
            }
            const productoExistente = await Producto.findOne({idProducto: idProducto});
            if (!productoExistente){
                return res.status(404).json({message:`Producto no encontrado por favor revisa si el ID de tu producto es correcto`});
            }
            if (productoExistente.activo === true){
                return res.status(200).json({message: 'El producto ya está activo'});
            }
            const producto = await Producto.findOneAndUpdate({idProducto:idProducto, activo:false},{activo:true},{new: true, runValidators: true})
            res.status(200).json({ message: 'Producto activado correctamente', producto: {nombre: producto.nombre, idProducto: producto.idProducto, cantidad: producto.stock, precio: producto.precio}});
        }else{
            res.status(403).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        res.status(500).json({message: 'Error al activar producto', error: err.message});
    }
};

exports.editarProductoPorId = async (req, res, next) => {
    try{
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if(req.vendedor.role === req.role && req.role === "admin"){
            const {idProducto} = req.query; //Obtenemos el id del producto
            if (!idProducto || idProducto ===''){
                return res.status(400).json({message: `Necesitas ingresar un ID de producto`});
            }
            
            const producto = await Producto.findOneAndUpdate({idProducto:idProducto, activo:true},req.body,{new: true, runValidators: true})
            if (!producto){
                return res.status(404).json({message:`Producto no encontrado por favor revisa si el ID de tu producto es correcto`});
            }

            res.status(200).json({ message: 'Producto editado correctamente', producto: {nombre: producto.nombre, idProducto: producto.idProducto, cantidad: producto.stock, precio: producto.precio}});
        }else{
            res.status(403).json({message: 'El vendedor no es admin'});
        }
    }catch(err){
        res.status(500).json({message: 'Error al editar producto', error: err.message});
    }
};

exports.verInventario = async (req, res) => {
    try {
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        if (req.vendedor.role === req.role) {
            const productos = await Producto.find();
            return res.status(200).json(productos);
        }
        return res.status(403).json({ message: 'No tienes permisos para ver el inventario' });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener inventario', error: error.message });
    }
};