const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem('token');
const formulario = document.getElementById('venta-formulario');
const ventaInput = document.getElementById('venta-input');
const devolucionForm = document.getElementById('devolucion-form');
let ventasGlobal = [];
let ventaSeleccionadaActual = null;

async function obtenerVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas/ventas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al obtener ventas');
        const data = await response.json();
        return data.ventas;
    } catch (error) {
        console.error(error);
        alert("No se pudo cargar las ventas");
        return [];
    }
}

function buscarVentaPorId(ventaId) {
    return ventasGlobal.find(venta => venta.ventaId === ventaId);
}

function validarContador(input, cantidadMaxima) {
    let valor = parseInt(input.value) || 0;
    
    if (valor < 0) {
        input.value = 0;
    } else if (valor > cantidadMaxima) {
        input.value = cantidadMaxima;
        alert(`No puedes devolver más de ${cantidadMaxima} unidades (cantidad vendida)`);
    }
    actualizarSubtotalDevolucion(input);
}

function actualizarSubtotalDevolucion(input) {
    const fila = input.closest('tr');
    const precioUnitario = parseFloat(fila.querySelector('.precio-unitario').textContent.replace('$', ''));
    const cantidadDevolver = parseInt(input.value) || 0;
    const subtotal = precioUnitario * cantidadDevolver;
    fila.querySelector('.subtotal-devolucion').textContent = `$${subtotal.toFixed(2)}`;
    actualizarTotalDevolucion();
}

function actualizarTotalDevolucion() {
    const subtotales = document.querySelectorAll('.subtotal-devolucion');
    let total = 0;
    
    subtotales.forEach(subtotalElement => {
        const valor = parseFloat(subtotalElement.textContent.replace('$', '')) || 0;
        total += valor;
    });
    
    const totalElement = document.getElementById('total-devolucion');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

function mostrarDetallesVenta(venta) {
    ventaSeleccionadaActual = venta;
    let detallesDiv = document.getElementById('detalles-venta');
    
    if (!detallesDiv) {
        detallesDiv = document.createElement('div');
        detallesDiv.id = 'detalles-venta';
        detallesDiv.className = 'detalles-venta-container';
        formulario.insertAdjacentElement('afterend', detallesDiv);
    }
    
    const fecha = new Date(venta.fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let productosHTML = '';
    venta.productosVendidos.forEach(producto => {
        const subtotal = producto.cantidad * producto.precioUnitario;
        productosHTML += `
            <tr>
                <td>${producto.idProducto}</td>
                <td>${producto.nombre}</td>
                <td class="cantidad-vendida">${producto.cantidad}</td>
                <td class="precio-unitario">$${producto.precioUnitario.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <input type="number" 
                           min="0" 
                           max="${producto.cantidad}"
                           value="0"
                           class="cantidad-devolver-input"
                           data-idproducto="${producto.idProducto}"
                           data-max="${producto.cantidad}"
                           style="width: 60px; padding: 5px;">
                    <small>Máx: ${producto.cantidad}</small>
                </td>
                <td class="subtotal-devolucion">$0.00</td>
            </tr>
        `;
    });
    
    detallesDiv.innerHTML = `
        <div class="venta-detalles">
            <h3>Detalles de la Venta</h3>
            
            <div class="venta-info">
                <div class="info-item">
                    <strong>ID Venta:</strong>
                    <span>${venta.ventaId}</span>
                </div>
                <div class="info-item">
                    <strong>Vendedor:</strong>
                    <span>${venta.vendedor}</span>
                </div>
                <div class="info-item">
                    <strong>Fecha:</strong>
                    <span>${fecha}</span>
                </div>
                <div class="info-item">
                    <strong>Total de Productos:</strong>
                    <span>${venta.totalProductos}</span>
                </div>
                <div class="info-item total">
                    <strong>Total de la Venta:</strong>
                    <span>$${venta.total.toFixed(2)}</span>
                </div>
            </div>
            
            <h4>Productos Vendidos:</h4>
            <table class="productos-table">
                <thead>
                    <tr>
                        <th>ID Producto</th>
                        <th>Nombre</th>
                        <th>Cantidad Vendida</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal Venta</th>
                        <th>Cantidad a Devolver</th>
                        <th>Subtotal Devolución</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>
            
            <div class="resumen-devolucion">
                <h4>Resumen de Devolución</h4>
                <div class="total-devolucion">
                    <strong>Total a Devolver:</strong>
                    <span id="total-devolucion">$0.00</span>
                </div>
            </div>
        </div>
    `;
    devolucionForm.style.display = 'block';
    const inputsDevolucion = detallesDiv.querySelectorAll('.cantidad-devolver-input');
    inputsDevolucion.forEach(input => {
        input.addEventListener('input', function() {
            const max = parseInt(this.getAttribute('data-max'));
            validarContador(this, max);
        });
        input.addEventListener('blur', function() {
            const max = parseInt(this.getAttribute('data-max'));
            validarContador(this, max);
        });
    });
}

function obtenerDatosDevolucion() {
    if (!ventaSeleccionadaActual) return null;
    const inputs = document.querySelectorAll('.cantidad-devolver-input');
    const productosDevueltos = [];
    let totalReembolsado = 0;
    let totalProductosDevueltos = 0;
    let hayDevolucion = false;
    inputs.forEach(input => {
        const cantidad = parseInt(input.value) || 0;
        if (cantidad > 0) {
            hayDevolucion = true;
            const idProducto = input.getAttribute('data-idproducto');
            const fila = input.closest('tr');
            const nombre = fila.querySelector('td:nth-child(2)').textContent;
            const precioUnitario = parseFloat(fila.querySelector('.precio-unitario').textContent.replace('$', ''));
            const subtotal = cantidad * precioUnitario;
            productosDevueltos.push({
                idProducto,
                nombre,
                cantidad,
                precioUnitario
            });
            
            totalProductosDevueltos += cantidad;
            totalReembolsado += subtotal;
        }
    });
    if (!hayDevolucion) {
        alert('Por favor, especifica al menos una cantidad a devolver');
        return null;
    }
    const datosDevolucion = {
        idVenta: ventaSeleccionadaActual.ventaId,
        vendedor: ventaSeleccionadaActual.vendedor,
        productosDevueltos,
        totalProductosDevueltos,
        totalReembolsado
    };
    return datosDevolucion;
}

async function enviarDevolucionAlBackend(datosDevolucion) {
    try {
        const response = await fetch(`${API_URL}/devoluciones/registerDevolucion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosDevolucion)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar devolución');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

devolucionForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const datosDevolucion = obtenerDatosDevolucion();
    if (!datosDevolucion) return;
    const resumen = `
ID Venta: ${datosDevolucion.idVenta}
Vendedor: ${datosDevolucion.vendedor}
Total Productos a Devolver: ${datosDevolucion.totalProductosDevueltos}
Total a Reembolsar: $${datosDevolucion.totalReembolsado.toFixed(2)}

Productos:
${datosDevolucion.productosDevueltos.map(p => 
    `  • ${p.nombre} (ID: ${p.idProducto}): ${p.cantidad} x $${p.precioUnitario} = $${(p.cantidad * p.precioUnitario).toFixed(2)}`
).join('\n')}
    `;
    
    if (confirm(`¿Confirmar devolución?\n\n${resumen}`)) {
        try {
            const boton = devolucionForm.querySelector('button');
            const textoOriginal = boton.textContent;
            boton.textContent = 'Procesando...';
            boton.disabled = true;
            const resultado = await enviarDevolucionAlBackend(datosDevolucion);
            alert('Devolución registrada exitosamente');
            console.log('Respuesta del backend:', resultado);
            ventaInput.value = '';
            const detallesDiv = document.getElementById('detalles-venta');
            if (detallesDiv) detallesDiv.remove();
            devolucionForm.style.display = 'none';
            ventasGlobal = await obtenerVentas();
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error('Error al registrar devolución:', error);
        } finally {
            const boton = devolucionForm.querySelector('button');
            boton.textContent = 'Registrar Devolución';
            boton.disabled = false;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    obtenerVentas().then(ventas => {
        ventasGlobal = ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const datalist = document.getElementById('ventas-list');
        datalist.innerHTML = '';
        
        ventasGlobal.forEach(venta => {
            const option = document.createElement('option');
            option.value = venta.ventaId;
            const fechaFormateada = new Date(venta.fecha).toLocaleDateString();
            option.textContent = `Fecha: ${fechaFormateada} - Vendedor: ${venta.vendedor}`;
            datalist.appendChild(option);
        });

        if (ventas.length === 0) {
            console.log('No hay ventas disponibles');
        } else {
            console.log(`${ventas.length} ventas cargadas y ordenadas`);
        }
    });
    
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();
        const ventaId = ventaInput.value.trim();
        if (!ventaId) {
            alert('Por favor, escribe el ID de la venta');
            ventaInput.focus();
            return;
        }
        if (ventasGlobal.length === 0) {
            alert('Las ventas aún no se han cargado. Intenta nuevamente en unos segundos.');
            return;
        }
        const ventaSeleccionada = buscarVentaPorId(ventaId);
        if (ventaSeleccionada) {
            mostrarDetallesVenta(ventaSeleccionada);
        } else {
            alert(`No se encontró una venta con el ID: ${ventaId}`);
        }
    });
    ventaInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            formulario.dispatchEvent(new Event('submit'));
        }
    });
});