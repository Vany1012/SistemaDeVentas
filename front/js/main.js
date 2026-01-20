const API_URL = 'http://localhost:3000/api';
const loginForm = document.getElementById('login-formulario');

// Para checar si hay una sesión iniciada
const checkSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
        window.location.href = 'dashboard.html';
    }
};
checkSession();

// Para iniciar sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(`${API_URL}/vendedor/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('userSession', JSON.stringify(data));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor. Intenta más tarde.');
    }
});