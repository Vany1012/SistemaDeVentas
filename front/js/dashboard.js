const logoutBtn = document.getElementById('logoutBtn');
const userNameElement = document.getElementById('user-role');
const userData = JSON.parse(localStorage.getItem('userData'));
const adminElements = document.querySelectorAll('.admin-exclusive');
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('hamburgerLinks');

document.addEventListener('DOMContentLoaded', () => {
    // Verificación de sesión
    const user = checkAuth();
    if (!user) return;

    // Mostrar nombre
    if (userData && userNameElement) {
        userNameElement.textContent = `Bienvenido, ${userData.vendedorName}`;
    }

    // Control de permisos
    if (userData && userData.role !== 'admin') {
        adminElements.forEach(el => el.remove());
    }

    // Menú Hamburguesa
    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        menuBtn.classList.toggle('fa-bars');
        menuBtn.classList.toggle('fa-times');
    });
});

// Cerrar sesión
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});