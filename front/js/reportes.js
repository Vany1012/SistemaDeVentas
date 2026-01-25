const API_URL = 'http://localhost:3000/api';


// Obtener estadísticas del inventario
async function obtenerEstadisticasInventario() {
    // Verificar autenticación
    const usuario = checkAdminAuth();
    if (!usuario) return;

    try {
        const response = await authFetch(`/inventario/verInventario`, {
            method: 'GET'
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
            let productosBajoStock = []; // Productos con stock menor a 21
            
            productos.forEach(producto => {
                if (producto.activo) {
                    stockTotal += producto.stock;
                    valorInventario += producto.stock * producto.precio;
                    
                    if (producto.stock < 21) { // Productos con stock menor a 21
                        productosBajoStock.push({
                            nombre: producto.nombre,
                            stock: producto.stock,
                            categoria: producto.categoria,
                            precio: producto.precio
                        });
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
                productos: productos,
                estadisticas: {
                    totalProductos,
                    productosActivos,
                    productosInactivos,
                    stockTotal,
                    valorInventario: valorInventario.toFixed(2),
                    productosBajoStock,
                    cantidadBajoStock: productosBajoStock.length,
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

// Obtener ventas del día
async function obtenerVentasDelDia() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/ventas/ventasDelDia`, {
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
                ventas: data.ventas || []
            };
        } else {
            return {
                success: false,
                error: 'Error al obtener ventas del día'
            };
        }
    } catch (error) {
        console.error('Error al obtener ventas del día:', error);
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
    const mesActual = ahora.getMonth() + 1;
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
        ventasMesAnterior: ventasMesAnterior.totalVentas,
        ventasDetalle: ventasMes
    };
}

// Calcular ventas del día actual
function calcularVentasDelDia(ventas) {
    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const ventasHoy = ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        const fechaVentaString = fechaVenta.toISOString().split('T')[0];
        return fechaVentaString === hoyString;
    });
    
    let totalVentasDia = 0;
    let totalProductosVendidosDia = 0;
    
    ventasHoy.forEach(venta => {
        totalVentasDia += venta.total;
        totalProductosVendidosDia += venta.totalProductos;
    });
    
    return {
        totalVentasDia: totalVentasDia.toFixed(2),
        totalProductosVendidosDia,
        cantidadVentasDia: ventasHoy.length,
        ventasDetalleDia: ventasHoy
    };
}

// Calcular ventas del mes anterior
function calcularVentasMesAnterior(ventas) {
    const ahora = new Date();
    let mesAnterior = ahora.getMonth();
    let añoAnterior = ahora.getFullYear();
    
    if (mesAnterior === 0) {
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
function actualizarTarjetasReportes(estadisticasInventario, ventasMes, ventasDia) {
    // Tarjeta 1: Ventas del Mes
    const card1 = document.querySelector('.report-card:nth-child(1) .card-number');
    if (card1 && ventasMes) {
        card1.textContent = `$${ventasMes.totalVentas}`;
        
        const trend1 = document.querySelector('.report-card:nth-child(1) .card-trend');
        if (trend1) {
            trend1.className = `card-trend ${ventasMes.tendencia}`;
            trend1.title = `Mes anterior: $${ventasMes.ventasMesAnterior}`;
        }
    }
    
    // Tarjeta 2: Ventas del Día
    const card2 = document.querySelector('.report-card:nth-child(2) .card-number');
    if (card2 && ventasDia) {
        card2.textContent = `$${ventasDia.totalVentasDia}`;
        
        const subtitulo2 = document.querySelector('.report-card:nth-child(2) .card-subtitle');
        if (subtitulo2) {
            subtitulo2.textContent = `${ventasDia.cantidadVentasDia} ventas hoy`;
        }
    }
    
    // Tarjeta 3: Stock del Inventario
    const card3 = document.querySelector('.report-card:nth-child(3) .card-number');
    if (card3 && estadisticasInventario) {
        card3.textContent = estadisticasInventario.stockTotal;
    }
    
    // Tarjeta 4: Valor del Inventario
    const card4 = document.querySelector('.report-card:nth-child(4) .card-number');
    if (card4 && estadisticasInventario) {
        card4.textContent = `$${estadisticasInventario.valorInventario}`;
    }
    
    // Actualizar alerta de productos con stock bajo
    actualizarAlertaStockBajo(estadisticasInventario);
}

// Función para actualizar alerta de stock bajo
function actualizarAlertaStockBajo(estadisticasInventario) {
    if (!estadisticasInventario || !estadisticasInventario.productosBajoStock || estadisticasInventario.productosBajoStock.length === 0) {
        return;
    }
    
    const container = document.querySelector('.container');
    const alertaExistente = document.querySelector('.alerta-stock');
    if (alertaExistente) alertaExistente.remove();
    
    const alerta = document.createElement('div');
    alerta.className = 'alerta-stock';
    
    let productosLista = '';
    estadisticasInventario.productosBajoStock.forEach(producto => {
        productosLista += `
            <div class="producto-bajo-stock">
                <strong>${producto.nombre}</strong> (${producto.categoria})
                <br>
                <small>Stock actual: ${producto.stock} unidades - Precio: $${producto.precio}</small>
            </div>
        `;
    });
    
    alerta.innerHTML = `
        <div class="alerta-header">
            <span class="alerta-icon">⚠️</span>
            <strong>Alerta: ${estadisticasInventario.productosBajoStock.length} productos con stock bajo (20 ó menos unidades)</strong>
        </div>
        <div class="alerta-contenido">
            <p>Se recomienda reponer stock lo antes posible:</p>
            <div class="productos-lista">
                ${productosLista}
            </div>
        </div>
    `;
    
    // Buscar donde insertar la alerta (después de las tarjetas)
    const cardsContainer = document.querySelector('.cards-container');
    if (cardsContainer && cardsContainer.parentNode) {
        container.insertBefore(alerta, cardsContainer.nextSibling);
    } else {
        container.appendChild(alerta);
    }
}

// Crear tabla detallada de inventario
function crearTablaInventario(estadisticas) {
    const container = document.querySelector('.container');
    
    const anterior = document.querySelector('.inventario-detallado');
    if (anterior) anterior.remove();

    const seccion = document.createElement('div');
    seccion.className = 'inventario-detallado';
    
    // Formatear la fecha actual
    const ahora = new Date();
    const fechaFormateada = ahora.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    seccion.innerHTML = `
        <div class="seccion-header">
            <h3><i class="fa fa-chart-bar"></i> Reporte Detallado - ${fechaFormateada}</h3>
        </div>
        
        <div class="stats-grid">
            <div class="stat-item bg-blue">
                <h4><i class="fa fa-shopping-cart"></i> Productos Totales</h4>
                <p>${estadisticas.totalProductos}</p>
            </div>
            <div class="stat-item bg-green">
                <h4><i class="fa fa-check-circle"></i> Productos Activos</h4>
                <p>${estadisticas.productosActivos}</p>
            </div>
            <div class="stat-item bg-orange">
                <h4><i class="fa fa-boxes"></i> Stock Total</h4>
                <p>${estadisticas.stockTotal}</p>
            </div>
            <div class="stat-item bg-pink">
                <h4><i class="fa fa-dollar-sign"></i> Valor Inventario</h4>
                <p>$${estadisticas.valorInventario}</p>
            </div>
        </div>
        
        <div class="tabla-container">
            <h4><i class="fa fa-tags"></i> Productos por Categoría</h4>
            <table class="tabla-reporte">
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th>Productos</th>
                        <th>Stock Total</th>
                        <th>Valor Total</th>
                        <th>Valor Promedio</th>
                    </tr>
                </thead>
                <tbody id="categorias-body"></tbody>
            </table>
        </div>
    `;
    
    container.appendChild(seccion);

    // Llenar las filas de categorías
    const tbody = document.getElementById('categorias-body');
    tbody.innerHTML = ''; // Limpiar contenido
    Object.entries(estadisticas.categorias).forEach(([cat, datos]) => {
        const valorPromedio = datos.count > 0 ? (datos.valor / datos.count).toFixed(2) : '0.00';
        const row = `<tr>
            <td><strong>${cat}</strong></td>
            <td>${datos.count}</td>
            <td>${datos.stock}</td>
            <td>$${datos.valor.toFixed(2)}</td>
            <td>$${valorPromedio}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Mostrar loading
function mostrarLoading() {
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
        background-color: rgba(255, 255, 255, 0.9);
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
        
        // Obtener ventas del día
        const resultadoVentasDia = await obtenerVentasDelDia();
        
        if (resultadoInventario.success && resultadoVentas.success) {
            // Calcular ventas del mes
            const ventasMes = calcularVentasDelMes(resultadoVentas.ventas);
            
            // Calcular ventas del día
            const ventasDia = calcularVentasDelDia(resultadoVentasDia.ventas);
            
            // Actualizar tarjetas
            actualizarTarjetasReportes(resultadoInventario.estadisticas, ventasMes, ventasDia);
            
            // Crear tabla detallada de inventario
            crearTablaInventario(resultadoInventario.estadisticas);
            
        } else {
            console.error('Error al cargar reportes:', resultadoInventario.error, resultadoVentas.error);
            
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h4><i class="fa fa-exclamation-triangle"></i> Error al cargar reportes</h4>
                    <p>${resultadoInventario.error || resultadoVentas.error || 'Error desconocido'}</p>
                    <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
                    <button onclick="cargarReportes()" class="btn-reintentar">
                        <i class="fa fa-refresh"></i> Reintentar
                    </button>
                </div>
            `;
            
            const container = document.querySelector('.container');
            if (container) {
                const anterior = document.querySelector('.error-container');
                if (anterior) anterior.remove();
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
    const usuario = checkAuth();
    if (!usuario) return;    
    
    // Cargar reportes
    cargarReportes();
    
    // Botón de actualizar manualmente
    const header = document.getElementById('head');
    if (header) {
        const btnActualizar = document.createElement('button');
        btnActualizar.id = 'btn-actualizar-reportes';
        btnActualizar.innerHTML = '<i class="fa fa-refresh"></i> Actualizar Reportes';
        btnActualizar.onclick = cargarReportes;
        header.appendChild(btnActualizar);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPagina);