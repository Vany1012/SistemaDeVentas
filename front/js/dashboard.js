document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificación de sesión
    const user = checkAuth(); // Asumiendo que esta función está en authentification.js
    if (!user) return;

    // 2. Mostrar nombre y rol
    const userNameElement = document.getElementById('user-role');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData && userNameElement) {
        userNameElement.textContent = `Bienvenido, ${userData.vendedorName} (${userData.role})`;
    }

    // 3. Control de permisos
    const adminElements = document.querySelectorAll('.admin-exclusive');
    if (userData && userData.role !== 'admin') {
        adminElements.forEach(el => el.remove()); // .remove() es más seguro que display:none
    }

    // 4. Menú Hamburguesa
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('hamburgerLinks');

    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        menuBtn.classList.toggle('fa-bars');
        menuBtn.classList.toggle('fa-times');
    });
});