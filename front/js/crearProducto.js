
const API_URL = 'http://localhost:3000/api/inventario';
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");
// BLOQUEO DE SEGURIDAD
// Si no hay token O el rol no es admin, lo sacamos de la página
if (!token || role !== 'admin') {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}

const form = document.querySelector('#producto-form');
const nombreInput = document.querySelector('#nombre');
const idProductoInput = document.querySelector('#idProducto');
const precioInput = document.querySelector('#precio');
const stockInput = document.querySelector('#stock');
const categoriaInput = document.querySelector('#categoria');
const activoInput = document.querySelector('#activo');

// 3. Función Principal para Crear Producto
const createProduct = async () => {
    
    // Validar autenticación
    if (!token) {
        alert("No estás autorizado. Inicia sesión como vendedor.");
        window.location.href = 'login.html'; // Redirección opcional
        return;
    }

    // Preparar el Payload (Datos)
    const payload = {
        idProducto: idProductoInput.value.trim(),
        nombre: nombreInput.value.trim(),
        precio: Number(precioInput.value), // Convertir a Numero
        stock: Number(stockInput.value),   // Convertir a Numero
        categoria: categoriaInput.value,
        activo: activoInput.value === 'true' 
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
            form.reset(); // Limpia el formulario
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


if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createProduct();
    });
}