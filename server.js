// Importamos las dependencias
const express = require ('express');
const dotenv = require ('dotenv');
const cors = require ('cors');
const connectDB = require ('./config/db');
const vendedorRoutes = require ('./routes/vendedorRoute');
const inventarioRoutes = require ('./routes/inventarioRoute');
const ventaRoutes = require('./routes/ventaRoute');

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/vendedor', vendedorRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Servidor lenvantado en el puerto: ${PORT}`)});