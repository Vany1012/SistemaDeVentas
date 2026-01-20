

const formulario = document.getElementById('registrarUsuario-form');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que se recargue la página
/*
    // 1. Obtener el token del administrador (si usas autenticación)
    const token = localStorage.getItem('token'); 

    // Si tu middleware 'protect' es estricto, necesitas esto:
    if (!token) {
        alert('Error: No has iniciado sesión. Necesitas ser admin para registrar usuarios.');
        // window.location.href = 'login.html'; // Descomenta para redirigir
        return;
    }*/

    // 2. Armar el objeto con los datos (IDs del HTML)
    const nuevoUsuario = {
        vendedorName: document.getElementById('vendedorName').value,
        vendedorId: document.getElementById('vendedorId').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        // Convertimos el string "true" a booleano true
        active: document.getElementById('active').value === 'true'
    };

    try {
        // 3. Petición al Backend
        const respuesta = await fetch('http://localhost:3000/api/vendedor/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Enviamos el token para pasar el middleware "protect"
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(nuevoUsuario)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert('¡Usuario registrado exitosamente!');
            formulario.reset(); // Limpia los campos
        } else {
            // Muestra el error que envía el backend (ej: "Usuario ya existe")
            alert('Error: ' + (data.message || data.error || 'Algo salió mal'));
        }

    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
    }
});