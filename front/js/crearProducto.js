
const API_URL = 'http://localhost:3000/api/inventario';
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");
// BLOQUEO DE SEGURIDAD
// Si no hay token O el rol no es admin, lo sacamos de la página
if (!token || role !== 'admin') {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}

const Productform = document.querySelector('#producto-form');
const nombreInput = document.querySelector('#nombre');
const idProductoInput = document.querySelector('#idProducto');
const precioInput = document.querySelector('#precio');
const stockInput = document.querySelector('#stock');
const categoriaInput = document.querySelector('#categoria');
const activoInput = document.querySelector('#active');

// Función principal para Crear Producto
const createProduct = async () => {
    // Validaciones básicas
    if (!idProductoInput.value.trim()) {
        alert('Por favor ingresa un folio del producto');
        return;
    }
    
    if (!nombreInput.value.trim()) {
        alert('Por favor ingresa un nombre del producto');
        return;
    }
    
    // Validar que precio y stock sean números válidos
    const precio = parseFloat(precioInput.value);
    const stock = parseInt(stockInput.value);
    
    if (isNaN(precio) || precio < 0) {
        alert('Por favor ingresa un precio válido');
        return;
    }

     if (isNaN(stock) || stock < 0) {
        alert('Por favor ingresa un stock válido');
        return;
    }

    // Preparar el Payload (Datos)
    const payload = {
        idProducto: idProductoInput.value.trim(),
        nombre: nombreInput.value.trim(),
        precio: Number(precioInput.value), // Convertir a Numero
        stock: Number(stockInput.value),   // Convertir a Numero
        categoria: categoriaInput.value,
        activo: activoInput.value 
    };

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
            alert(`¡Producto "${data.nombre || 'nuevo'}" creado exitosamente!`);
            Productform.reset(); // Limpia el formulario
        } else {
            // error( ID duplicado)
            alert(`Error: ${data.message || 'No se pudo crear el producto'}`);
            console.error('Detalle del error:', data);
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
}