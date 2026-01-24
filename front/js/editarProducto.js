const API_URL = 'http://localhost:3000/api';

// Inicio de página autentificada
function inicializarPagina() {
    // Verificar que sea administrador usando la función centralizada
    const usuario = checkAdminAuth();
    if (!usuario) return;
    
    console.log('Usuario autenticado:', usuario.vendedorName, '- Rol:', usuario.role);
    
    // Mostramos nombre de usuario
    const titulo = document.querySelector('h2');
    if (titulo) {
        titulo.insertAdjacentHTML('afterend', `
            <p style="text-align: center; color: #666; margin-top: -10px; margin-bottom: 20px;">
                Usuario: ${usuario.vendedorName} (${usuario.role})
            </p>
        `);
    }
    
    // Cargar categorías disponibles
    cargarCategorias();
    
    // Elementos de la página
    configurarBuscador();
    configurarFormulario();
    configurarBotonVolver();
    
    // Verificar si hay un producto para editar desde la URL
    cargarProductoDesdeURL();
}

// Cargar categorías desde la base de datos
async function cargarCategorias() {
    try {
        const response = await authFetch('/inventario/verInventario', {
            method: 'GET'
        });
        
        if (response.ok) {
            const productos = await response.json();
            
            // Extraer categorías únicas
            const categoriasSet = new Set();
            productos.forEach(producto => {
                if (producto.categoria && producto.categoria.trim() !== '') {
                    categoriasSet.add(producto.categoria.toLowerCase());
                }
            });
            
            // Convertir a array y ordenar alfabéticamente
            const categorias = Array.from(categoriasSet).sort();
            
            // Actualizar el select de categorías
            const selectCategoria = document.getElementById('categoria');
            if (selectCategoria) {
                // Guardar las opciones existentes
                const defaultOption = selectCategoria.querySelector('option[value="seleccion"]');
                
                // Agregar categorías únicas
                categorias.forEach(categoria => {
                    // Verificar si ya existe la opción
                    const exists = Array.from(selectCategoria.options).some(
                        option => option.value === categoria
                    );
                    
                    if (!exists) {
                        const option = document.createElement('option');
                        option.value = categoria;
                        option.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
                        selectCategoria.appendChild(option);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Cargar producto desde la página Inventario (luego del clic en "Editar")
async function cargarProductoDesdeURL() {
    // Obtener el ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');
    
    if (productoId) {
        console.log('Cargando producto desde URL:', productoId);
        
        // Mostrar mensaje de carga
        mostrarMensaje('Cargando producto...', 'info');
        
        // Buscar el producto por ID
        const resultado = await buscarProductoPorIdentificador(productoId);
        
        if (resultado.success) {
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto cargado correctamente', 'success');
        } else {
            mostrarMensaje('No se pudo cargar el producto', 'error');
            // Dejar el campo de folio con el ID para que puedan buscar manualmente
            document.getElementById('folio').value = productoId;
        }
    }
}

// Buscar producto por ID o nombre
async function buscarProductoPorIdentificador(identificador) {
    try {
        const response = await authFetch('/inventario/verInventario', {
            method: 'GET'
        });
        
        if (response.ok) {
            const productos = await response.json();
            
            // Buscar el producto por ID (exacto) o nombre (parcial)
            const productoEncontrado = productos.find(p => 
                p.idProducto === identificador.toString() || 
                p.nombre.toLowerCase().includes(identificador.toLowerCase())
            );
            
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
            error: error.message === 'No autenticado' ? 'Sesión expirada' : 'Error de conexión'
        };
    }
}

// Configurar buscador con autocompletado
function configurarBuscador() {
    const folioInput = document.getElementById('folio');
    const buscarBtn = document.createElement('button');
    
    // Crear botón de búsqueda
    buscarBtn.type = 'button';
    buscarBtn.textContent = '🔍 Buscar';
    buscarBtn.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #546e7a;
        z-index: 10;
    `;
    
    // Agregar placeholder más descriptivo
    folioInput.placeholder = 'ID del producto o nombre';
    
    // Agregar botón dentro del input-wrapper
    const inputWrapper = folioInput.closest('.input-wrapper');
    if (inputWrapper) {
        inputWrapper.style.position = 'relative';
        inputWrapper.appendChild(buscarBtn);
    }
    
    // Función para realizar la búsqueda
    const realizarBusqueda = async () => {
        const identificador = folioInput.value.trim();
        
        if (!identificador) {
            mostrarMensaje('Por favor ingresa un ID o nombre del producto', 'error');
            return;
        }
        
        mostrarMensaje('Buscando producto...', 'info');
        
        const resultado = await buscarProductoPorIdentificador(identificador);
        
        if (resultado.success) {
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto encontrado', 'success');
        } else {
            // Limpiar formulario si no se encontró
            limpiarFormulario();
            mostrarMensaje(resultado.error || 'Producto no encontrado', 'error');
        }
    };
    
    // Eventos para la búsqueda
    buscarBtn.addEventListener('click', realizarBusqueda);
    
    // Buscar al presionar Enter
    folioInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            realizarBusqueda();
        }
    });
}

// Limpiar formulario (excepto el folio)
function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('categoria').value = 'seleccion';
    document.getElementById('activo').value = 'si';
}

// Cargar datos del producto en el formulario
function cargarDatosEnFormulario(producto) {
    document.getElementById('folio').value = producto.idProducto;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    
    // Establecer categoría
    const selectCategoria = document.getElementById('categoria');
    const categoriaValue = producto.categoria ? producto.categoria.toLowerCase() : '';
    
    if (categoriaValue && selectCategoria) {
        // Buscar si la categoría existe en las opciones
        for (let option of selectCategoria.options) {
            if (option.value === categoriaValue) {
                selectCategoria.value = categoriaValue;
                break;
            }
        }
    }
    
    document.getElementById('activo').value = producto.activo ? 'si' : 'no';
    
    // Deshabilitar el campo folio (no se puede editar)
    document.getElementById('folio').disabled = true;
}

// Actualizar producto usando authFetch
async function actualizarProducto(productoId, datosActualizados) {
    try {
        // Filtrar solo los campos que tienen valor
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
        
        const response = await authFetch(`/inventario/editarProductoPorId?idProducto=${productoId}`, {
            method: 'PUT',
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
            error: error.message === 'No autenticado' ? 'Sesión expirada' : 'Error de conexión con el servidor'
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
    
    // Animaciones CSS
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

// Formulario de edición
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
            mostrarMensaje('Primero debes buscar un producto', 'error');
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
                
                // Redirigir al inventario después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'inventario.html';
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

// Botón pa' volver a Inventario
function configurarBotonVolver() {
    const botonVolver = document.createElement('button');
    botonVolver.id = 'volverBtn';
    botonVolver.textContent = '← Volver al Inventario';
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
        window.location.href = 'inventario.html';
    });
    
    document.body.appendChild(botonVolver);
}

document.addEventListener('DOMContentLoaded', inicializarPagina);