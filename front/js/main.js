const API_URL = 'http://localhost:3000/api';
const loginForm = document.getElementById('login-formulario');
const messageContainer = document.getElementById('message-container');
const loginBtn = document.getElementById('button-login');
const originalText = loginBtn.textContent;

// Para checar si hay una sesión iniciada
const checkSession = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    // SOLO en index.html, si ya hay sesión, redirige al dashboard
    if (token && userData) {
        window.location.href = 'dashboard.html';
    }
};
checkSession();

// Para mostrar mensajes
const showMessage = (text, isError = true) => {
    messageContainer.textContent = text;
    messageContainer.className = isError ? 'error-message' : 'success-message';
};

// Para iniciar sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Iniciando sesión...';
    messageContainer.textContent = '';

    try {
        const response = await fetch(`${API_URL}/vendedor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify({
                vendedorId: data.vendedorId,
                vendedorName: data.vendedorName,
                email: data.email,
                role: data.role
            }));
            window.location.href = 'dashboard.html';
        } else {
            showMessage(data.message || 'Credenciales incorrectas');
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
        }
    } catch (error) {
        showMessage('Error de conexión con el servidor');
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});