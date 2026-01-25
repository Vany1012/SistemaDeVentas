const API_URL = 'http://localhost:3000/api';

// Variable para controlar si vino desde inventario
let vieneDeInventario = false;
let categoriasExistentes = []; // Para almacenar las categorías cargadas

// Inicio de página autentificada
function inicializarPagina() {
    // Verificar que sea admin
    const usuario = checkAdminAuth();
    if (!usuario) return;
    
    // Verificar si viene desde inventario
    verificarOrigen();
    
    // Elementos de la página
    configurarBarraBusqueda();
    cargarCategorias();
    configurarFormulario();
    configurarBotonVolver();
    
    // Verificar si hay un producto para editar desde la url
    cargarProductoDesdeURL();
    // Validación de Existencia de elementos en Inventario
    verificarInventarioVacio();
}

// Verificar si viene desde inventario (por el botón Editar)
function verificarOrigen() {
    const urlParams = new URLSearchParams(window.location.search);
    const desdeInventario = urlParams.get('from') === 'inventario';
    const productoId = urlParams.get('id');
    
    if (desdeInventario && productoId) {
        vieneDeInventario = true;
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
            🔍 Buscar Producto para Editar
        </h3>
        <div style="display: flex; gap: 10px;">
            <div style="flex: 1; position: relative;">
                <input type="text" id="search-input" placeholder="Buscar por ID o nombre del producto..." 
                    style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                <div id="search-suggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; 
                    background: white; border: 1px solid #ddd; border-radius: 8px; max-height: 200px; overflow-y: auto; 
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
    `;
    
    // Insertar antes del formulario
    container.insertBefore(searchContainer, container.firstChild);
    
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
        
        const resultado = await buscarProductoPorId(query);
        
        if (resultado.success) {
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto encontrado', 'success');
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
                                   transition: background 0.2s;">
                            <strong>${p.idProducto}</strong> - ${p.nombre}
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
                            const resultado = await buscarProductoPorId(productId);
                            
                            if (resultado.success) {
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
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
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
            
            // Extraer categorías del response
            let categorias = [];
            if (Array.isArray(data)) {
                categorias = data;
            } else if (data && data.categorias && Array.isArray(data.categorias)) {
                categorias = data.categorias;
            }
            
            // Guardar categorías en variable global
            categoriasExistentes = categorias.map(cat => 
                typeof cat === 'string' ? cat : (cat.categoriaProducto || cat)
            ).filter(Boolean);
            
            // Actualizar el select de categorías
            actualizarSelectCategorias(categoriasExistentes);
            
        } else {
            console.error('Error al cargar categorías:', response.status);
            // Usar categorías por defecto
            const categoriasDefault = ['electronica', 'ropa', 'hogar', 'deportes', 'juguetes'];
            actualizarSelectCategorias(categoriasDefault);
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarMensaje('Error al cargar categorías. Usando lista local.', 'error');
        
        // Usar categorías por defecto
        const categoriasDefault = ['electronica', 'ropa', 'hogar', 'deportes', 'juguetes'];
        actualizarSelectCategorias(categoriasDefault);
    }
}

// Actualizar el select con las categorías
function actualizarSelectCategorias(categorias) {
    const selectCategoria = document.getElementById('categoria');
    if (!selectCategoria) return;
    
    // Guardar el valor actual
    const valorActual = selectCategoria.value;
    
    // Limpiar opciones existentes (excepto la primera si es placeholder)
    while (selectCategoria.options.length > 0) {
        selectCategoria.remove(0);
    }
    
    // Agregar opción placeholder
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '-- Selecciona una categoría --';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectCategoria.appendChild(placeholderOption);
    
    // Agregar opción para nueva categoría
    const nuevaCategoriaOption = document.createElement('option');
    nuevaCategoriaOption.value = '__nueva__';
    nuevaCategoriaOption.textContent = '+ Agregar nueva categoría...';
    selectCategoria.appendChild(nuevaCategoriaOption);
    
    // Separador
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────────';
    selectCategoria.appendChild(separator);
    
    // Agregar categorías existentes
    const categoriasUnicas = [...new Set(categorias.map(cat => cat.trim()))].sort();
    categoriasUnicas.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
        selectCategoria.appendChild(option);
    });
    
    // Restaurar valor anterior si existe
    if (valorActual && categoriasUnicas.includes(valorActual)) {
        selectCategoria.value = valorActual;
    }
    
    // Configurar eventos para manejar la selección de nueva categoría
    selectCategoria.addEventListener('change', function() {
        if (this.value === '__nueva__') {
            mostrarInputNuevaCategoria();
        }
    });
}

// Mostrar input para nueva categoría
function mostrarInputNuevaCategoria() {
    const selectCategoria = document.getElementById('categoria');
    if (!selectCategoria) return;
    
    // Crear contenedor para input
    const inputContainer = document.createElement('div');
    inputContainer.id = 'nueva-categoria-container';
    inputContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 10px;
        align-items: center;
    `;
    
    // Verificar si ya existe un input
    const existingInput = document.getElementById('nueva-categoria-input');
    if (existingInput) {
        existingInput.focus();
        return;
    }
    
    // Crear input para nueva categoría
    const nuevaCategoriaInput = document.createElement('input');
    nuevaCategoriaInput.type = 'text';
    nuevaCategoriaInput.id = 'nueva-categoria-input';
    nuevaCategoriaInput.placeholder = 'Escribe la nueva categoría...';
    nuevaCategoriaInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border: 2px solid #415a77;
        border-radius: 8px;
        font-size: 1rem;
    `;
    
    // Crear botón para agregar
    const agregarBtn = document.createElement('button');
    agregarBtn.textContent = 'Agregar';
    agregarBtn.style.cssText = `
        padding: 10px 20px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    `;
    
    // Crear botón para cancelar
    const cancelarBtn = document.createElement('button');
    cancelarBtn.textContent = 'Cancelar';
    cancelarBtn.style.cssText = `
        padding: 10px 20px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    `;
    
    // Agregar elementos al contenedor
    inputContainer.appendChild(nuevaCategoriaInput);
    inputContainer.appendChild(agregarBtn);
    inputContainer.appendChild(cancelarBtn);
    
    // Insertar después del select
    selectCategoria.parentNode.insertBefore(inputContainer, selectCategoria.nextSibling);
    
    // Enfocar el input
    nuevaCategoriaInput.focus();
    
    // Evento para agregar nueva categoría
    agregarBtn.addEventListener('click', async () => {
        await agregarNuevaCategoria(nuevaCategoriaInput.value.trim());
    });
    
    // Evento para presionar Enter en el input
    nuevaCategoriaInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await agregarNuevaCategoria(nuevaCategoriaInput.value.trim());
        }
    });
    
    // Evento para cancelar
    cancelarBtn.addEventListener('click', () => {
        inputContainer.remove();
        selectCategoria.value = '';
    });
    
    // Validar en tiempo real
    nuevaCategoriaInput.addEventListener('input', validarNuevaCategoriaEnTiempoReal);
}

// Validar nueva categoría en tiempo real
function validarNuevaCategoriaEnTiempoReal(e) {
    const input = e.target;
    const categoria = input.value.trim();
    
    // Si está vacío, no mostrar error
    if (!categoria) {
        input.style.borderColor = '#415a77';
        return;
    }
    
    // Validar que solo contenga letras y espacios
    const regexCategoria = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
    
    if (!regexCategoria.test(categoria)) {
        input.style.borderColor = '#dc3545';
        input.style.borderWidth = '2px';
    } else if (categoria.length < 2) {
        input.style.borderColor = '#dc3545';
        input.style.borderWidth = '2px';
    } else if (categoria.length > 50) {
        input.style.borderColor = '#dc3545';
        input.style.borderWidth = '2px';
    } else {
        input.style.borderColor = '#28a745';
        input.style.borderWidth = '2px';
    }
}

// Agregar nueva categoría a la base de datos
async function agregarNuevaCategoria(nombreCategoria) {
    const selectCategoria = document.getElementById('categoria');
    const inputContainer = document.getElementById('nueva-categoria-container');
    
    // Validaciones
    if (!nombreCategoria) {
        mostrarMensaje('Por favor escribe un nombre para la categoría', 'error');
        return;
    }
    
    const regexCategoria = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
    if (!regexCategoria.test(nombreCategoria)) {
        mostrarMensaje('La categoría solo puede contener letras y espacios', 'error');
        return;
    }
    
    if (nombreCategoria.length < 2) {
        mostrarMensaje('La categoría debe tener al menos 2 caracteres', 'error');
        return;
    }
    
    if (nombreCategoria.length > 50) {
        mostrarMensaje('La categoría no puede tener más de 50 caracteres', 'error');
        return;
    }
    
    // Verificar si ya existe
    if (categoriasExistentes.includes(nombreCategoria.toLowerCase())) {
        mostrarMensaje('Esta categoría ya existe', 'error');
        selectCategoria.value = nombreCategoria;
        if (inputContainer) inputContainer.remove();
        return;
    }
    
    mostrarMensaje('Creando nueva categoría...', 'info');
    
    try {
        const payload = {
            categoriaProducto: nombreCategoria
        };
        
        const response = await authFetch('/categoriaProducto/crearCategoriaProducto', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Agregar la nueva categoría a la lista
            categoriasExistentes.push(nombreCategoria);
            
            // Actualizar el select
            actualizarSelectCategorias(categoriasExistentes);
            
            // Seleccionar la nueva categoría
            selectCategoria.value = nombreCategoria;
            
            // Eliminar el input
            if (inputContainer) inputContainer.remove();
            
            mostrarMensaje('✅ Categoría creada exitosamente', 'success');
        } else {
            mostrarMensaje(`Error: ${data.message || 'No se pudo crear la categoría'}`, 'error');
        }
    } catch (error) {
        console.error('Error al crear categoría:', error);
        mostrarMensaje('Error de conexión al crear categoría', 'error');
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
        const resultado = await buscarProductoPorId(productoId);
        
        if (resultado.success) {
            cargarDatosEnFormulario(resultado.producto);
            mostrarMensaje('Producto cargado correctamente', 'success');
        } else {
            mostrarMensaje('No se pudo cargar el producto. Puedes buscarlo arriba.', 'error');
            // Dejar el campo de folio vacío para búsqueda manual
            document.getElementById('folio').value = '';
        }
    }
}

// Buscar producto por ID o nombre
async function buscarProductoPorId(id) {
    try {
        const response = await authFetch('/inventario/verInventario', {
            method: 'GET'
        });
        
        if (response.ok) {
            const productos = await response.json();
            
            // Buscar el producto por ID (exacto) o nombre (parcial)
            const productoEncontrado = productos.find(p => 
                p.idProducto === id.toString() || 
                p.nombre.toLowerCase().includes(id.toLowerCase())
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

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('folio').disabled = false;
    document.getElementById('folio').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('activo').value = 'si';
    
    // Eliminar input de nueva categoría si existe
    const nuevaCategoriaContainer = document.getElementById('nueva-categoria-container');
    if (nuevaCategoriaContainer) {
        nuevaCategoriaContainer.remove();
    }
}

// Cargar datos del producto en el formulario
function cargarDatosEnFormulario(producto) {
    document.getElementById('folio').value = producto.idProducto;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    
    // Establecer categoría
    const categoriaSelect = document.getElementById('categoria');
    if (categoriaSelect && producto.categoria) {
        // Buscar si la categoría existe en las opciones
        const categoriaNormalizada = producto.categoria.trim();
        for (let option of categoriaSelect.options) {
            if (option.value === categoriaNormalizada) {
                categoriaSelect.value = categoriaNormalizada;
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
        // Verificar si la categoría está vacía
        if (!datosActualizados.categoria || datosActualizados.categoria.trim() === '') {
            console.error('❌ Error: Categoría vacía en datosActualizados');
            return {
                success: false,
                error: 'La categoría es requerida'
            };
        }
        
        const categoriaActual = datosActualizados.categoria.trim();
                
        // Filtro solo los campos que tienen valor
        const camposParaActualizar = {};
        
        if (datosActualizados.nombre && datosActualizados.nombre.trim() !== '') {
            camposParaActualizar.nombre = datosActualizados.nombre.trim();
        }
        
        if (datosActualizados.precio !== undefined && datosActualizados.precio !== '') {
            camposParaActualizar.precio = parseFloat(datosActualizados.precio);
            if (isNaN(camposParaActualizar.precio)) {
                return {
                    success: false,
                    error: 'El precio debe ser un número válido'
                };
            }
        }
        
        if (datosActualizados.stock !== undefined && datosActualizados.stock !== '') {
            camposParaActualizar.stock = parseInt(datosActualizados.stock);
            if (isNaN(camposParaActualizar.stock)) {
                return {
                    success: false,
                    error: 'El stock debe ser un número válido'
                };
            }
        }
        
        // SIEMPRE incluir la categoría si tiene valor
        if (categoriaActual && categoriaActual !== '') {
            camposParaActualizar.categoria = categoriaActual;
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
                message: data.massage || data.message || 'Producto actualizado correctamente',
                producto: data.producto
            };
        } else {
            return {
                success: false,
                error: data.message || data.massage || 'Error al actualizar el producto'
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

// Crear nueva categoría en la base de datos
async function crearNuevaCategoria(nombreCategoria) {
    try {
        const payload = {
            categoriaProducto: nombreCategoria.trim()
        };
        
        const response = await authFetch('/categoriaProducto/crearCategoriaProducto', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return {
                success: true,
                categoria: nombreCategoria
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
        
        // CORRECCIÓN: Declara categoriaSelect primero
        const folio = document.getElementById('folio').value;
        const nombre = document.getElementById('nombre').value;
        const precio = document.getElementById('precio').value;
        const stock = document.getElementById('stock').value;
        const categoriaSelect = document.getElementById('categoria');
        const categoria = categoriaSelect ? categoriaSelect.value : '';
        const activo = document.getElementById('activo').value;

        // Depuración de opciones del select 
        if (categoriaSelect) {
            for (let i = 0; i < categoriaSelect.options.length; i++) {
                const option = categoriaSelect.options[i];
            }
        }
        
        // Validaciones
        if (!folio) {
            mostrarMensaje('Primero debes buscar y seleccionar un producto', 'error');
            return;
        }
        
        if (!categoria || categoria === '' || categoria === '-- Selecciona una categoría --') {
            console.error('❌ Error de validación: Categoría inválida o no seleccionada');
            mostrarMensaje('Por favor selecciona una categoría válida', 'error');
            return;
        }
        
        // Comparación pa' ver si existe
        const categoriaExiste = categoriasExistentes.some(cat => 
            cat.toLowerCase() === categoria.toLowerCase()
        );

        if (categoria === '__nueva__') {
            const nuevaCategoriaInput = document.getElementById('nueva-categoria-input');
            if (nuevaCategoriaInput && nuevaCategoriaInput.value.trim() !== '') {
                mostrarMensaje('Por favor haz clic en "Agregar" para confirmar la nueva categoría', 'error');
                return;
            } else {
                mostrarMensaje('Por favor escribe y agrega una nueva categoría', 'error');
                return;
            }
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

// Botón pa' volver a Inventario
function configurarBotonVolver() {
    const botonVolver = document.createElement('button');
    botonVolver.id = 'volverBtn';
    botonVolver.textContent = vieneDeInventario ? '← Volver al Inventario' : '← Volver al Dashboard';
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
        window.location.href = vieneDeInventario ? 'inventario.html' : 'dashboard.html';
    });
    
    document.body.appendChild(botonVolver);
}

async function verificarInventarioVacio() {
    try {
        const response = await authFetch('/inventario/verInventario', {
            method: 'GET'
        });
        
        if (response.ok) {
            const productos = await response.json();
            
            if (!productos || productos.length === 0) {
                deshabilitarFormularioPorInventarioVacio();
            } else {
                habilitarFormulario();
            }
        } else {
            console.error('Error al verificar inventario:', response.status);
        }
    } catch (error) {
        console.error('Error al verificar inventario:', error);
        // Por precaución, deshabilitar el formulario si hay error
        deshabilitarFormularioPorInventarioVacio();
    }
}

function deshabilitarFormularioPorInventarioVacio() {
    const formulario = document.getElementById('edit-product-form');
    const searchContainer = document.getElementById('search-container');
    const mensajeContainer = document.getElementById('inventario-vacio-mensaje');
    
    // Si ya existe un mensaje, no hacemo na'
    if (mensajeContainer) return;
    
    // Deshabilitar el formulario
    const inputs = formulario.querySelectorAll('input, select, button[type="submit"]');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.6';
        input.style.cursor = 'not-allowed';
    });
    
    // Deshabilitar la barra de búsqueda si existe
    if (searchContainer) {
        const searchInputs = searchContainer.querySelectorAll('input, button');
        searchInputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.6';
            input.style.cursor = 'not-allowed';
        });
    }
    
    // Mensaje informativo
    const mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'inventario-vacio-mensaje';
    mensajeDiv.style.cssText = `
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    mensajeDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
            <span style="font-size: 2rem; color: #ff9800;">⚠️</span>
            <div style="text-align: left;">
                <h3 style="margin: 0; color: #856404; font-size: 1.3rem;">Inventario Vacío</h3>
                <p style="margin: 5px 0 0 0; color: #856404;">
                    No hay productos disponibles para editar. 
                    Primero debes agregar productos al inventario.
                </p>
            </div>
        </div>
        <div style="margin-top: 15px;">
            <button id="btn-ir-a-crear" style="
                padding: 10px 25px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1rem;
                transition: all 0.3s ease;
            ">
                ➕ Ir a Crear Producto
            </button>
            <button id="btn-recargar" style="
                padding: 10px 25px;
                background-color: #17a2b8;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1rem;
                margin-left: 10px;
                transition: all 0.3s ease;
            ">
                🔄 Recargar Inventario
            </button>
        </div>
    `;
    
    // Insertar mensaje después del formulario
    formulario.parentNode.insertBefore(mensajeDiv, formulario.nextSibling);
    
    // Agregar eventos a los botones
    document.getElementById('btn-ir-a-crear').addEventListener('click', function() {
        window.location.href = 'crearProducto.html'; // Ajusta esta ruta según tu aplicación
    });
    
    document.getElementById('btn-recargar').addEventListener('click', function() {
        this.disabled = true;
        this.textContent = 'Verificando...';
        verificarInventarioVacio();
    });
    
    // 4. También deshabilitar el botón de volver si existe
    const volverBtn = document.getElementById('volverBtn');
    if (volverBtn) {
        volverBtn.style.backgroundColor = '#95a5a6';
    }
    
    // Mostrar mensaje en consola
    mostrarMensaje('⚠️ El inventario está vacío. Agrega productos primero.', 'error');
}

// Habilitar formulario cuando sí hay productos
function habilitarFormulario() {
    const formulario = document.getElementById('edit-product-form');
    const searchContainer = document.getElementById('search-container');
    const mensajeContainer = document.getElementById('inventario-vacio-mensaje');
    
    // formulario
    const inputs = formulario.querySelectorAll('input, select, button[type="submit"]');
    inputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
        input.style.cursor = '';
    });
    
    // barra de búsqueda (si existe)
    if (searchContainer) {
        const searchInputs = searchContainer.querySelectorAll('input, button');
        searchInputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
            input.style.cursor = '';
        });
    }
    
    // Eliminar mensaje si existe
    if (mensajeContainer) {
        mensajeContainer.remove();
    }
    
    // Restaurar botón de volver
    const volverBtn = document.getElementById('volverBtn');
    if (volverBtn) {
        volverBtn.style.backgroundColor = '#607d8b';
    }
}

document.addEventListener('DOMContentLoaded', inicializarPagina);