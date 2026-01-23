// Verificar autenticación en páginas protegidas
function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    console.log('Verificando autenticación...');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('UserData:', userData ? 'Presente' : 'Ausente');
    
    if (!token || !userData) {
        // Si no hay sesión, redirigir al login
        console.log('❌ No autenticado, redirigiendo a login...');
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('✅ Usuario autenticado:', user.vendedorName, '- Rol:', user.role);
        return user;
    } catch (error) {
        console.error('❌ Error parseando userData:', error);
        window.location.href = 'index.html';
        return null;
    }
}

// Verificación de permiso ONLY Admin -> devuelve el user sólo cuando user.role es admin
function checkAdminAuth() {
    const user = checkAuth();

    if (!user){
        return null;
    };

    if(user.role !== 'admin') {
        alert('Acceso restringido a SOLO Admin.');
        window.location.href = 'dashboard.html';
        return null;
    };

    return user;
};

// Obtener el token para las peticiones
function getAuthToken() {
    return localStorage.getItem('token');
}

// Configurar headers de autenticación para fetch
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Verificar si usuario es admin
function isAdmin() {
    const user = checkAuth();  // usuario o null
    return user && user.role === 'admin';
}

// Cargar datos del usuario en la interfaz
function loadUserProfile() {
    const user = checkAuth();
    if (!user) return;
    
    // Actualizar elementos del DOM con datos del usuario
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(el => {
        el.textContent = user.role === 'admin' ? 'Administrador' : 'Vendedor';
        el.style.cssText = `
            background-color: ${user.role === 'admin' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            margin-left: 10px;
        `;
    });
    
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = user.vendedorName || 'Usuario';
    });
}

// Función para hacer peticiones autenticadas
async function authFetch(url, options = {}) {
    const token = getAuthToken();
    
    // Sin globito (token) no hay fiesta
    if (!token) {
        console.error('No hay Token de Autentificación') // por cualquier razón que se remueva el token
        window.location.href = 'index.html'; // que vuelva a iniciar sesión
        throw new Error('No autentificado.');
    };

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(`${API_URL}${url}`, mergedOptions);
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
        throw new Error('Sesión expirada');
    }
    
    return response;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// funciones globales
window.checkAuth = checkAuth;
window.getAuthToken = getAuthToken;
window.getAuthHeaders = getAuthHeaders;
window.isAdmin = isAdmin;
window.loadUserProfile = loadUserProfile;
window.authFetch = authFetch;
window.logout = logout;