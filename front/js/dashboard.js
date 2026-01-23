document.addEventListener('DOMContentLoaded', () => {
    // Verificación de sesión
    const user = checkAuth();
    if (!user) return;

    // Nombre y rol
    const userNameElement = document.getElementById('user-role');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData && userNameElement) {
        userNameElement.textContent = `Bienvenido, ${userData.vendedorName} (${userData.role})`;
    }

    // Control de permisos
    const adminElements = document.querySelectorAll('.admin-exclusive');
    if (userData && userData.role !== 'admin') {
        adminElements.forEach(el => el.remove()); // .remove() es más seguro que display:none
    }

    // Menú Hamburguesa
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('hamburgerLinks');

    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        menuBtn.classList.toggle('fa-bars');
        menuBtn.classList.toggle('fa-times');
    });
});