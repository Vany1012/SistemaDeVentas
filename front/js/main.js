const API_URL = 'http://localhost:3000/api';
const loginForm = document.getElementById('login-formulario');

// Para checar si hay una sesión iniciada
const checkSession = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    // SOLO en index.html, si ya hay sesión, ya redirige al dashboard
    if (token && userData) {
        console.log('Sesión existente detectada. Redirigiendo a dashboard');
        window.location.href = 'dashboard.html';
    }
};
checkSession();

// Para iniciar sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Deshabilita el btn durante login
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Iniciando sesión...';
    
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
            console.log('✅ Login exitoso:', data);
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify({
                vendedorId: data.vendedorId,
                vendedorName: data.vendedorName,
                email: data.email,
                role: data.role
            }));
            
            alert('✅ ¡Inicio de sesión exitoso!');
            
            window.location.href = 'dashboard.html';
            
        } else {
            alert(data.message || '❌ Error al iniciar sesión. Verifica tus credenciales.');
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('⚠️ No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000');
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});