const e = require('express');
const Categoria = require('../models/categoriaProductoModel');

exports.createCategoria = async(req, res, next) =>{
    try{
        const { categoria } = req.body;
        
        if(!req.vendedor){
                    return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
                }
                    
                    if (!categoria) {
                        return res.status(400).json({message:"La categoria es requerida"});
                    }

                    const categoriaExist = await Categoria.findOne({categoriaProducto: categoria});
                    if (categoriaExist){
                        return res.status(400).json({message: 'El nombre de la categoria ya existe en el sistema'})
                    }

                    const nuevaCategoria = await Categoria.create({categoriaProducto: categoria});
                    res.status(201).json(nuevaCategoria);
                }
     catch(err){
        res.status(500).json({message: 'Error al crear categoria', error: err.message});
    }
};


exports.eliminarCategoria = async (req, res, next) => {
    try{
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        const {categoriaId} = req.query; //Obtenemos el id de la categoria
        if (!categoriaId || categoriaId ===''){
            return res.status(400).json({message: `Necesitas ingresar un ID de categoria`});
        }
        const categoria = await Categoria.findOneAndDelete({categoriaId:categoriaId})
        if (!categoria){
            return res.status(404).json({message:`Categoria no encontrada por favor revisa si el ID de tu categoria es correcto`})
        }
        res.status(200).json({ message: 'Categoria eliminada correctamente', categoria: {nombre: categoria.categoriaProducto, categoriaId: categoria.categoriaId}});

    }catch(err){
        res.status(500).json({message: 'Error al eliminar categoria', error: err.message});
    }
};

exports.verCategorias = async (req, res, next) => {
    try{
        if(!req.vendedor){
            return res.status(401).json({message: 'No autorizado - Vendedor no encontrado'});
        }
        const categorias =  await Categoria.find();
        res.status(200).json(categorias);

    }catch(err){
        res.status(500).json({message: 'Error al obtener categorias', error: err.message});
    }
};