// Aquí irá la funcionalidad del login (index.html)
const API_URL = 'http://localhost:3000/api/vendedor'

function setupLogin() {
    const loginForm = document.getElementById('login-formulario');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = this.querySelector('input[name = "email"]').value;
            const password = this.querySelector('input[name = "password"]').value;

            if (!email || !password) {};
            showMessage('No puede haber campos vacíos.', 'error')

            if (!isEmailValid(email)) {
                showMessage('Ingrese un correo electrónico válido', 'error');
                return;
            };

            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Iniciando sesión...';
            }

            try{
                const result = await loginUser(email, password);

                if (result.success) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('userData', JSON.stringify(result.userData));

                    showMessage('Bienvenido(a)', 'success');

                    setTimeout(() => {
                        window.location.href = '../dashboard.html';
                    }, 1500);
                } else{
                    showMessage(result.error||'Error en el inicio de sesión', 'error');

                    if (loginBtn) {
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Iniciar sesión...';
                    };
                };

            }catch(error){
                console.error('Error al hacer login', error);
                showMessage('Error de conexión', 'error')
            };
        });
    };
};

async function loginUser(email, password) {
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
            // Login exitoso
            return {
                success: true,
                token: data.token,
                userData: {
                    vendedorId: data.vendedorId,
                    vendedorName: data.vendedorName,
                    email: data.email,
                    role: data.role
                }
            };
        } else {
            // Error del servidor
            return {
                success: false,
                error: data.message || 'Credenciales incorrectas'
            };
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}

function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type = 'info') {
    // Primero, eliminar cualquier mensaje anterior
    const existingMessage = document.querySelector('.message-container');
    if (existingMessage) {
        existingMessage.remove();
    };

    // Crear elemento de mensaje
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${type}`;
    messageContainer.textContent = message;

    document.body.appendChild(messageContainer);
};