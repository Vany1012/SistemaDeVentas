const API_URL = 'http://localhost:3000/api';

// Verificar autenticación en páginas protegidas
function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    console.log('🔍 Verificando autenticación...');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('UserData:', userData ? 'Presente' : 'Ausente');
    
    if (!token || !userData) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('✅ Usuario autenticado:', user.vendedorName, '- Rol:', user.role);
        return { authenticated: true, user: user };
    } catch (error) {
        console.error('❌ Error parseando userData:', error);
        return { authenticated: false, user: null };
    }
}

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

// Verificar si el usuario es admin
function isAdmin() {
    const userData = checkAuth();
    return userData && userData.role === 'admin';
}

// Cargar datos del usuario en la interfaz
function loadUserProfile() {
    const userData = checkAuth();
    if (!userData) return;
    
    // Actualizar elementos del DOM con datos del usuario
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(el => {
        el.textContent = userData.role === 'admin' ? 'Administrador' : 'Vendedor';
    });
    
    // También podrías mostrar el nombre del usuario
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = userData.vendedorName || 'Usuario';
    });
}

// Función para hacer peticiones autenticadas
async function authFetch(url, options = {}) {
    const token = getAuthToken();
    
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
    
    // Si la respuesta es 401 (no autorizado), redirigir al login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
        throw new Error('Sesión expirada');
    }
    
    return response;
}

// Exportar funciones si usas módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuth,
        getAuthToken,
        getAuthHeaders,
        isAdmin,
        loadUserProfile,
        authFetch
    };
}