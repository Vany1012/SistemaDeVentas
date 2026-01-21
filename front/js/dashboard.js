document.addEventListener('DOMContentLoaded', () => {

    const user = checkAuth();
    if (!user) return;

    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('hamburgerLinks');

    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        if(menu.classList.contains('active')) {
            menuBtn.classList.remove('fa-bars');
            menuBtn.classList.add('fa-times');
        } else {
            menuBtn.classList.add('fa-bars');
            menuBtn.classList.remove('fa-times');
        }
    });
});

const userName = document.getElementById('user-role');
const adminExclusive = document.querySelectorAll('.admin-exclusive');
const userData = JSON.parse(localStorage.userData);

userData.innerHTML = `Bienvenido, ${userData.vendedorName}`;
if (userData.role !== 'admin') {
    adminExclusive.forEach(element => {
        element.style.display = 'none';
    });
};