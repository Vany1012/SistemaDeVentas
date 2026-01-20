console.log('editarProducto.js cargado');

const API_URL = 'http://localhost:3000/api';

// Verificar autenticación y permisos
function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        
        // Verificar si es admin (solo admin puede editar productos)
        if (user.role !== 'admin') {
            alert('No tienes permisos para editar productos. Solo administradores pueden realizar esta acción.');
            window.location.href = 'dashboard.html';
            return null;
        }
        
        return user;
    } catch (e) {
        window.location.href = 'index.html';
        return null;
    }
}

// Buscar producto por folio
async function buscarProductoPorFolio(folio) {
    try {
        const token = localStorage.getItem('token');
        
        // Primero obtenemos el inventario completo y filtramos localmente
        const response = await fetch(`${API_URL}/inventario/verInventario`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const productos = await response.json();
            
            // Buscar el producto por idProducto (folio)
            const productoEncontrado = productos.find(p => p.idProducto === folio.toString());
            
            if (productoEncontrado) {
                return {
                    success: true,
                    producto: productoEncontrado
                };
            } else {
                return {
                    success: false,
                    error: 'Producto no encontrado'
                };
            }
        } else {
            return {
                success: false,
                error: 'Error al obtener el inventario'
            };
        }
    } catch (error) {
        console.error('Error al buscar producto:', error);
        return {
            success: false,
            error: 'Error de conexión'
        };
    }
}

// Cargar datos del producto en el formulario
function cargarDatosEnFormulario(producto) {
    document.getElementById('folio').value = producto.idProducto;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('categoria').value = producto.categoria.toLowerCase();
    document.getElementById('activo').value = producto.activo ? 'si' : 'no';
    
    // Deshabilitar el campo folio (no se puede editar)
    document.getElementById('folio').disabled = true;
}

// Actualizar producto
async function actualizarProducto(productoId, datosActualizados) {
    try {
        const token = localStorage.getItem('token');
        
        // Filtrar solo los campos que tienen valor (no enviar campos vacíos)
        const camposParaActualizar = {};
        
        if (datosActualizados.nombre && datosActualizados.nombre.trim() !== '') {
            camposParaActualizar.nombre = datosActualizados.nombre;
        }
        
        if (datosActualizados.precio !== undefined && datosActualizados.precio !== '') {
            camposParaActualizar.precio = parseFloat(datosActualizados.precio);
        }
        
        if (datosActualizados.stock !== undefined && datosActualizados.stock !== '') {
            camposParaActualizar.stock = parseInt(datosActualizados.stock);
        }
        
        if (datosActualizados.categoria && datosActualizados.categoria !== 'seleccion') {
            camposParaActualizar.categoria = datosActualizados.categoria;
        }
        
        if (datosActualizados.activo !== undefined) {
            camposParaActualizar.activo = datosActualizados.activo === 'si';
        }
        
        // Verificar que haya al menos un campo para actualizar
        if (Object.keys(camposParaActualizar).length === 0) {
            return {
                success: false,
                error: 'No hay campos para actualizar'
            };
        }
        
        const response = await fetch(`${API_URL}/inventario/editarProductoPorId?idProducto=${productoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(camposParaActualizar)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return {
                success: true,
                message: data.massage || 'Producto actualizado correctamente',
                producto: data.producto
            };
        } else {
            return {
                success: false,
                error: data.message || 'Error al actualizar el producto'
            };
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}

// Mostrar mensaje
function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear o actualizar contenedor de mensajes
    let mensajeContainer = document.getElementById('mensaje-container');
    
    if (!mensajeContainer) {
        mensajeContainer = document.createElement('div');
        mensajeContainer.id = 'mensaje-container';
        mensajeContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(mensajeContainer);
    }
    
    // Crear elemento de mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje ${tipo}`;
    mensajeElement.textContent = mensaje;
    mensajeElement.style.cssText = `
        padding: 15px 25px;
        margin-bottom: 10px;
        background-color: ${tipo === 'error' ? '#f44336' : tipo === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    
    // Agregar al contenedor
    mensajeContainer.appendChild(mensajeElement);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        mensajeElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.remove();
            }
        }, 300);
    }, 5000);
    
    // Agregar animaciones CSS si no existen
    if (!document.querySelector('#animaciones-mensaje')) {
        const style = document.createElement('style');
        style.id = 'animaciones-mensaje';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Configurar búsqueda automática al cambiar el folio
function configurarBusquedaAutomatica() {
    const folioInput = document.getElementById('folio');
    
    folioInput.addEventListener('change', async function() {
        const folio = this.value.trim();
        
        if (!folio) {
            return;
        }
        
        mostrarMensaje('Buscando producto...', 'info');
        
        const resultado = await buscarProductoPorFolio(folio);
        
        if (resultado.success) {
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto encontrado', 'success');
        } else {
            // Limpiar formulario si no se encontró
            document.getElementById('nombre').value = '';
            document.getElementById('precio').value = '';
            document.getElementById('stock').value = '';
            document.getElementById('categoria').value = 'seleccion';
            document.getElementById('activo').value = 'si';
            
            mostrarMensaje(resultado.error || 'Producto no encontrado', 'error');
        }
    });
}

// Configurar formulario de edición
function configurarFormulario() {
    const formulario = document.getElementById('edit-product-form');
    
    if (!formulario) {
        console.error('No se encontró el formulario con id="edit-product-form"');
        return;
    }
    
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const folio = document.getElementById('folio').value;
        const nombre = document.getElementById('nombre').value;
        const precio = document.getElementById('precio').value;
        const stock = document.getElementById('stock').value;
        const categoria = document.getElementById('categoria').value;
        const activo = document.getElementById('activo').value;
        
        // Validaciones
        if (!folio) {
            mostrarMensaje('El folio del producto es requerido', 'error');
            return;
        }
        
        if (categoria === 'seleccion') {
            mostrarMensaje('Por favor selecciona una categoría', 'error');
            return;
        }
        
        if (precio && parseFloat(precio) < 0) {
            mostrarMensaje('El precio no puede ser negativo', 'error');
            return;
        }
        
        if (stock && parseInt(stock) < 0) {
            mostrarMensaje('El stock no puede ser negativo', 'error');
            return;
        }
        
        // Preparar datos para actualizar
        const datosActualizados = {
            nombre: nombre,
            precio: precio,
            stock: stock,
            categoria: categoria,
            activo: activo
        };
        
        // Mostrar mensaje de procesamiento
        mostrarMensaje('Actualizando producto...', 'info');
        
        // Deshabilitar botón
        const botonSubmit = this.querySelector('button[type="submit"]');
        const textoOriginal = botonSubmit.textContent;
        botonSubmit.disabled = true;
        botonSubmit.textContent = 'Actualizando...';
        
        try {
            const resultado = await actualizarProducto(folio, datosActualizados);
            
            if (resultado.success) {
                mostrarMensaje(resultado.message || '✅ Producto actualizado correctamente', 'success');
                
                // Redirigir al dashboard después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                mostrarMensaje(resultado.error || '❌ Error al actualizar el producto', 'error');
                botonSubmit.disabled = false;
                botonSubmit.textContent = textoOriginal;
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor', 'error');
            botonSubmit.disabled = false;
            botonSubmit.textContent = textoOriginal;
        }
    });
}

// Configurar botón de volver al dashboard
function configurarBotonVolver() {
    // Crear botón de volver si no existe
    const botonVolver = document.createElement('button');
    botonVolver.id = 'volverBtn';
    botonVolver.textContent = '← Volver al Dashboard';
    botonVolver.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        padding: 10px 15px;
        background-color: #607d8b;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 100;
    `;
    
    botonVolver.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
    
    document.body.appendChild(botonVolver);
}

// Inicializar la página
function inicializarPagina() {
    // Verificar autenticación y permisos
    const usuario = checkAuthAndPermissions();
    if (!usuario) return;
    
    console.log('Usuario autenticado:', usuario.vendedorName, '- Rol:', usuario.role);
    
    // Configurar elementos de la página
    configurarBusquedaAutomatica();
    configurarFormulario();
    configurarBotonVolver();
    
    // Mostrar nombre de usuario en la página
    const titulo = document.querySelector('h2');
    if (titulo) {
        titulo.insertAdjacentHTML('afterend', `
            <p style="text-align: center; color: #666; margin-top: -10px; margin-bottom: 20px;">
                Usuario: ${usuario.vendedorName} (${usuario.role})
            </p>
        `);
    }
}

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPagina);