const inventario = require('../models/inventariosModels');

exports.inventario = async (req, res) => {
	try {
		const productos = await inventario.find();
		res.json(productos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
