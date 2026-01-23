
const API_URL = 'http://localhost:3000/api/inventario';
const userData = JSON.parse(localStorage.getItem('userData'));
const token = localStorage.getItem("token");


const Productform = document.querySelector('#producto-form');
const nombreInput = document.querySelector('#nombre');
//const idProductoInput = document.querySelector('#idProducto');
const precioInput = document.querySelector('#precio');
const stockInput = document.querySelector('#stock');
const categoriaInput = document.querySelector('#categoria');
const activoInput = document.querySelector('#active');

// BLOQUEO DE SEGURIDAD
// Si no hay token O el rol no es admin, lo sacamos de la página
if (!token || userData.role !== 'admin') {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}
// Constantes para mensajes de Error
const nombreAlert = document.querySelector('#nombre-alert');
const precioAlert = document.querySelector('#precio-alert');
const stockAlert = document.querySelector('#stock-alert');
const generalAlert = document.querySelector('#general-alert');

// 2. Función para limpiar mensajes
const limpiarMensajes = () => {
    if(nombreAlert) nombreAlert.textContent = '';
    if(precioAlert) precioAlert.textContent = '';
    if(stockAlert) stockAlert.textContent = '';
    
    if(generalAlert) {
        generalAlert.textContent = '';
        generalAlert.className = ''; // Resetear clases
        generalAlert.removeAttribute('style');
    }
};

// Función principal para Crear Producto
const createProduct = async () => {
    //Limpiar mensajes
    limpiarMensajes(); // Limpiamos errores previos

    // --- Validaciones Locales ---
    let hayErrores = false;
    const nombreValue = nombreInput.value.trim();
    const precioValue = parseFloat(precioInput.value);
    const stockValue = parseInt(stockInput.value);

    // Validar Nombre
    if (!nombreValue) {
        if(nombreAlert) nombreAlert.textContent = "El nombre es obligatorio.";
        if(nombreAlert) nombreAlert.style.color = "red";
        hayErrores = true;
    }

    // Validar Precio
    if (isNaN(precioValue) || precioValue < 0) {
        if(precioAlert) precioAlert.textContent = "Ingresa un precio válido (mayor o igual a 0).";
        if(precioAlert) precioAlert.style.color = "red";
        hayErrores = true;
    }

    // Validar Stock
    if (isNaN(stockValue) || stockValue < 0) {
        if(stockAlert) stockAlert.textContent = "Ingresa un stock válido (entero positivo).";
        if(stockAlert) stockAlert.style.color = "red";
        hayErrores = true;
    }
    if (hayErrores) return; // Si hay errores, detenemos aquí.

// Formatear Categoría
    const categoriaRaw = categoriaInput.value.trim();
    const categoriaFormateada = categoriaRaw 
        ? categoriaRaw.charAt(0).toUpperCase() + categoriaRaw.slice(1).toLowerCase() 
        : 'General';

    // Preparar el Payload (Datos)
    const payload = {
        //idProducto: idProductoInput.value.trim(),
        nombre: nombreInput.value.trim(),
        precio: Number(precioInput.value), // Convertir a Numero
        stock: Number(stockInput.value),   // Convertir a Numero
        categoria: categoriaInput.value,
        activo: activoInput.value === 'true'
    };
    console.log("Enviando:", payload);


    // Procesando
    if(generalAlert) {
        generalAlert.textContent = "Guardando producto...";
        generalAlert.style.color = "blue";
    }

    try {
        const response = await fetch(`${API_URL}/crearProducto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Header para el middleware 'protect'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            //Producto guardado con exito
            if(generalAlert) {
                generalAlert.textContent = "¡Producto creado exitosamente!";
                generalAlert.style.color = "green";
                generalAlert.classList.add('success-text');
            }
            if(generalAlert) {
                generalAlert.textContent += ` | Folio asignado: ${data.idProducto}`;
                generalAlert.innerHTML = `
                    <div style="text-align: left;">
                        <h3 style="margin: 0 0 10px 0;">¡Producto creado exitosamente!</h3>
                        <strong>Folio:</strong> ${data.idProducto || 'Generado'}<br>
                        <strong>Nombre:</strong> ${payload.nombre}<br>
                        <strong>Precio:</strong> $${payload.precio.toFixed(2)}<br>
                        <strong>Stock:</strong> ${payload.stock} unidades<br>
                        <strong>Categoría:</strong> ${payload.categoria}<br>
                        <strong>Activo:</strong> ${payload.activo ? 'Sí' : 'No'}
                    </div>
                `;

                // Aplicamos estilos de tarjeta de éxito (verde claro)
                generalAlert.style.color = "#155724";            // Texto verde oscuro
                generalAlert.style.backgroundColor = "#d4edda";  // Fondo verde claro
                generalAlert.style.borderColor = "#c3e6cb";      // Borde verde
                generalAlert.style.borderWidth = "1px";
                generalAlert.style.borderStyle = "solid";
                generalAlert.style.padding = "15px";
                generalAlert.style.borderRadius = "5px";
                generalAlert.style.marginTop = "15px";
            
            }



            Productform.reset()
            setTimeout(() => { generalAlert.textContent = '';generalAlert.removeAttribute('style'); }, 5000);//Muestra el producto guardado y lo limpia despues de 5 seg
        } else {
            // Error del servidor
            if(generalAlert) {
                if (data.message) {
                     generalAlert.textContent = `Error: ${data.message}`;
                } else {
                     generalAlert.textContent = "No se pudo crear el producto. Verifique los datos.";
                }
                generalAlert.style.color = "red";
            }
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Hubo un problema conectando con el servidor.');
    }
};


if (Productform) {
    Productform.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createProduct();
    });
    // Limpiar errores
    nombreInput.addEventListener('input', () => { if(nombreAlert) nombreAlert.textContent = ''; });
    precioInput.addEventListener('input', () => { if(precioAlert) precioAlert.textContent = ''; });
    stockInput.addEventListener('input', () => { if(stockAlert) stockAlert.textContent = ''; });
}