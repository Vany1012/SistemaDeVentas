// js/registrarUsuario.js

document.getElementById('registrarUsuario-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Evita que la página se recargue


    //Verificar si el admin está logueado
    // Asumo que cuando haces login, guardas el token en localStorage con el nombre 'token'
    const token = localStorage.getItem('token'); 

    if (!token) {
        alert('No estás autorizado. Debes iniciar sesión como Admin primero.');
        window.location.href = '/login.html'; // Redirigir al login si no hay token
        return;
    }
    // 1. Capturar los valores
    const data = {
        vendedorName: document.getElementById('vendedorName').value,
        vendedorId: document.getElementById('vendedorId').value, // La matrícula
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        // Convertimos el string "true"/"false" a booleano real
        active: document.getElementById('active').value === 'true' 
    };

    try {
        // 2. Enviar al Backend (Asumiendo que tu servidor corre en localhost:3000)
        const response = await fetch('http://localhost:3000/api/vendedores', { 
    //Corregir direccion del servidor!!!!!!!!
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Usuario creado con éxito');
            // Opcional: limpiar formulario
            document.getElementById('registrarUsuario-form').reset();
        } else {
            alert('Error: ' + (result.message || 'Error desconocido'));
        }

    } catch (error) {
        console.error('Error de red:', error);
        alert('Hubo un problema conectando con el servidor');
    }
});