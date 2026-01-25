const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem('token');
const formulario = document.getElementById('venta-formulario');
const ventaInput = document.getElementById('venta-input');
const devolucionForm = document.getElementById('devolucion-form');
let ventasGlobal = [];
let ventaSeleccionadaActual = null;
let pendienteConfirmacion = false;

function mostrarMensaje(texto, esError = false) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px; 
        border-radius: 8px; color: white; z-index: 1000; font-weight: bold;
        background-color: ${esError ? '#e74c3c' : '#2ecc71'};
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    mensajeDiv.textContent = texto;
    document.body.appendChild(mensajeDiv);
    setTimeout(() => mensajeDiv.remove(), 3000);
}

async function obtenerVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas/ventas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al obtener ventas');
        const data = await response.json();
        return data.ventas;
    } catch (error) {
        return [];
    }
}

function buscarVentaPorId(ventaId) {
    return ventasGlobal.find(venta => venta.ventaId === ventaId);
}

function validarContador(input, cantidadMaxima) {
    input.value = input.value.replace(/[^0-9]/g, '');
    let valor = parseInt(input.value);
    if (isNaN(valor)) {
        valor = 0;
    }
    if (valor < 0) {
        input.value = 0;
    } else if (valor > cantidadMaxima) {
        input.value = cantidadMaxima;
        mostrarMensaje(`Máximo permitido: ${cantidadMaxima}`, true);
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
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
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
                    <input type="number" min="0" max="${producto.cantidad}" value="0"
                           class="cantidad-devolver-input"
                           data-idproducto="${producto.idProducto}"
                           data-max="${producto.cantidad}">
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
                <div class="info-item"><strong>ID Venta:</strong> <span>${venta.ventaId}</span></div>
                <div class="info-item"><strong>Vendedor:</strong> <span>${venta.vendedor}</span></div>
                <div class="info-item"><strong>Fecha:</strong> <span>${fecha}</span></div>
                <div class="info-item total"><strong>Total:</strong> <span>$${venta.total.toFixed(2)}</span></div>
            </div>
            <table class="productos-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Nombre</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th>Devolver</th><th>Reembolso</th>
                    </tr>
                </thead>
                <tbody>${productosHTML}</tbody>
            </table>
            <div class="resumen-devolucion">
                <div class="total-devolucion">
                    <strong>Total a Reembolsar:</strong>
                    <span id="total-devolucion">$0.00</span>
                </div>
            </div>
        </div>
    `;
    devolucionForm.style.display = 'block';
    
    detallesDiv.querySelectorAll('.cantidad-devolver-input').forEach(input => {
        input.addEventListener('input', function() { validarContador(this, parseInt(this.dataset.max)); });
    });
}

function obtenerDatosDevolucion() {
    if (!ventaSeleccionadaActual) return null;
    const inputs = document.querySelectorAll('.cantidad-devolver-input');
    const productosDevueltos = [];
    let totalReembolsado = 0;
    let totalProductosDevueltos = 0;

    inputs.forEach(input => {
        const cantidad = parseInt(input.value) || 0;
        if (cantidad > 0) {
            const fila = input.closest('tr');
            const precioUnitario = parseFloat(fila.querySelector('.precio-unitario').textContent.replace('$', ''));
            productosDevueltos.push({
                idProducto: input.getAttribute('data-idproducto'),
                nombre: fila.querySelector('td:nth-child(2)').textContent,
                cantidad,
                precioUnitario
            });
            totalProductosDevueltos += cantidad;
            totalReembolsado += (cantidad * precioUnitario);
        }
    });

    if (productosDevueltos.length === 0) {
        mostrarMensaje('Especifique al menos un producto para devolver', true);
        return null;
    }

    return {
        ventaId: ventaSeleccionadaActual.ventaId, 
        vendedor: ventaSeleccionadaActual.vendedor,
        productosDevueltos,
        totalProductosDevueltos,
        totalReembolsado
    };
}

async function enviarDevolucionAlBackend(datosDevolucion) {
    const response = await fetch(`${API_URL}/devoluciones/registerDevolucion`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosDevolucion)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error en el servidor');
    return data;
}


devolucionForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const datosDevolucion = obtenerDatosDevolucion();
    if (!datosDevolucion) return;

    const boton = devolucionForm.querySelector('button');
    if (!pendienteConfirmacion) {
        pendienteConfirmacion = true;
        boton.textContent = `¿Confirmar $${datosDevolucion.totalReembolsado.toFixed(2)}?`;
        boton.style.backgroundColor = "#e67e22";
        
        setTimeout(() => {
            if (pendienteConfirmacion) {
                pendienteConfirmacion = false;
                boton.textContent = 'Registrar Devolución';
                boton.style.backgroundColor = ""; 
            }
        }, 3000);
        
        return;
    }

    try {
        pendienteConfirmacion = false;
        boton.textContent = 'Procesando...';
        boton.disabled = true;

        await enviarDevolucionAlBackend(datosDevolucion);
        
        mostrarMensaje('Devolución registrada exitosamente');
        
        ventaInput.value = '';
        const detallesDiv = document.getElementById('detalles-venta');
        if (detallesDiv) detallesDiv.remove();
        devolucionForm.style.display = 'none';
        
        ventasGlobal = await obtenerVentas();
        
    } catch (error) {
        mostrarMensaje(error.message, true);
        boton.disabled = false;
        boton.textContent = 'Registrar Devolución';
        boton.style.backgroundColor = "";
    } finally {
        if (devolucionForm.style.display !== 'none') {
            boton.disabled = false;
            boton.textContent = 'Registrar Devolución';
            boton.style.backgroundColor = "";
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    obtenerVentas().then(ventas => {
        ventasGlobal = ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const datalist = document.getElementById('ventas-list');
        ventasGlobal.forEach(venta => {
            const option = document.createElement('option');
            option.value = venta.ventaId;
            option.textContent = `Vendedor: ${venta.vendedor}`;
            datalist.appendChild(option);
        });
    });

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        const venta = buscarVentaPorId(ventaInput.value.trim());
        venta ? mostrarDetallesVenta(venta) : mostrarMensaje('Venta no encontrada', true);
    });
});