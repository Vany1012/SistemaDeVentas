console.log('reportes.js cargado');

const API_URL = 'http://localhost:3000/api';

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        console.log('❌ No autenticado');
        return { authenticated: false, user: null };
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('✅ Usuario:', user.vendedorName, 'Rol:', user.role);
        return { authenticated: true, user: user };
    } catch (error) {
        console.error('❌ Error parseando userData:', error);
        return { authenticated: false, user: null };
    }
}

// Obtener estadísticas del inventario
async function obtenerEstadisticasInventario() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/inventario/verInventario`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const productos = await response.json();
            
            // Calcular estadísticas
            const totalProductos = productos.length;
            const productosActivos = productos.filter(p => p.activo).length;
            const productosInactivos = totalProductos - productosActivos;
            
            // Calcular stock total y valor del inventario
            let stockTotal = 0;
            let valorInventario = 0;
            let bajoStock = 0; // Productos con stock menor a 10
            
            productos.forEach(producto => {
                if (producto.activo) {
                    stockTotal += producto.stock;
                    valorInventario += producto.stock * producto.precio;
                    
                    if (producto.stock < 10) {
                        bajoStock++;
                    }
                }
            });
            
            // Agrupar por categoría
            const categorias = {};
            productos.forEach(producto => {
                if (producto.activo) {
                    if (!categorias[producto.categoria]) {
                        categorias[producto.categoria] = {
                            count: 0,
                            stock: 0,
                            valor: 0
                        };
                    }
                    categorias[producto.categoria].count++;
                    categorias[producto.categoria].stock += producto.stock;
                    categorias[producto.categoria].valor += producto.stock * producto.precio;
                }
            });
            
            return {
                success: true,
                estadisticas: {
                    totalProductos,
                    productosActivos,
                    productosInactivos,
                    stockTotal,
                    valorInventario: valorInventario.toFixed(2),
                    bajoStock,
                    categorias
                }
            };
        } else {
            return {
                success: false,
                error: 'Error al obtener el inventario'
            };
        }
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return {
            success: false,
            error: 'Error de conexión'
        };
    }
}

// Obtener reporte de ventas (solo admin)
async function obtenerReporteVentas() {
    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Solo admin puede ver todas las ventas
        let endpoint = `${API_URL}/ventas/ventas`;
        
        if (userData.role === 'admin') {
            endpoint = `${API_URL}/ventas/reporteVentas`;
        }
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                ventas: data.ventas || [],
                pagination: data.pagination
            };
        } else {
            return {
                success: false,
                error: 'Error al obtener ventas'
            };
        }
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        return {
            success: false,
            error: 'Error de conexión'
        };
    }
}

// Calcular ventas del mes actual
function calcularVentasDelMes(ventas) {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1; // getMonth() es 0-indexed
    const añoActual = ahora.getFullYear();
    
    const ventasMes = ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta.getMonth() + 1 === mesActual && 
               fechaVenta.getFullYear() === añoActual;
    });
    
    let totalVentas = 0;
    let totalProductosVendidos = 0;
    
    ventasMes.forEach(venta => {
        totalVentas += venta.total;
        totalProductosVendidos += venta.totalProductos;
    });
    
    // Comparar con el mes anterior
    const ventasMesAnterior = calcularVentasMesAnterior(ventas);
    const tendencia = totalVentas > ventasMesAnterior.totalVentas ? 'up' : 
                     totalVentas < ventasMesAnterior.totalVentas ? 'down' : 'stable';
    
    return {
        totalVentas: totalVentas.toFixed(2),
        totalProductosVendidos,
        cantidadVentas: ventasMes.length,
        tendencia,
        ventasMesAnterior: ventasMesAnterior.totalVentas
    };
}

// Calcular ventas del mes anterior
function calcularVentasMesAnterior(ventas) {
    const ahora = new Date();
    let mesAnterior = ahora.getMonth(); // Mes anterior (0-indexed)
    let añoAnterior = ahora.getFullYear();
    
    if (mesAnterior === 0) { // Si es enero, mes anterior es diciembre del año anterior
        mesAnterior = 12;
        añoAnterior--;
    }
    
    const ventasMesAnterior = ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta.getMonth() + 1 === mesAnterior && 
               fechaVenta.getFullYear() === añoAnterior;
    });
    
    let totalVentas = 0;
    
    ventasMesAnterior.forEach(venta => {
        totalVentas += venta.total;
    });
    
    return {
        totalVentas: totalVentas.toFixed(2),
        cantidadVentas: ventasMesAnterior.length
    };
}

// Actualizar tarjetas de reportes en el DOM
function actualizarTarjetasReportes(estadisticasInventario, ventasMes) {
    // Tarjeta 1: Ventas del Mes
    const card1 = document.querySelector('.report-card:nth-child(1) .card-number');
    if (card1 && ventasMes) {
        card1.textContent = `$${ventasMes.totalVentas}`;
        
        // Actualizar tendencia
        const trend1 = document.querySelector('.report-card:nth-child(1) .card-trend');
        if (trend1) {
            trend1.className = `card-trend ${ventasMes.tendencia}`;
            trend1.title = `Mes anterior: $${ventasMes.ventasMesAnterior}`;
        }
    }
    
    // Tarjeta 2: Unidades Vendidas
    const card2 = document.querySelector('.report-card:nth-child(2) .card-number');
    if (card2 && ventasMes) {
        card2.textContent = ventasMes.totalProductosVendidos;
        
        // Actualizar tendencia (basada en comparación de productos vendidos)
        const trend2 = document.querySelector('.report-card:nth-child(2) .card-trend');
        if (trend2) {
            // Simular tendencia (en un sistema real, compararías con el mes anterior)
            trend2.className = 'card-trend up'; // Cambiar según datos reales
        }
    }
    
    // Tarjeta 3: Stock
    const card3 = document.querySelector('.report-card:nth-child(3) .card-number');
    if (card3 && estadisticasInventario) {
        card3.textContent = estadisticasInventario.stockTotal;
        
        // Actualizar tendencia basada en productos con bajo stock
        const trend3 = document.querySelector('.report-card:nth-child(3) .card-trend');
        if (trend3) {
            if (estadisticasInventario.bajoStock > 5) {
                trend3.className = 'card-trend alert';
                trend3.title = `${estadisticasInventario.bajoStock} productos con stock bajo (< 10 unidades)`;
            } else if (estadisticasInventario.bajoStock > 0) {
                trend3.className = 'card-trend down';
                trend3.title = `${estadisticasInventario.bajoStock} productos con stock bajo`;
            } else {
                trend3.className = 'card-trend up';
                trend3.title = 'Stock saludable';
            }
        }
    }
}

// Crear tabla detallada de inventario
function crearTablaInventario(estadisticas) {
    const container = document.querySelector('.container');
    
    // Limpiar si ya existe para evitar duplicados al actualizar
    const anterior = document.querySelector('.inventario-detallado');
    if (anterior) anterior.remove();

    const seccion = document.createElement('div');
    seccion.className = 'inventario-detallado';
    
    seccion.innerHTML = `
        <h3>📊 Resumen del Inventario</h3>
        
        <div class="stats-grid">
            <div class="stat-item bg-blue">
                <h4>Productos Totales</h4>
                <p>${estadisticas.totalProductos}</p>
            </div>
            <div class="stat-item bg-green">
                <h4>Productos Activos</h4>
                <p>${estadisticas.productosActivos}</p>
            </div>
            <div class="stat-item bg-orange">
                <h4>Stock Total</h4>
                <p>${estadisticas.stockTotal}</p>
            </div>
            <div class="stat-item bg-pink">
                <h4>Valor Inventario</h4>
                <p>$${estadisticas.valorInventario}</p>
            </div>
        </div>
        
        <h4>📈 Productos por Categoría</h4>
        <table class="tabla-reporte">
            <thead>
                <tr>
                    <th>Categoría</th>
                    <th>Productos</th>
                    <th>Stock Total</th>
                    <th>Valor Total</th>
                </tr>
            </thead>
            <tbody id="categorias-body"></tbody>
        </table>
    `;
    
    container.appendChild(seccion);

    // Llenar las filas (esto sigue siendo dinámico)
    const tbody = document.getElementById('categorias-body');
    Object.entries(estadisticas.categorias).forEach(([cat, datos]) => {
        const row = `<tr>
            <td>${cat}</td>
            <td>${datos.count}</td>
            <td>${datos.stock}</td>
            <td>$${datos.valor.toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Alerta de Stock Bajo
    if (estadisticas.bajoStock > 0) {
        const alerta = document.createElement('div');
        alerta.className = 'alerta-stock';
        alerta.innerHTML = `
            <strong>⚠️ Alerta: ${estadisticas.bajoStock} productos con stock bajo</strong>
            <p>Se recomienda reponer stock lo antes posible.</p>
        `;
        seccion.appendChild(alerta);
    }
}
// Mostrar loading
function mostrarLoading() {
    // Eliminar loading anterior si existe
    const loadingAnterior = document.querySelector('.loading-container');
    if (loadingAnterior) {
        loadingAnterior.remove();
    }
    
    const loading = document.createElement('div');
    loading.className = 'loading-container';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    loading.innerHTML = `
        <div style="text-align: center;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <p style="color: #333; font-weight: bold;">Cargando reportes...</p>
        </div>
    `;
    
    // Agregar animación si no existe
    if (!document.querySelector('#spin-animation')) {
        const style = document.createElement('style');
        style.id = 'spin-animation';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loading);
}

// Ocultar loading
function ocultarLoading() {
    const loading = document.querySelector('.loading-container');
    if (loading) {
        loading.remove();
    }
}

// Cargar y mostrar todos los reportes
async function cargarReportes() {
    mostrarLoading();
    
    try {
        // Obtener estadísticas del inventario
        const resultadoInventario = await obtenerEstadisticasInventario();
        
        // Obtener reporte de ventas
        const resultadoVentas = await obtenerReporteVentas();
        
        if (resultadoInventario.success && resultadoVentas.success) {
            // Calcular ventas del mes
            const ventasMes = calcularVentasDelMes(resultadoVentas.ventas);
            
            // Actualizar tarjetas
            actualizarTarjetasReportes(resultadoInventario.estadisticas, ventasMes);
            
            // Crear tabla detallada de inventario
            crearTablaInventario(resultadoInventario.estadisticas);
            
            // Mostrar mensaje de éxito
            console.log('Reportes cargados exitosamente');
        } else {
            console.error('Error al cargar reportes:', resultadoInventario.error, resultadoVentas.error);
            
            // Mostrar mensaje de error
            const errorContainer = document.createElement('div');
            errorContainer.innerHTML = `
                <h4>⚠️ Error al cargar reportes</h4>
                <p>${resultadoInventario.error || resultadoVentas.error}</p>
                <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
            `;
            
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(errorContainer);
            }
        }
    } catch (error) {
        console.error('Error inesperado:', error);
    } finally {
        ocultarLoading();
    }
}

// Inicializar la página
function inicializarPagina() {
    // Verificar autenticación
    const usuario = checkAuth();
    if (!usuario) return;
    
    console.log('Usuario autenticado:', usuario.vendedorName, '- Rol:', usuario.role);
    
    // Mostrar nombre de usuario
    const titulo = document.querySelector('h2');
    if (titulo) {
        titulo.insertAdjacentHTML('afterend', `
            <p>Usuario: ${usuario.vendedorName} (${usuario.role})</p>
        `);
    }
    
    // Configurar botones
    
    
    // Cargar reportes
    cargarReportes();
}

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPagina);