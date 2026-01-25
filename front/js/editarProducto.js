const API_URL = 'http://localhost:3000/api';

// Variable para controlar si vino desde inventario
let vieneDeInventario = false;
let productoActual = null;

// Inicio de página autentificada
function inicializarPagina() {
    // Verificar que sea admin
    const usuario = checkAdminAuth();
    if (!usuario) return;
    
    // Verificar si viene desde inventario
    verificarOrigen();
    
    // Elementos de la página
    configurarBarraBusqueda(); // Crear barra de búsqueda
    configurarFormulario();
    configurarBotonVolver();
    
    // Cargar categorías DESPUÉS de configurar la barra de búsqueda
    cargarCategorias();
    
    // Verificar si hay un producto para editar desde la URL
    cargarProductoDesdeURL();
}

// Verificar si viene desde inventario (por el botón Editar)
function verificarOrigen() {
    const urlParams = new URLSearchParams(window.location.search);
    const desdeInventario = urlParams.get('from') === 'inventario';
    const productoId = urlParams.get('id');
    
    if (desdeInventario && productoId) {
        vieneDeInventario = true;
        // Mostrar el ID en el campo folio
        const folioInput = document.getElementById('folio');
        if (folioInput) {
            folioInput.value = productoId;
            folioInput.disabled = true;
        }
    }
}

// Crear barra de búsqueda arriba del formulario
function configurarBarraBusqueda() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    // Crear contenedor de búsqueda
    const searchContainer = document.createElement('div');
    searchContainer.id = 'search-container';
    searchContainer.style.cssText = `
        background: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    searchContainer.innerHTML = `
        <h3 style="color: #415a77; margin-bottom: 15px; font-size: 1.2rem;">
            Buscar Producto para Editar
        </h3>
        <div style="display: flex; gap: 10px; align-items: center;">
            <div style="flex: 1; position: relative;">
                <input type="text" id="search-input" placeholder="Buscar por ID o nombre del producto..." 
                    style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                <div id="search-suggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; 
                    background: white; border: 1px solid #ddd; border-radius: 0 0 8px 8px; max-height: 200px; overflow-y: auto; 
                    z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                </div>
            </div>
            <button id="search-btn" style="padding: 12px 25px; background: #415a77; color: white; 
                border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                Buscar
            </button>
            <button id="clear-search-btn" style="padding: 12px 15px; background: #6c757d; color: white; 
                border: none; border-radius: 8px; cursor: pointer;">
                Limpiar
            </button>
        </div>
        <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">
            Escribe el ID o nombre del producto y selecciona de las sugerencias
        </p>
    `;
    
    // Insertar antes del formulario
    const formulario = document.getElementById('edit-product-form');
    if (formulario) {
        container.insertBefore(searchContainer, formulario);
    } else {
        container.insertBefore(searchContainer, container.firstChild);
    }
    
    // Configurar eventos de búsqueda
    configurarEventosBusqueda();
}

// Configurar eventos para la barra de búsqueda
function configurarEventosBusqueda() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-search-btn');
    const suggestionsBox = document.getElementById('search-suggestions');
    
    if (!searchInput || !searchBtn) return;
    
    // Función para realizar búsqueda
    const realizarBusqueda = async () => {
        const query = searchInput.value.trim();
        
        if (!query) {
            mostrarMensaje('Por favor ingresa un término de búsqueda', 'error');
            return;
        }
        
        mostrarMensaje('Buscando producto...', 'info');
        
        const resultado = await buscarProductoPorIdentificador(query);
        
        if (resultado.success) {
            productoActual = resultado.producto;
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto encontrado y cargado', 'success');
            searchInput.value = ''; // Limpiar búsqueda
            suggestionsBox.style.display = 'none'; // Ocultar sugerencias
        } else {
            mostrarMensaje(resultado.error || 'Producto no encontrado', 'error');
        }
    };
    
    // Búsqueda al hacer clic
    searchBtn.addEventListener('click', realizarBusqueda);
    
    // Búsqueda al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            realizarBusqueda();
        }
    });
    
    // Autocompletado mientras escribe
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }
        
        try {
            const response = await authFetch('/inventario/verInventario', {
                method: 'GET'
            });
            
            if (response.ok) {
                const productos = await response.json();
                
                // Filtrar productos que coincidan
                const sugerencias = productos.filter(p => 
                    p.idProducto.toLowerCase().includes(query.toLowerCase()) ||
                    p.nombre.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5); // Limitar a 5 sugerencias
                
                if (sugerencias.length > 0) {
                    suggestionsBox.innerHTML = sugerencias.map(p => `
                        <div class="suggestion-item" data-id="${p.idProducto}" 
                            style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #eee; 
                                   transition: background 0.2s;"
                            onmouseover="this.style.background='#f0f0f0'"
                            onmouseout="this.style.background='white'">
                            <strong>${p.idProducto}</strong> - ${p.nombre}
                            <div style="font-size: 0.8em; color: #666;">Categoría: ${p.categoria || 'Sin categoría'}</div>
                        </div>
                    `).join('');
                    
                    suggestionsBox.style.display = 'block';
                    
                    // Agregar eventos a las sugerencias
                    document.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', async () => {
                            const productId = item.getAttribute('data-id');
                            searchInput.value = productId;
                            suggestionsBox.style.display = 'none';
                            
                            mostrarMensaje('Cargando producto...', 'info');
                            const resultado = await buscarProductoPorIdentificador(productId);
                            
                            if (resultado.success) {
                                productoActual = resultado.producto;
                                cargarDatosEnFormulario(resultado.producto);
                                mostrarMensaje('Producto cargado', 'success');
                            }
                        });
                    });
                } else {
                    suggestionsBox.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error en autocompletado:', error);
        }
    });
    
    // Ocultar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (suggestionsBox && 
            !searchInput.contains(e.target) && 
            !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
    
    // Limpiar búsqueda
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        suggestionsBox.style.display = 'none';
        limpiarFormulario();
        document.getElementById('folio').disabled = false;
        document.getElementById('folio').value = '';
        productoActual = null;
        mostrarMensaje('Búsqueda limpiada', 'info');
    });
}

// Cargar categorías desde la base de datos
async function cargarCategorias() {
    try {
        const response = await authFetch('/categoriaProducto/verCategoriasProducto', {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Verificar si data.categorias existe y es un array
            let categorias = [];
            if (Array.isArray(data.categorias)) {
                categorias = data.categorias;
            } else if (Array.isArray(data)) {
                categorias = data;
            } else if (data && typeof data === 'object') {
                // Intentar extraer categorías del objeto
                categorias = Object.values(data).filter(item => 
                    item && typeof item === 'object' && item.categoriaProducto
                );
            }
            
            // Crear datalist para categorías
            let datalist = document.getElementById('categorias-list');

            // Crear o limpiar datalist
            if (datalist) {
                datalist.innerHTML = '';
            } else {
                datalist = document.createElement('datalist');
                datalist.id = 'categorias-list';
                document.body.appendChild(datalist);
            }

            // Agregar opciones al datalist (se usarán si el campo es input)
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                const catValue = categoria.categoriaProducto || categoria.nombre || categoria;
                option.value = catValue;
                datalist.appendChild(option);
            });

            // Configurar el elemento de categoría (puede ser <input> o <select>)
            const categoriaElem = document.getElementById('categoria');
            if (categoriaElem) {
                if (categoriaElem.tagName.toLowerCase() === 'select') {
                    // Poblar select con opciones
                    categoriaElem.innerHTML = '<option value="" disabled selected>-- Selecciona --</option>';
                    categorias.forEach(c => {
                        const opt = document.createElement('option');
                        const val = c.categoriaProducto || c.nombre || c;
                        opt.value = val;
                        opt.textContent = val;
                        categoriaElem.appendChild(opt);
                    });
                } else {
                    // Input con datalist
                    categoriaElem.setAttribute('list', 'categorias-list');
                    categoriaElem.placeholder = 'Selecciona o escribe una nueva categoría';
                    categoriaElem.addEventListener('input', validarCategoriaEnTiempoReal);
                }
            }
        } else {
            console.error('Error al cargar categorías:', response.status);
            mostrarMensaje('Error al cargar categorías. Usando lista local.', 'error');
            cargarCategoriasPorDefecto();
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarMensaje('Error al cargar categorías. Usando lista local.', 'error');
        cargarCategoriasPorDefecto();
    }
}

// Cargar categorías por defecto si falla la conexión
function cargarCategoriasPorDefecto() {
    const categoriasDefault = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes', 'Alimentos', 'Bebidas', 'Libros'];
    let datalist = document.getElementById('categorias-list');

    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'categorias-list';
        document.body.appendChild(datalist);
    } else {
        datalist.innerHTML = '';
    }

    categoriasDefault.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        datalist.appendChild(option);
    });

    const categoriaElem = document.getElementById('categoria');
    if (categoriaElem) {
        if (categoriaElem.tagName.toLowerCase() === 'select') {
            categoriaElem.innerHTML = '<option value="" disabled selected>-- Selecciona --</option>';
            categoriasDefault.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categoriaElem.appendChild(opt);
            });
        } else {
            categoriaElem.setAttribute('list', 'categorias-list');
        }
    }
}

// Validar categoría en tiempo real
function validarCategoriaEnTiempoReal(e) {
    const input = e.target;
    const categoria = input.value.trim();
    const errorMsg = document.getElementById('categoria-error') || 
                     crearElementoErrorCategoria(input);
    
    // Si está vacío, no mostrar error
    if (!categoria) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
        input.style.borderColor = '';
        return;
    }
    
    // Validar que solo contenga letras y espacios
    const regexCategoria = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
    
    if (!regexCategoria.test(categoria)) {
        const tieneNumeros = /\d/.test(categoria);
        const tieneCaracteresEspeciales = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(categoria);
        
        if (tieneNumeros && tieneCaracteresEspeciales) {
            errorMsg.textContent = 'La categoría no puede contener números ni caracteres especiales';
        } else if (tieneNumeros) {
            errorMsg.textContent = 'La categoría no puede contener números';
        } else {
            errorMsg.textContent = 'La categoría no puede contener caracteres especiales';
        }
        
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#dc3545';
        input.style.borderColor = '#dc3545';
        input.style.borderWidth = '2px';
    } else {
        // Validar longitud mínima
        if (categoria.length < 2) {
            errorMsg.textContent = 'La categoría debe tener al menos 2 caracteres';
            errorMsg.style.display = 'block';
            errorMsg.style.color = '#dc3545';
            input.style.borderColor = '#dc3545';
        } else if (categoria.length > 50) {
            errorMsg.textContent = 'La categoría no puede tener más de 50 caracteres';
            errorMsg.style.display = 'block';
            errorMsg.style.color = '#dc3545';
            input.style.borderColor = '#dc3545';
        } else {
            errorMsg.textContent = '✓ Categoría válida';
            errorMsg.style.display = 'block';
            errorMsg.style.color = '#28a745';
            input.style.borderColor = '#28a745';
        }
    }
}

// Crear elemento de error para categoría
function crearElementoErrorCategoria(input) {
    const errorMsg = document.createElement('div');
    errorMsg.id = 'categoria-error';
    errorMsg.style.cssText = `
        font-size: 13px;
        margin-top: 5px;
        display: none;
    `;
    
    // Insertar después del input
    if (input.parentNode) {
        input.parentNode.appendChild(errorMsg);
    }
    
    return errorMsg;
}

// Crear o verificar categoría en la base de datos
async function crearNuevaCategoria(nombreCategoria) {
    try {
        // Validar categoría antes de enviar
        const regexCategoria = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
        if (!regexCategoria.test(nombreCategoria) || nombreCategoria.length < 2) {
            return {
                success: false,
                error: 'Categoría inválida. Solo letras y espacios, mínimo 2 caracteres'
            };
        }
        
        const payload = {
            categoria: nombreCategoria.trim()
        };
        
        const response = await authFetch('/categoriaProducto/crearCategoriaProducto', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Agregar la nueva categoría al datalist y al select si existen
            const datalist = document.getElementById('categorias-list');
            if (datalist) {
                const option = document.createElement('option');
                option.value = nombreCategoria;
                datalist.appendChild(option);
            }

            const categoriaElem = document.getElementById('categoria');
            if (categoriaElem && categoriaElem.tagName.toLowerCase() === 'select') {
                const opt = document.createElement('option');
                opt.value = nombreCategoria;
                opt.textContent = nombreCategoria;
                categoriaElem.appendChild(opt);
                categoriaElem.value = nombreCategoria;
            }

            return {
                success: true,
                categoria: data.categoria || nombreCategoria
            };
        } else {
            // Si la categoría ya existe, no es un error
            if (data.message && data.message.toLowerCase().includes('ya existe')) {
                return {
                    success: true,
                    categoria: nombreCategoria
                };
            }
            
            return {
                success: false,
                error: data.message || 'Error al crear categoría'
            };
        }
    } catch (error) {
        console.error('Error al crear categoría:', error);
        return {
            success: false,
            error: 'Error de conexión al crear categoría'
        };
    }
}

// Cargar producto desde la página Inventario (luego del clic en "Editar")
async function cargarProductoDesdeURL() {
    // Obtener el ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');
    
    if (productoId) {        
        // Mostrar mensaje de carga
        mostrarMensaje('Cargando producto...', 'info');
        
        // Buscar el producto por ID
        const resultado = await buscarProductoPorIdentificador(productoId);
        
        if (resultado.success) {
            productoActual = resultado.producto;
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto cargado correctamente', 'success');
        } else {
            mostrarMensaje('No se pudo cargar el producto. Puedes buscarlo arriba.', 'error');
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

// Limpiar formulario (excepto el folio)
function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('activo').value = 'si';
    
    // Limpiar errores de categoría
    const errorMsg = document.getElementById('categoria-error');
    if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
    }
    
    const categoriaInput = document.getElementById('categoria');
    if (categoriaInput) {
        categoriaInput.style.borderColor = '';
    }
}

// Cargar datos del producto en el formulario
function cargarDatosEnFormulario(producto) {
    // Llenar campos del formulario
    document.getElementById('folio').value = producto.idProducto;
    document.getElementById('folio').disabled = true;
    document.getElementById('nombre').value = producto.nombre || '';
    document.getElementById('precio').value = producto.precio || '';
    document.getElementById('stock').value = producto.stock || '';
    
    // Establecer categoría
    const categoriaInput = document.getElementById('categoria');
    if (categoriaInput && producto.categoria) {
        categoriaInput.value = producto.categoria;
        // Validar la categoría cargada
        validarCategoriaEnTiempoReal({ target: categoriaInput });
    }
    
    // Establecer estado activo
    const activoSelect = document.getElementById('activo');
    if (activoSelect) {
        activoSelect.value = producto.activo ? 'si' : 'no';
    }
}

// Actualizar producto usando authFetch
async function actualizarProducto(productoId, datosActualizados) {
    try {
        // Verificar si la categoría es nueva y crearla si es necesario
        if (datosActualizados.categoria && datosActualizados.categoria.trim() !== '') {
            const resultadoCategoria = await crearNuevaCategoria(datosActualizados.categoria);
            if (!resultadoCategoria.success) {
                return {
                    success: false,
                    error: resultadoCategoria.error
                };
            }
        }
        
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
        
        if (datosActualizados.categoria && datosActualizados.categoria.trim() !== '') {
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
                message: data.message || 'Producto actualizado correctamente',
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
            mostrarMensaje('Primero debes buscar y seleccionar un producto', 'error');
            return;
        }
        
        // Validar categoría
        if (!categoria.trim()) {
            mostrarMensaje('La categoría es requerida', 'error');
            return;
        }
        
        const regexCategoria = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
        if (!regexCategoria.test(categoria) || categoria.length < 2) {
            mostrarMensaje('La categoría solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
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
                
                // Redirigir SOLO si viene de inventario
                if (vieneDeInventario) {
                    setTimeout(() => {
                        window.location.href = 'inventario.html';
                    }, 2000);
                } else {
                    // Si no viene de inventario, habilitar el botón y mantener en la página
                    setTimeout(() => {
                        botonSubmit.disabled = false;
                        botonSubmit.textContent = textoOriginal;
                    }, 1000);
                }
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

// Botón para volver a Inventario
function configurarBotonVolver() {
    // Crear contenedor para el botón
    const botonContainer = document.createElement('div');
    botonContainer.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 100;
    `;
    
    // Crear botón
    const botonVolver = document.createElement('button');
    botonVolver.id = 'volverBtn';
    botonVolver.textContent = '← Volver al Inventario';
    botonVolver.style.cssText = `
        padding: 12px 20px;
        background-color: #415a77;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    botonVolver.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#2d435e';
    });
    
    botonVolver.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#415a77';
    });
    
    botonVolver.addEventListener('click', function() {
        window.location.href = vieneDeInventario ? 'inventario.html' : 'dashboard.html';
    });
    
    botonContainer.appendChild(botonVolver);
    document.body.appendChild(botonContainer);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPagina);