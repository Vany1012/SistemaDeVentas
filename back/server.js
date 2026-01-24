const express = require ('express');
const dotenv = require ('dotenv');
const cors = require ('cors');
const connectDB = require ('./config/db');
const vendedorRoutes = require ('./routes/vendedorRoute');
const inventarioRoutes = require ('./routes/inventarioRoute');
const ventaRoutes = require('./routes/ventaRoute');
const devolucionesRoutes = require('./routes/devolucionesRoute');
const categoriaProductoRoutes = require('./routes/categoriaProducto');

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/vendedor', vendedorRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/devoluciones', devolucionesRoutes);
app.use('/api/categoriaProducto', categoriaProductoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Servidor lenvantado en el puerto: ${PORT}`)});