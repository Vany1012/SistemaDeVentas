const logoutBtn = document.getElementById('logoutBtn');
const userNameElement = document.getElementById('user-role');
const userData = JSON.parse(localStorage.getItem('userData'));
const adminElements = document.querySelectorAll('.admin-exclusive');
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('hamburgerLinks');

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    if (userData && userNameElement) {
        userNameElement.textContent = `Bienvenido, ${userData.vendedorName}`;
    }

    if (userData && userData.role !== 'admin') {
        adminElements.forEach(el => el.remove());
    }
});